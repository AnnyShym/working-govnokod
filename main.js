const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const fs = require('fs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIO = require('socket.io');
const say = require('say');
const moment = require('moment');

const config = require('./modules/config');
const joinArrayIntoQuery = require('./modules/join_array');

const app = express();
var server = http.Server(app);
var io = socketIO(server);
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(cookieParser());

// Some server info
const PORT = 8080;

// Some DB info
const DB_NAME = 'episodia';
// const TABLES = ['administrators', 'users', 'series', 'seasons', 'episodes', 'actors', 'actorsinseries', 'ratings'];
const roles = {
    ADMIN: 'Administrator',
    USER: 'User'
}

// Some location information
// const DB_LOCATION = './public/create_tables.sql';
const ROUTES_DIR = './routes/';

// Status codes
const statusCodes = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    PARTIAL_CONTENT: 206,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
}

// Status messages
const INTERNAL_ERROR_MSG = 'Oops, some internal issues occured... Please, try again!';
const NOT_UNIQUE_MSG = 'Such record already exists!';
const NOT_UNIQUE_USER_MSG = 'Such user already exists!';
const INVALID_ID_MSG = 'Invalid identifier!';
const UNAUTHORIZED_MSG = 'Please, sign up first!';
const FORBIDDEN_USER_MSG = 'Please, sign in as an administrator first!';
const FORBIDDEN_ADMIN_MSG = 'Please, sign in as an user first!';

// Logs
const SERVER_LOG = `Server started on port ${PORT}.`;
const CONNECTION_LOG = 'MySql database was connected.';

// Connecting to the DB
// const CONNECTION_STR = 'mysql://root:root@192.168.99.100:3307/series_db?charset=utf8_general_ci&timezone=-0700';
const db = mysql.createConnection({
    host: 'localhost',
    port: 3308,
    user: 'root',
    password: '',
    database: DB_NAME,
    charset: 'utf8mb4'
});

db.connect((err) => {
    if (err) {
        throw(err);
    }
    console.log(CONNECTION_LOG);
});

// // Creating the tables
// const sqlFile = fs.readFileSync(DB_LOCATION).toString();
// const arrSql = sqlFile.split('\r\n\r\n');
// for (let i in arrSql) {
//     const query = db.query(arrSql[i], (err, results) => {
//         if (err) {
//             throw(err);
//         }
//     });
// }

// Customizing the validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

    while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
    }
    return {
        param : formParam,
        msg   : msg,
        value : value
    };
  }
}));

// Some functions for export
function selectAllRows(table, orderBy, callback) {
    const sql = `SELECT * FROM ${table} ${orderBy};`;
    const query = db.query(sql, (err, rows) => {
        if (err) {
            console.log(err);
            callback(err, statusCodes.INTERNAL_SERVER_ERROR,
                INTERNAL_ERROR_MSG, null);
        }
        else {
            callback(null, statusCodes.OK, null, rows);
        }
    });
}

function selectAllForIntermediateTable(table, table1ForJoin, table2ForJoin,
    what, tableColumn1, tableColumn2, table1Column, table2Column, condition, orderBy,
    callback) {

    const sql = `SELECT ${what} FROM ${table
    } INNER JOIN ${table1ForJoin} ON ${table}.${tableColumn1
    } = ${table1ForJoin}.${table1Column
    } INNER JOIN ${table2ForJoin} ON ${table}.${tableColumn2
    } = ${table2ForJoin}.${table2Column
    } ${condition} ${orderBy};`;

    const query = db.query(sql, (err, rows) => {
        if (err) {
            console.log(err);
            callback(err, statusCodes.INTERNAL_SERVER_ERROR,
                INTERNAL_ERROR_MSG, null);
        }
        else {
            callback(null, statusCodes.OK, null, rows);
        }
    });

}

function selectRow(table, condition, callback) {
    const sql = `SELECT * FROM ${table} WHERE ${condition};`;
    const query = db.query(sql, (err, row) => {
        if (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                callback(err, statusCodes.BAD_REQUEST, INVALID_ID_MSG, null);
            }
            else {
                console.log(err);
                callback(err, statusCodes.INTERNAL_SERVER_ERROR,
                    INTERNAL_ERROR_MSG, null);
            }
        }
        else {
            if (row.length === 0) {
                callback(true, statusCodes.BAD_REQUEST, INVALID_ID_MSG, null);
            }
            else {
                callback(null, statusCodes.OK, null, row);
            }
        }
    });
}

function select(what, table, condition, orderBy, callback) {
    const sql = `SELECT ${what} FROM ${table} ${condition} ${orderBy};`;
    const query = db.query(sql, (err, rows) => {
        if (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                callback(err, statusCodes.BAD_REQUEST, INVALID_ID_MSG, null);
            }
            else {
                console.log(err);
                callback(err, statusCodes.INTERNAL_SERVER_ERROR,
                    INTERNAL_ERROR_MSG, null);
            }
        }
        else {
            callback(null, statusCodes.OK, null, rows);
        }
    });
}

