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

const config = require('./modules/config');

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
const DB_NAME = 'series_db';
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
    user: 'root',
    password: '',
    database: DB_NAME
});

db.connect((err) => {
    if (err) {
        throw(err);
    }
    console.log(CONNECTION_LOG);
});

// Creating the tables
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
    what, tableColumn1, tableColumn2, table1Column, table2Column, orderBy,
    callback) {

    const sql = `SELECT ${what} FROM ${table
    } INNER JOIN ${table1ForJoin} ON ${table}.${tableColumn1
    } = ${table1ForJoin}.${table1Column
    } INNER JOIN ${table2ForJoin} ON ${table}.${tableColumn2
    } = ${table2ForJoin}.${table2Column
    } ${orderBy};`;

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

app.get('/series/:id/seasons', function(req, res) {
    // const userCookieJwt = req.cookies.user_auth;
    // jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
    //     if (err) {
    //         res.status(statusCodes.UNAUTHORIZED).json(
    //             {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
    //     }
    //     else {
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
        });
//     });
// });

app.get('/series/:id', function(req, res) {
    // const userCookieJwt = req.cookies.user_auth;
    // jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
    //     if (err) {
    //         res.status(statusCodes.UNAUTHORIZED).json(
    //             {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
    //     }
    //     else {
            selectRow('series', `series_id = ${req.params.id}`,
                function (err, statusCode, msg, row) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({row: row});
                }
            });
        });
//     });
// });

app.get('/season/:id/episodes', function(req, res) {
    // const userCookieJwt = req.cookies.user_auth;
    // jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
    //     if (err) {
    //         res.status(statusCodes.UNAUTHORIZED).json(
    //             {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
    //     }
    //     else {
            select('episode_id, serial_number, title, premiere_date, description',
                'episodes', `WHERE season_id = ${req.params.id}`,
                'ORDER BY serial_number ASC',
                 function (err, statusCode, msg, rows) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.status(statusCode).json({rows: rows});
                }
            });
        });
//     });
// });

app.get('/series/:op/:prevind/:seriesPerPage', function(req, res) {
    // const userCookieJwt = req.cookies.user_auth;
    // console.log(userCookieJwt);
    // jwt.verify(userCookieJwt, config.KEY, function(err, decoded) {
    //     if (err) {
    //         res.status(statusCodes.UNAUTHORIZED).json(
    //             {errors: [{msg: FORBIDDEN_ADMIN_MSG}]});
    //     }
    //     else {
            if (req.params.op === 'previous' || req.params.op === 'next') {

                let where = `WHERE series_id > ${req.params.prevind}`;
                let op = 'ASC';
                if (req.params.op === 'previous') {
                    where = `WHERE series_id <= ${req.params.prevind}`;
                    op = 'ASC';
                }
                
                const orderBy = `ORDER BY series_id ${op} LIMIT 0, ${req.params.seriesPerPage}`;
                select('series_id, title, country, original_language, premiere_date, description, rating', 'series',
                    where, orderBy, function (err, statusCode, msg, rows) {
                    if (err) {
                        res.status(statusCode).json({errors: [{msg: msg}]});
                    }
                    else {
                        res.status(statusCode).json({rows: rows});
                    }
                });   

            }
        });
//     });
// });

app.get('/covers/small/:id.jpg', function(req, res) {
    res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/covers/${req.params.id}/${req.params.id}_small.jpg`, (err) => {
        res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/covers/no_image_small.png`);
    });
});

app.get('/covers/:id.jpg', function(req, res) {
    res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/covers/${req.params.id}/${req.params.id}.jpg`, (err) => {
        res.status(statusCodes.OK).sendFile(`${__dirname}/public/img/covers/no_image.png`);
    });
});

app.get('/videos/:id.mp4', function(req, res) {

    const path = `${__dirname}/public/videos/${req.params.id}.mp4`;
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

})

io.on('connection', (socket) => {

    socket.on('save rating', (seriesId, ratingValue, token) => {
        // jwt.verify(token, config.KEY, function(err, decoded) {
        //     if (err) {
        //         socket.emit('save rating', {statusCode: statusCodes.UNAUTHORIZED,
        //             errors: [{ msg: UNAUTHORIZED_MSG }]});
        //     }
        //     else {

                const newValues = `user_id = ${decoded.id}, series_id = ${
                    seriesId}, rating_value = ${ratingValue}`;

                insertRow('ratings', newValues, function (err, statusCode,
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
                                socket.emit('get rating', {statusCode:
                                    statusCodes.OK, row: row, errors: []});
                            }
                        });
                    }
                });

            });
    //     });
    // });

    socket.on('get rated value', (seriesId, token) => {
        // jwt.verify(token, config.KEY, function(err, decoded) {
        //     if (err) {
        //         socket.emit('get rated value', {statusCode: statusCodes.UNAUTHORIZED,
        //             row: [], errors: [{ msg: UNAUTHORIZED_MSG }]});
        //     }
        //     else {
                select('rating_value', 'ratings', `WHERE user_id = ${decoded.id} AND series_id = ${seriesId}`, '',
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
            });
    //     });
    // });

    io.sockets.on('disconnect', () => {
        io.sockets.removeAllListners();
    })

});

// Starting to listen
server.listen(PORT, () => {
    console.log(SERVER_LOG);
});
