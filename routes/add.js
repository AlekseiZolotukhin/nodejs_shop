const {Router} = require('express');
const Course = require('../models/course');
const auth = require('../middleware/auth');
const {validationResult} = require('express-validator');
const {courseValidators} = require('../utils/validators');
const router = Router();

// we can set second parameter as middleware
router.get('/', auth, (req, res) => {
    res.render('add', {
        title: 'Add a course',
        isAdd: true
    });
});

router.post('/', auth, courseValidators, async (req, res) => {
    //const course = new Course(req.body.title, req.body.price, req.body.img);

    // checking errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('registerError', errors.array()[0].msg);
        return res.status(422).render('add', {
            title: 'Add course',
            isAdd: true,
            error: errors.array()[0].msg,
            data: {
                title: req.body.title,
                price: req.body.price,
                img: req.body.img,
            }
        });
    }


    const course = new Course({
       title: req.body.title,
       price: req.body.price,
       img: req.body.img,
       userId: req.user
    });

    try {
        await course.save();
        res.redirect('/courses');
    } catch (e) {
        console.log('e')
    }

});

module.exports = router;