function selectPartialInfo(table, what, orderBy, callback) {
    const sql = `SELECT ${what} FROM ${table} ${orderBy};`;
    const query = db.query(sql, (err, rows) => {
        if (err) {
            console.log(err);
            callback(err, statusCodes.INTERNAL_SERVER_ERROR,
                INTERNAL_ERROR_MSG, null);
        }
        else {
            callback(null, statusCodes.OK, null, rows);
        }
    });
}

function insertRow(table, newValues, callback) {
    const sql = `INSERT INTO ${table} SET ${newValues};`;
    const query = db.query(sql, (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                callback(err, statusCodes.BAD_REQUEST, NOT_UNIQUE_MSG);
            }
            else {
                console.log(err);
                callback(err, statusCodes.INTERNAL_SERVER_ERROR,
                    INTERNAL_ERROR_MSG);
            }
        }
        else {
            callback(null, statusCodes.CREATED, null);
        }
    });
}

function deleteRow(table, condition, callback) {
    const sql = `DELETE FROM ${table} WHERE ${condition};`;
    const query = db.query(sql, (err, results) => {
        if (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                callback(err, statusCodes.BAD_REQUEST, INVALID_ID_MSG);
            }
            else {
                console.log(err);
                callback(err, statusCodes.INTERNAL_SERVER_ERROR,
                    INTERNAL_ERROR_MSG);
            }
        }
        else {
            callback(null, statusCodes.NO_CONTENT, null);
        }
    });
}

function updateRow(table, newValues, condition, callback) {
    const sql = `UPDATE ${table} SET ${newValues} WHERE ${condition};`;
    const query = db.query(sql, (err, results) => {
        if (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                callback(err, statusCodes.BAD_REQUEST, INVALID_ID_MSG);
            }
            else {
                if (err.code === 'ER_DUP_ENTRY') {
                    callback(err, statusCodes.BAD_REQUEST, NOT_UNIQUE_MSG);
                }
                else {
                    console.log(err);
                    callback(err, statusCodes.INTERNAL_SERVER_ERROR,
                        INTERNAL_ERROR_MSG);
                }
            }
        }
        else {
            callback(null, statusCodes.NO_CONTENT, null);
        }
    });
}

// Indicating the data for exporting
module.exports.db = db;
module.exports.jwt = jwt;

module.exports.DB_NAME = DB_NAME;
module.exports.roles = roles;

module.exports.selectAllRows = selectAllRows;
module.exports.selectAllForIntermediateTable = selectAllForIntermediateTable;
module.exports.selectRow = selectRow;
module.exports.selectPartialInfo = selectPartialInfo;
module.exports.insertRow = insertRow;
module.exports.deleteRow = deleteRow;
module.exports.updateRow = updateRow;

module.exports.statusCodes = statusCodes;

module.exports.INTERNAL_ERROR_MSG = INTERNAL_ERROR_MSG;
module.exports.NOT_UNIQUE_MSG = NOT_UNIQUE_MSG;
module.exports.NOT_UNIQUE_USER_MSG = NOT_UNIQUE_MSG;
module.exports.INVALID_ID_MSG = INVALID_ID_MSG;
module.exports.FORBIDDEN_USER_MSG = FORBIDDEN_USER_MSG;
module.exports.FORBIDDEN_ADMIN_MSG = FORBIDDEN_ADMIN_MSG;

// Customizing the routes
const signUpModule = require(`${ROUTES_DIR}auth/signup`);
const signInModule = require(`${ROUTES_DIR}auth/signin`);
app.post('/signup', urlencodedParser, signUpModule.signUp);
app.post('/signin', urlencodedParser, signInModule.signIn);

// The handler for the root route
app.get('/tables', function(req, res) {
    const adminCookieJwt = req.cookies.admin_auth;
    jwt.verify(adminCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_USER_MSG}]});
        }
        else {
            res.sendStatus(statusCodes.NO_CONTENT);
        }
    });
});

