const main = require('../../main');

// Some information for queries
const USERS_TABLE = 'users';

// Validation patterns
const DIGITS_PATTERN = '[0-9]';
const LOW_LATIN_PATTERN = '[a-z]';
const UP_LATIN_PATTERN = '[A-Z]';
const NICKNAME_PATTERN = '[a-zA-Z0-9]+';

// Some validation information
const LOGIN_MAX = 50;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 20;
const NICKNAME_MIN = 6;
const NICKNAME_MAX = 30;

// Some validation messages
const MSG_LOGIN_INCORRECT = 'Login should be a valid email!';
const MSG_LOGIN_MAX = `Login must contain not more than ${LOGIN_MAX} symbols!`;
const MSG_PASSWORD_MIN = `Password must contain at least ${PASSWORD_MIN} symbols!`;
const MSG_PASSWORD_MAX = `Password must contain not more than ${PASSWORD_MAX} symbols!`;
const MSG_PASSWORD_ASCII_ONLY = 'Password may contain only ASCII symbols!';
const MSG_PASSWORD_DIGITS = 'Password must contain at least 1 digital!';
const MSG_PASSWORD_LOW_LATIN = 'Password must contain at least 1 latin lowercase letter!';
const MSG_PASSWORD_UP_LATIN = 'Password must contain at least 1 latin uppercase letter!';
const MSG_NICKNAME_MIN = `Nick name must contain at least ${NICKNAME_MIN} symbols!`;
const MSG_NICKNAME_MAX = `Nick name must contain not more than ${NICKNAME_MAX} symbols!`;
const MSG_NICKNAME_PATTERN = 'Nick name may contain only digits and latin upper(lower)case letters!';

function validateRequest(req) {

  req.check('login')
      .trim()
      .isEmail().withMessage(MSG_LOGIN_INCORRECT)
      .isLength({ max: LOGIN_MAX }).withMessage(MSG_LOGIN_MAX)

  req.check('password')
      .isLength({ min: PASSWORD_MIN }).withMessage(MSG_PASSWORD_MIN)
      .isLength({ max: PASSWORD_MAX }).withMessage(MSG_PASSWORD_MAX)
      .isAscii().withMessage(MSG_PASSWORD_ASCII_ONLY)
      .matches(DIGITS_PATTERN).withMessage(MSG_PASSWORD_DIGITS)
      .matches(LOW_LATIN_PATTERN).withMessage(MSG_PASSWORD_LOW_LATIN)
      .matches(UP_LATIN_PATTERN).withMessage(MSG_PASSWORD_UP_LATIN);

  req.check('nickname')
      .trim()
      .matches(NICKNAME_PATTERN).withMessage(MSG_NICKNAME_PATTERN)
      .isLength({ min: NICKNAME_MIN }).withMessage(MSG_NICKNAME_MIN)
      .isLength({ max: NICKNAME_MAX }).withMessage(MSG_NICKNAME_MAX)

  return req.validationErrors();

}

module.exports = {
    signUp: (req, res) => {
        const errors = validateRequest(req);
        if (errors) {
            res.status(main.statusCodes.BAD_REQUEST).json({errors: errors});
        }
        else {

            const newValues = `login = "${req.body.login}", password = "${
                req.body.password}", nickname = "${req.body.nickname}"`;

            main.insertRow(USERS_TABLE, newValues, function (err, statusCode, msg) {
                if (err) {
                    res.status(statusCode).json({errors: [{msg: msg}]});
                }
                else {
                    res.sendStatus(statusCode);
                }
            });

        }
    }
}
