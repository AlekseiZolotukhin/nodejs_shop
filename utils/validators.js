const {body, validationResult} = require('express-validator');
const User = require('../models/user');

exports.registerValidators = [
    body('email')
        .isEmail().withMessage('Input correct email')
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({email: value});
                if (user) {
                    return Promise.reject('Email is taken');
                }
            } catch (e) {
                console.log(e);
            }
        })
        .normalizeEmail(),
    body('password', 'Password min length 6 symbols and alphanumeric')
        .isLength({min: 6, max: 56})
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords mismatch')
            }
            return true;
        })
        .trim(),
    body('name')
        .isLength({min: 3})
        .withMessage('Name length must be more 3 symbols')
        .trim()
]

exports.courseValidators = [
    body('title', 'Min title length is 3').isLength({min: 3}),
    body('price', 'Input correct price').isNumeric(),
    body('img', 'Input correct Url').isURL()
];