app.get('/countries', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            select('country_id, name', 'countries', ``,
                'ORDER BY name ASC',
                function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.get('/age-limits', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            select('*', 'age_limits', ``, 'ORDER BY age_limit_id ASC',
                function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.get('/english-levels', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            select('*', 'english_levels', ``, 'ORDER BY english_level_id ASC',
                function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.get('/tags', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            select('*', 'tags', ``, 'ORDER BY name ASC',
                function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.get('/genres', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            select('*', 'genres', ``, 'ORDER BY name ASC',
                function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.get('/creators', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            select('creator_id, name, middle_name, surname, pseudonym', 'creators', ``,
                'ORDER BY name, middle_name, surname, pseudonym ASC',
                function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.get('/actors', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            select('actor_id, name, middle_name, surname, pseudonym', 'actors', ``,
                'ORDER BY name, middle_name, surname, pseudonym ASC',
                function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.get('/producers', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            select('producer_id, name, middle_name, surname, pseudonym', 'producers', ``,
                'ORDER BY name, middle_name, surname, pseudonym ASC',
                function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.get('/series/:seriesId/seasons/:seasonNumber/count', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT COUNT(*) AS total_count
                FROM episodes
                INNER JOIN seasons ON episodes.season_id = seasons.season_id
                WHERE seasons.series_id = ${req.params.seriesId} AND
                      seasons.serial_number = ${req.params.seasonNumber};`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({totalCount: rows});
                }
            });

        }
    });
});

app.get('/series/:seriesId/seasons/:seasonNumber/episodes/:episodeNumber', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT episode_id, episodes.title, episodes.premiere_date, episodes.description
                FROM episodes
                INNER JOIN seasons ON episodes.season_id = seasons.season_id
                WHERE seasons.series_id = ${req.params.seriesId} AND
                      seasons.serial_number = ${req.params.seasonNumber} AND
                      episodes.serial_number = ${req.params.episodeNumber};`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/series/:id/seasons', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            select('season_id, serial_number, title, premiere_date, description',
                'seasons', `WHERE series_id = ${req.params.id}`,
                'ORDER BY serial_number ASC',
                function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.get('/series/:id', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT series.series_id, title, countries.name AS country, rating,
                languages.name AS original_language, english_level, age_limit,
                opening_theme, imdb_id, premiere_date, description
                FROM series
                INNER JOIN countries ON series.country_id = countries.country_id
                INNER JOIN languages ON series.original_language_id = languages.language_id
                INNER JOIN english_levels ON series.english_level_id = english_levels.english_level_id
                INNER JOIN age_limits ON series.age_limit_id = age_limits.age_limit_id
                WHERE series_id = ${req.params.id};`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/season/:id/episodes', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            select('episode_id, serial_number, title', 'episodes',
                `WHERE season_id = ${req.params.id}`,
                'ORDER BY serial_number ASC',
                 function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.post('/key-words/add', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            let newValues = `word = '${req.body.word
                }', translation = '${req.body.translation}'`;

            insertRow('key_words', newValues, function (err, statusCode,
                msg) {
                if (err && err.code !== 'ER_DUP_ENTRY') {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    select('key_word_id', 'key_words', `WHERE word = '${req.body.word}'`,
                        '', function (err, statusCode, msg, rows) {
                        if (err) {
                            res.status(statusCode).json({errors: [{msg: msg}]});
                        }
                        else {
                            const newValues = `key_word_id = ${rows[0].key_word_id
                                }, user_id = ${decoded.id}, progress = 'ON_STUDY'`;

                            insertRow('key_words_for_users', newValues, function (err, statusCode,
                                msg) {
                                if (err) {
                                    res.status(statusCode).json({errors: [{msg: msg}]});
                                }
                                else {
                                    res.sendStatus(statusCode);
                                }
                            });

                        }
                    });
                }
            });

        }
    });
});

app.post('/key-words/progress', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (!err) {
            updateRow('key_words_for_users', 'progress = "LEARNED"',
                `key_word_id = ${req.body.key_word_id} AND user_id = ${decoded.id}`, function (err, statusCode,
                msg) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.sendStatus(statusCode);
                }
            });
        }
    });
});

app.get('/vocabulary', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            selectAllForIntermediateTable('key_words_for_users', 'users', 'key_words',
                'key_words.key_word_id, word, translation', 'user_id', 'key_word_id', 'user_id', 'key_word_id',
                `WHERE users.user_id = ${decoded.id} AND progress = "ON_STUDY"`, '',
                function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.get('/all-vocabulary', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            selectAllForIntermediateTable('key_words_for_users', 'users', 'key_words',
                'key_words.key_word_id, word, translation, progress', 'user_id', 'key_word_id', 'user_id', 'key_word_id',
                `WHERE users.user_id = ${decoded.id}`, 'ORDER BY progress DESC, word ASC',
                function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.post('/save-progress', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        updateRow('users',`learned_count = ${req.body.learnedCount
            }, trained_count = ${req.body.totalCount}, correct_count = ${req.body.correctCount}`,
            `user_id = ${decoded.id}`,
            function (err, statusCode, msg) {
            if (err) {
                res.status(statusCode).json({errors: [{msg: msg}]});
            }
            else {
                res.sendStatus(statusCode);
            }
        });
    });
});

app.get('/progress', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            select('learned_count, trained_count, correct_count',
                'users', `WHERE user_id = ${decoded.id}`,
                '',
                 function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.get('/is-favourite/:id', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            selectAllRows('favourite_series', `WHERE user_id = ${decoded.id} AND series_id = ${req.params.id}`,
                function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.post('/favourites', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            insertRow('favourite_series', `user_id = ${decoded.id}, series_id = ${req.body.seriesId}`,
                function (err, statusCode, msg) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.sendStatus(statusCode);
                }
            });
        }
    });
});

app.delete('/favourites/:id', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            deleteRow('favourite_series', `user_id = ${decoded.id} AND series_id = ${req.params.id}`,
                function (err, statusCode, msg) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.sendStatus(statusCode);
                }
            });
        }
    });
});

