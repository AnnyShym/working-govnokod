const md5 = require('md5');
const config = require('../../modules/config');

const main = require('../../main');

// Some information for queries
const ADMINS_TABLE = 'administrators';
const USERS_TABLE = 'users';

// Some validation messages
const CANNOT_FIND_ADMIN_MSG = 'The administrator hasn\'t been signed up in the system!';
const CANNOT_FIND_USER_MSG = 'The user hasn\'t been signed up in the system!';
const INCORRECT_PASSWORD_MSG = 'Incorrect password!';

module.exports = {
    signIn: (req, res) => {

        let table = USERS_TABLE;
        let msg = CANNOT_FIND_USER_MSG;
        let cookieName = 'user_auth';
        if (req.body.role === main.roles.ADMIN) {
            table = ADMINS_TABLE;
            msg = CANNOT_FIND_ADMIN_MSG;
            cookieName = 'admin_auth';
        }

        let sql = `SELECT id, login, password FROM ${table} WHERE login = "${
            req.body.login}";`;
        main.db.query(sql, (err, result) => {

            if (err) {
                console.log(err);
                res.status(main.statusCodes.INTERNAL_SERVER_ERROR).json(
                    {errors: [{msg: main.INTERNAL_ERROR_MSG}]});
                return;
            }

            if (result.length === 0) {
                res.status(main.statusCodes.BAD_REQUEST).json({errors:
                    [{msg: msg}]});
                return;
            }

            if (md5(req.body.password) === result[0].password) {

                const token = main.jwt.sign({
                    id: result[0].id,
                    login: result[0].login,
                    password: result[0].password,
                }, config.KEY,
                    {expiresIn: config.TIME_JWT}
                );

                res.cookie(cookieName, token, {httpOnly: false,
                    maxAge: config.TIME_COOKIE});
                res.sendStatus(main.statusCodes.OK);

            }
            else {
                res.status(main.statusCodes.BAD_REQUEST).json({errors:
                    [{msg: INCORRECT_PASSWORD_MSG}]});
            }

        });

    }
}
