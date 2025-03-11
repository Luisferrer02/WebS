const { check } = require('express-validator');
const { validateResults } = require('../utils/handleValidator');

const validatorGetUser = [
    check('id').exists().notEmpty().isMongoId(),
    (req, res, next) => validateResults(req, res, next)
]

const validatorUpdateUser = [
    check("id").exists().notEmpty().isMongoId(),
    check("name").optional().notEmpty(),
    check("age").optional().notEmpty().isInt(),
    check("email").optional().notEmpty().isEmail(),
    check("password").optional().notEmpty(),
    check("role").exists().notEmpty(),
    (req, res, next) => validateResults(req, res, next),
]

module.exports = {
    validatorGetUser,
    validatorUpdateUser
}