app.get('/favourites/:page/:perPage', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT series.series_id, title, countries.name AS country, rating,
                languages.name AS original_language, english_levels.english_level,
                premiere_date, description
                FROM favourite_series
                INNER JOIN series ON favourite_series.series_id = series.series_id
                INNER JOIN countries ON series.country_id = countries.country_id
                INNER JOIN languages ON series.original_language_id = languages.language_id
                INNER JOIN english_levels ON series.english_level_id = english_levels.english_level_id
                WHERE user_id = ${decoded.id}
                ORDER BY title ASC
                LIMIT ${req.params.page * req.params.perPage}, ${req.params.perPage};`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/is-already-watched/:id', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            selectAllRows('already_watched_series', `WHERE user_id = ${decoded.id} AND series_id = ${req.params.id}`,
                function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.post('/already-watched', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            insertRow('already_watched_series', `user_id = ${decoded.id}, series_id = ${req.body.seriesId}`,
                function (err, statusCode, msg) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.sendStatus(statusCode);
                }
            });
        }
    });
});

app.delete('/already-watched/:id', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            deleteRow('already_watched_series', `user_id = ${decoded.id} AND series_id = ${req.params.id}`,
                function (err, statusCode, msg) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.sendStatus(statusCode);
                }
            });
        }
    });
});

app.get('/already-watched/:page/:perPage', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT series.series_id, title, countries.name AS country, rating,
                languages.name AS original_language, english_levels.english_level,
                premiere_date, description
                FROM already_watched_series
                INNER JOIN series ON already_watched_series.series_id = series.series_id
                INNER JOIN countries ON series.country_id = countries.country_id
                INNER JOIN languages ON series.original_language_id = languages.language_id
                INNER JOIN english_levels ON series.english_level_id = english_levels.english_level_id
                WHERE user_id = ${decoded.id}
                ORDER BY title ASC
                LIMIT ${req.params.page * req.params.perPage}, ${req.params.perPage};`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/is-in-wish-list/:id', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            selectAllRows('series_in_wish_list', `WHERE user_id = ${decoded.id} AND series_id = ${req.params.id}`,
                function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.post('/wish-list', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            insertRow('series_in_wish_list', `user_id = ${decoded.id}, series_id = ${req.body.seriesId}`,
                function (err, statusCode, msg) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.sendStatus(statusCode);
                }
            });
        }
    });
});

app.delete('/wish-list/:id', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            deleteRow('series_in_wish_list', `user_id = ${decoded.id} AND series_id = ${req.params.id}`,
                function (err, statusCode, msg) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.sendStatus(statusCode);
                }
            });
        }
    });
});

