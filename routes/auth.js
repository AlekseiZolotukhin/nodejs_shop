const {Router} = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {validationResult} = require('express-validator');
const {registerValidators} = require('../utils/validators');
const regMessage = require('../emails/registration');
const resetMessage = require('../emails/reset');

// url for connect to mongo
const keys = require('../keys');

// mail
const { SocketLabsClient } = require('@socketlabs/email');

const client = new SocketLabsClient(keys.mailServerId, keys.mailInjectionApiKey);

const User = require('../models/user');
const router = Router();

router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Authorization',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    })
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login');
    })
});

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if (user) {
            const passOK = await bcrypt.compare(password, user.password);
            if (passOK) {
                req.session.user = user;
                req.session.isAuthenticated = true;
                req.session.save(err => {
                    if (err) {
                        throw err;
                    }
                    res.redirect('/');
                });
            } else {
                req.flash('loginError', 'Password is incorrect');
                res.redirect('/auth/login#login');
            }
        } else {
            req.flash('loginError', 'User not found');
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(req.body, e);
    }
});

router.post('/register', registerValidators, async (req, res) => {
    try {
        const {email, password, name} = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#registration');
        }

            const hash = await bcrypt.hash(password, 10);
            const user = new User({
                email, name, password: hash, cart: {items: []}
            });
            await user.save();
            res.redirect('/auth/login#login');
            client.send(regMessage(email)).then(
                (res) => {
                    //Handle successful API call
                    console.log("SUCCESS", res);
                },
                (err) => {
                    //Handle error making API call
                    console.log("FAIL", err);
                });


    } catch (e) {
        console.log(e)
    }
});

// reset password 1st step
router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Password reset',
        error: req.flash('error')
    })
});

// reset password 2nd step
router.get('/password/:token', async (req, res) => {
   try {
       if (!req.params.token) {
           return res.redirect('/auth/login');
       }

       const user = await User.findOne({
           resetToken: req.params.token,
           resetTokenExp: {$gt: Date.now()}
       });

       if (!user) {
           return res.redirect('/auth/login');
       }

       res.render('auth/password', {
           title: 'New password',
           error: req.flash('error'),
           userId: user._id.toString(),
           token: req.params.token
       })
   }  catch (e) {
       console.log(e);
   }
});

// reset password 2nd step form submit
router.post('/password/', async (req, res) => {
    try {
        if (!req.body.token) {
            return res.redirect('/auth/login');
        }

        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (!user) {
            req.flash('errorLogin', 'Token time expiried');
            return res.redirect('/auth/login#login');
        }

        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetToken = undefined;
        user.resetTokenExp = undefined;
        await user.save();
        return res.redirect('/auth/login#login');
    }  catch (e) {
        console.log(e);
    }
});


// reset password 1st step form submit
router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Something goes wrong. Try later.');
                return res.redirect('/auth/reset');
            }

            const token = buffer.toString('hex');

            const user = await User.findOne({email: req.body.email});
            if (user) {
                user.resetToken = token;
                user.resetTokenExp = Date.now() + 3600 * 1000;
                await user.save();
                res.redirect('/auth/login');
                client.send(resetMessage(user.email, token)).then(
                    (res) => {
                        //Handle successful API call
                        console.log("SUCCESS", res);
                    },
                    (err) => {
                        //Handle error making API call
                        console.log("FAIL", err);
                    });
            } else {
                req.flash('error', 'User not found.');
                res.redirect('/auth/reset');
            }
        })
    } catch (e) {
        console.log(e)
    }
});

module.exports = router;