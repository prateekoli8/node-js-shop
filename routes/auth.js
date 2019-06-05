const express = require('express');
const { check, body } = require('express-validator/check');
const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', [
    check('email').isEmail().withMessage('Please enter a valid Email Address!').normalizeEmail(),
    body('password', 'Please enter a correct Password').isLength({min: 5}).isAlphanumeric().trim()
], authController.postLogin);

router.post('/signup', [
check('email').isEmail().withMessage('Please Enter A valid Email!')
.custom((value, {req}) => {
    return User.findOne({email: value})
  .then(userDoc => {
    if(userDoc){
      return Promise.reject('A user is already registered with the provided email ID');
    }
})
}).normalizeEmail()
,body('password', 'Please enter a password with at least 5 Characters, consisting only alphabets and numbers!')
.isLength({min: 5}).isAlphanumeric().trim()
,body('confirmPassword').trim().custom((value, { req }) => {
    if(value !== req.body.password) {
        throw new Error('The password fields do not match');
    }
    return true;
})
] , authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;