app.get('/wish-list/:page/:perPage', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT series.series_id, title, countries.name AS country, rating,
                languages.name AS original_language, english_levels.english_level,
                premiere_date, description
                FROM series_in_wish_list
                INNER JOIN series ON series_in_wish_list.series_id = series.series_id
                INNER JOIN countries ON series.country_id = countries.country_id
                INNER JOIN languages ON series.original_language_id = languages.language_id
                INNER JOIN english_levels ON series.english_level_id = english_levels.english_level_id
                WHERE user_id = ${decoded.id}
                ORDER BY title ASC
                LIMIT ${req.params.page * req.params.perPage}, ${req.params.perPage};`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/series/:seriesId/tags', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT tags.tag_id, name
                FROM tags_for_series
                INNER JOIN tags ON tags_for_series.tag_id = tags.tag_id
                WHERE series_id = ${req.params.seriesId}
                ORDER BY name ASC;`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/series/:seriesId/genres', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT genres.genre_id, name
                FROM genres_for_series
                INNER JOIN genres ON genres_for_series.genre_id = genres.genre_id
                WHERE series_id = ${req.params.seriesId}
                ORDER BY name ASC;`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/series/:title/:englishLevelId/:countryId/:ageLimitId/:tagIds/:genreIds/:actorIds/:creatorIds/:producerIds/:orderBy/:direction/:page/:perPage',
    function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            let whereCriteria = [];
            let joinCriteria = [];
            let count = 1;
            let havingColumn = null;

            if (req.params.title !== " ") {
                whereCriteria.push(`title LIKE "%${req.params.title}%"`);
            }

            if (req.params.englishLevelId !== " ") {
                whereCriteria.push(`english_levels.english_level_id = ${req.params.englishLevelId}`);
            }

            if (req.params.countryId !== " ") {
                whereCriteria.push(`countries.country_id = ${req.params.countryId}`);
            }

            if (req.params.ageLimitId !== " ") {
                whereCriteria.push(`age_limits.age_limit_id = ${req.params.ageLimitId}`);
            }

            if (req.params.tagIds !== " ") {
                const criteria = joinArrayIntoQuery(req.params.tagIds.split('&'), "tag_id");
                whereCriteria.push(criteria.str);
                count *= criteria.count;
                havingColumn = "tag_id";
                joinCriteria.push("INNER JOIN tags_for_series ON series.series_id = tags_for_series.series_id");
            }

            if (req.params.genreIds !== " ") {
                const criteria = joinArrayIntoQuery(req.params.genreIds.split('&'), "genre_id");
                whereCriteria.push(criteria.str);
                count *= criteria.count;
                havingColumn = "genre_id";
                joinCriteria.push("INNER JOIN genres_for_series ON series.series_id = genres_for_series.series_id");
            }

            if (req.params.actorIds !== " ") {
                const criteria = joinArrayIntoQuery(req.params.actorIds.split('&'), "actor_id");
                whereCriteria.push(criteria.str);
                count *= criteria.count;
                havingColumn = "actor_id";
                joinCriteria.push("INNER JOIN actors_in_series ON series.series_id = actors_in_series.series_id");
            }

            if (req.params.creatorIds !== " ") {
                const criteria = joinArrayIntoQuery(req.params.creatorIds.split('&'), "creator_id");
                whereCriteria.push(criteria.str);
                count *= criteria.count;
                havingColumn = "creator_id";
                joinCriteria.push("INNER JOIN creators_in_series ON series.series_id = creators_in_series.series_id");
            }

            if (req.params.producerIds !== " ") {
                const criteria = joinArrayIntoQuery(req.params.producerIds.split('&'), "producer_id");
                whereCriteria.push(criteria.str);
                count *= criteria.count;
                havingColumn = "producer_id";
                joinCriteria.push("INNER JOIN producers_in_series ON series.series_id = producers_in_series.series_id");
            }

            let joins = joinCriteria.join(" ");
            if (joinCriteria.length > 0) {
                joins = `${joins} `;
            }

            let where = whereCriteria.join(" AND ");
            if (whereCriteria.length > 0) {
                where = `WHERE ${where} `;
            }

            let groupBy = "";
            if (havingColumn) {
                groupBy = `GROUP BY series.series_id
                    HAVING COUNT(${havingColumn}) = ${count} `;
            }

            let orderByTitle = " ";
            if (req.params.orderBy !== "title") {
                orderByTitle = ", title ASC ";
            }

            const sql = `SELECT DISTINCT series.series_id, title, countries.name AS country,
                premiere_date, languages.name AS original_language,
                english_levels.english_level, description, rating
                FROM series
                INNER JOIN countries ON series.country_id = countries.country_id
                INNER JOIN languages ON series.original_language_id = languages.language_id
                INNER JOIN age_limits ON series.age_limit_id = age_limits.age_limit_id
                INNER JOIN english_levels ON series.english_level_id = english_levels.english_level_id
                ${joins}
                ${where}
                ${groupBy}
                ORDER BY series.${ req.params.orderBy.replace(/-/g, '_') } ${ req.params.direction.toUpperCase() }${ orderByTitle }
                LIMIT ${req.params.page * req.params.perPage}, ${req.params.perPage};`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/comments/:about/:id', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT comment_id, users.user_id, nickname, datetime, content, ${req.params.about.slice(0, -1)}_id AS about_id
                FROM comments_about_${req.params.about.toLowerCase()}
                INNER JOIN users ON comments_about_${req.params.about.toLowerCase()}.user_id = users.user_id
                WHERE ${req.params.about.slice(0, -1)}_id = ${req.params.id}
                ORDER BY datetime DESC;`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows, userId: decoded.id});
                }
            });

        }
    });
});

