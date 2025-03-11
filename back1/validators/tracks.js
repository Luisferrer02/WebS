const { check } = require('express-validator');
const { validateResults } = require('../utils/handleValidator');

const validatorCreateItem = [
    check('name').exists().notEmpty(),
    check('album').exists().notEmpty(),
    check('cover').exists().notEmpty(),
    check('artist').exists().notEmpty(),
    check('artist.name').exists().notEmpty(),
    check('artist.nickname').exists().notEmpty(),
    check('artist.nationality').exists().notEmpty(),
    check('duration').exists().notEmpty(),
    check('duration.start').exists().notEmpty().isInt(),
    check('duration.end').exists().notEmpty().isInt(),
    check('mediaId').exists().notEmpty().isMongoId(),
    (req, res, next) => validateResults(req, res, next)
]

const validatorUpdateItem = [
    check("id").exists().notEmpty().isMongoId(),
    check("name").optional().notEmpty(),
    check("album").optional().notEmpty(),
    check("cover").optional().notEmpty(),
    check("artist").optional().notEmpty(),
    check("artist.name").optional().notEmpty(),
    check("artist.nickname").optional().notEmpty(),
    check("artist.nationality").optional().notEmpty(),
    check("duration").optional().notEmpty(),
    check("duration.start").optional().notEmpty().isInt(),
    check("duration.end").optional().notEmpty().isInt(),
    check("mediaId").optional().notEmpty().isMongoId(),
    (req, res, next) => validateResults(req, res, next),
]

const validatorGetItem = [
    check('id').exists().notEmpty().isMongoId(),
    (req, res, next) => validateResults(req, res, next)
]

module.exports = {
    validatorCreateItem,
    validatorGetItem,
    validatorUpdateItem
}