app.get('/reviews/:seriesId', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT users.user_id, nickname, datetime, content
                FROM reviews
                INNER JOIN users ON reviews.user_id = users.user_id
                WHERE series_id = ${req.params.seriesId}
                ORDER BY datetime DESC;`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows, userId: decoded.id});
                }
            });

        }
    });
});

app.get('/series/:seriesId/actors', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT actor_id
                FROM actors_in_series
                WHERE series_id = ${req.params.seriesId}
                ORDER BY actor_id ASC;`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/series/:seriesId/creators', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT creator_id
                FROM creators_in_series
                WHERE series_id = ${req.params.seriesId}
                ORDER BY creator_id ASC;`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/series/:seriesId/producers', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT producer_id
                FROM producers_in_series
                WHERE series_id = ${req.params.seriesId}
                ORDER BY producer_id ASC;`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/cast/:cast/:castId/series', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT series_id
                FROM ${req.params.cast}_in_series
                WHERE ${req.params.cast.slice(0, -1)}_id = ${req.params.castId}
                ORDER BY series_id ASC;`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/cast/:cast/:id', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const table = req.params.cast.toLowerCase();

            const sql = `SELECT ${table}.name, middle_name, surname, pseudonym,
                countries.name AS country, date_of_birth, biography, imdb_id
                FROM ${table}
                LEFT OUTER JOIN countries ON ${table}.country_id = countries.country_id
                WHERE ${table.slice(0, -1)}_id = ${req.params.id}`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/series', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {
            select('series_id, title', 'series', ``, 'ORDER BY title ASC',
                function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        }
    });
});

app.get('/articles/:title/:seriesIds/:orderBy/:direction/:page/:perPage',
    function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            let whereCriteria = [];
            let joinCriteria = [];
            let count = 1;
            let havingColumn = null;

            if (req.params.title !== " ") {
                whereCriteria.push(`title LIKE "%${req.params.title}%"`);
            }

            if (req.params.seriesIds !== " ") {
                const criteria = joinArrayIntoQuery(req.params.seriesIds.split('&'), "series_id");
                whereCriteria.push(criteria.str);
                count *= criteria.count;
                havingColumn = "series_id";
                joinCriteria.push("INNER JOIN series_in_articles ON articles.article_id = series_in_articles.article_id");
            }

            let joins = joinCriteria.join(" ");
            if (joinCriteria.length > 0) {
                joins = `${joins} `;
            }

            let where = whereCriteria.join(" AND ");
            if (whereCriteria.length > 0) {
                where = `WHERE ${where} `;
            }

            let groupBy = "";
            if (havingColumn) {
                groupBy = `GROUP BY articles.article_id
                    HAVING COUNT(${havingColumn}) = ${count} `;
            }

            let orderByTitle = " ";
            if (req.params.orderBy !== "title") {
                orderByTitle = ", title ASC ";
            }

            const sql = `SELECT DISTINCT articles.article_id, title, content, publication_date
                FROM articles
                ${joins}
                ${where}
                ${groupBy}
                ORDER BY articles.${ req.params.orderBy.replace(/-/g, '_') } ${ req.params.direction.toUpperCase() }${ orderByTitle }
                LIMIT ${req.params.page * req.params.perPage}, ${req.params.perPage};`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/articles/:articleId/series', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT series.series_id, title
                FROM series_in_articles
                INNER JOIN series ON series_in_articles.series_id = series.series_id
                WHERE article_id = ${req.params.articleId}
                ORDER BY title ASC;`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/articles/:articleId', function(req, res) {
    const userCookieJwt = req.cookies.user_auth;
    jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
        if (err) {
            res.status(statusCodes.UNAUTHORIZED).json(
                {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
        }
        else {

            const sql = `SELECT article_id, title, content, publication_date
                FROM articles
                WHERE article_id = ${req.params.articleId};`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
                }
                else {
                    res.status(statusCodes.OK).json({rows: rows});
                }
            });

        }
    });
});

app.get('/covers/x-small/:id.jpg', function(req, res) {
    res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/covers/${req.params.id}/${req.params.id}_x_small.jpg`, (err) => {
        if (err) {
            res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/covers/no_image_x_small.png`);
        }
    });
});

app.get('/covers/small/:id.jpg', function(req, res) {
    res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/covers/${req.params.id}/${req.params.id}_small.jpg`, (err) => {
        if (err) {
            res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/covers/no_image_small.png`);
        }
    });
});

app.get('/covers/:id.jpg', function(req, res) {
    res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/covers/${req.params.id}/${req.params.id}.jpg`, (err) => {
        if (err) {
            res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/covers/no_image.png`);
        }
    });
});

app.get('/news/small/:id.jpg', function(req, res) {
    res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/articles/${req.params.id}/${req.params.id}_small.jpg`, (err) => {
        if (err) {
            res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/articles/no_image_small.png`);
        }
    });
});

app.get('/news/:id.jpg', function(req, res) {
    res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/articles/${req.params.id}/${req.params.id}.jpg`, (err) => {
        if (err) {
            res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/articles/no_image.png`);
        }
    });
});

app.get('/screenshots/small/:id.jpg', function(req, res) {
    res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/episodes/${req.params.id}/${req.params.id}_small.jpg`, (err) => {
        if (err) {
            res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/episodes/no_video_small.jpg`);
        }
    });
});

app.get('/screenshots/:id.jpg', function(req, res) {
    res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/episodes/${req.params.id}/${req.params.id}.jpg`, (err) => {
        if (err) {
            res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/episodes/no_video.jpg`);
        }
    });
});

app.get('/:cast/small/:id.jpg', function(req, res) {
    res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/${req.params.cast}/${req.params.id}/${req.params.id}_small.jpg`, (err) => {
        if (err) {
            res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/${req.params.cast}/no_image_small.jpg`);
        }
    });
});

app.get('/:cast/:id.jpg', function(req, res) {
    res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/${req.params.cast}/${req.params.id}/${req.params.id}.jpg`, (err) => {
        if (err) {
            res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/${req.params.cast}/no_image.png`);
        }
    });
});

app.get('/videos/:type/:id.mp4', function(req, res) {

    let path = "";
    if (req.params.type.toLowerCase() === "episodes") {
        path = `${__dirname}/public/episodes/${req.params.id}.mp4`;
    }
    else {
        path = `${__dirname}/public/trailers/${req.params.id}.mp4`;
    }

    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {

        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : (fileSize - 1);
        const chunkSize = (end - start) + 1;

        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4'
        }
        res.writeHead(statusCodes.PARTIAL_CONTENT, head);
        fs.createReadStream(path, {start, end}).pipe(res);

    }
    else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4'
        };
        res.writeHead(statusCodes.OK, head);
        fs.createReadStream(path).pipe(res);
    }

});

app.get('/subtitles/:id.vtt', function(req, res) {
    res.status(statusCodes.OK).sendFile(`${__dirname}/public/subtitles/${req.params.id}.vtt`, (err) => {
        if (err) {
            console.log(err);
            res.sendStatus(err.statusCode);
        }
    });
});

app.get('/audio/:word.mp3', function(req, res) {
    say.export(req.params.word, 'Microsoft Zira Desktop', 1, `./public/audio/${req.params.word}.mp3`, (err) => {
        if (err) {
            console.log(err);
            res.status(statusCodes.INTERNAL_SERVER_ERROR).json({errors: [{msg: INTERNAL_ERROR_MSG}]});
        }
        else {
            res.status(statusCodes.OK).sendFile(`${__dirname}/public/audio/${req.params.word}.mp3`, (err) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(err.statusCode);
                }
            });
        }
    })
});

io.on('connection', (socket) => {

    socket.on('save rating', (seriesId, ratingValue, token) => {
        jwt.verify(token, config.KEY, function(err, decoded) {
            if (err) {
                socket.emit('save rating', {statusCode: statusCodes.UNAUTHORIZED,
                    errors: [{ msg: UNAUTHORIZED_MSG }]});
            }
            else {

                const newValues = `user_id = ${decoded.id}, series_id = ${
                    seriesId}, rating_value = ${ratingValue}`;

                insertRow('ratings_for_series', newValues, function (err, statusCode,
                    msg) {
                    if (err) {
                        socket.emit('save rating', {statusCode: statusCode,
                            errors: [{ msg: msg }]});
                    }
                    else {
                        socket.emit('save rating', {statusCode: statusCode,
                            errors: [{ msg: msg }]});
                        select('rating', 'series', `WHERE series_id = ${seriesId}`, '',
                            function (err, statusCode, msg, row) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                socket.emit('get rated value', {statusCode:
                                    statusCodes.OK, row: [{rating_value: ratingValue}],
                                    errors: []});
                                io.sockets.emit('get rating', {statusCode:
                                    statusCodes.OK, row: row, seriesId: seriesId, errors: []});
                            }
                        });
                    }
                });

            }
        });
    });

    socket.on('get rated value', (seriesId, token) => {
        jwt.verify(token, config.KEY, function(err, decoded) {
            if (err) {
                socket.emit('get rated value', {statusCode: statusCodes.UNAUTHORIZED,
                    row: [], errors: [{ msg: UNAUTHORIZED_MSG }]});
            }
            else {
                select('rating_value', 'ratings_for_series', `WHERE user_id = ${decoded.id} AND series_id = ${seriesId}`, '',
                    function (err, statusCode, msg, row) {
                    if (err) {
                        console.log(err);
                        socket.emit('get rated value', {statusCode:
                            statusCodes.INTERNAL_SERVER_ERROR, row: [], errors:
                            [{ msg: INTERNAL_ERROR_MSG }]});
                    }
                    else {
                        socket.emit('get rated value', {statusCode:
                            statusCodes.OK, row: row, errors: []});
                    }
                });
            }
        });
    });

    socket.on('add comment', (about, id, content, token) => {
        jwt.verify(token, config.KEY, function(err, decoded) {
            if (err) {
                socket.emit('add comment', {statusCode: statusCodes.UNAUTHORIZED,
                    errors: [{ msg: UNAUTHORIZED_MSG }]});
            }
            else {

                const datetime = moment();

                const newValues = `user_id = ${decoded.id}, ${about.slice(0, -1)}_id = ${
                    id}, content = "${content}", datetime = "${datetime.format()}"`;

                insertRow(`comments_about_${about.toLowerCase()}`, newValues,
                    function (err, statusCode, msg) {
                    if (err) {
                        socket.emit('add comment', {statusCode: statusCode,
                            errors: [{ msg: msg }]});
                    }
                    else {
                        select('comment_id', `comments_about_${about.toLowerCase()}`, 
                            `WHERE ${about.slice(0, -1)}_id = ${id} AND user_id = ${decoded.id} AND datetime = "${datetime.format("YYYY-MM-DD HH:mm:ss")}"`, '',
                            function (err, statusCode, msg, rows) {
                            if (!err) {
                                socket.emit('add comment', {statusCode: statusCode,
                                    errors: [{ msg: msg }]});
                                io.sockets.emit('get new comment', {statusCode:
                                    statusCodes.OK, about: about, rows: [{comment_id: rows[0].comment_id, 
                                    user_id: decoded.id, nickname: decoded.nickname, content: content,
                                    datetime: datetime, about_id: id}], errors: []});
                            }
                        });
                    }
                });

            }
        });
    });

    socket.on('delete comment', (about, id, commentId, token) => {
        jwt.verify(token, config.KEY, function(err, decoded) {
            if (err) {
                socket.emit('delete comment', {statusCode: statusCodes.UNAUTHORIZED,
                    errors: [{ msg: UNAUTHORIZED_MSG }]});
            }
            else {
                deleteRow(`comments_about_${about.toLowerCase()}`, `comment_id = ${commentId}`, 
                    function (err, statusCode, msg) {
                    if (err) {
                        socket.emit('delete comment', {statusCode: statusCode,
                            errors: [{ msg: msg }]});
                    }
                    else {
                        socket.emit('delete comment', {statusCode: statusCode,
                            errors: [{ msg: msg }]});
                        io.sockets.emit('get deleted comment', {statusCode:
                            statusCodes.OK, about: about, rows: [{ comment_id: commentId, about_id: id }], 
                            errors: []});
                    }
                });
            }
        });
    });

    socket.on('add review', (seriesId, content, token) => {
        jwt.verify(token, config.KEY, function(err, decoded) {
            if (err) {
                socket.emit('add review', {statusCode: statusCodes.UNAUTHORIZED,
                    errors: [{ msg: UNAUTHORIZED_MSG }]});
            }
            else {

                const datetime = moment().format();

                const newValues = `user_id = ${decoded.id}, series_id = ${
                    seriesId}, content = "${content}", datetime = "${datetime}"`;

                insertRow(`reviews`, newValues, function (err, statusCode, msg) {
                    if (err) {
                        socket.emit('add review', {statusCode: statusCode,
                            errors: [{ msg: msg }]});
                    }
                    else {
                        socket.emit('add review', {statusCode: statusCode,
                            errors: [{ msg: msg }]});
                        io.sockets.emit('get new review', {statusCode:
                            statusCodes.OK, rows: [{user_id: decoded.id, series_id: seriesId,
                            nickname: decoded.nickname, content: content,
                            datetime: datetime}], errors: []});
                    }
                });

            }
        });
    });

    socket.on('delete review', (seriesId, token) => {
        jwt.verify(token, config.KEY, function(err, decoded) {
            if (err) {
                socket.emit('delete review', {statusCode: statusCodes.UNAUTHORIZED,
                    errors: [{ msg: UNAUTHORIZED_MSG }]});
            }
            else {
                deleteRow(`reviews`, `user_id = ${decoded.id} AND series_id = ${seriesId}`, 
                    function (err, statusCode, msg) {
                    if (err) {
                        socket.emit('delete review', {statusCode: statusCode,
                            errors: [{ msg: msg }]});
                    }
                    else {
                        socket.emit('delete review', {statusCode: statusCode,
                            errors: [{ msg: msg }]});
                        io.sockets.emit('get deleted review', {statusCode:
                            statusCodes.OK, rows: [{user_id: decoded.id,
                            series_id: seriesId}], errors: []});
                    }
                });
            }
        });
    });

    io.sockets.on('disconnect', () => {
        io.sockets.removeAllListners();
    })

});

// Starting to listen
server.listen(PORT, () => {
    console.log(SERVER_LOG);
});
