const {Router} = require('express');
const Course = require('../models/course');
const auth = require('../middleware/auth');
const {validationResult} = require('express-validator');
const {courseValidators} = require('../utils/validators');
const router = Router();

function notOwner(course, req) {
    return
        !course.userId
        ||
        (
            req.user
            &&
            course.userId.toString() !== req.user._id.toString()
        );
}

// get courses
router.get('/', async (req, res) => {
    try {
        //const courses = await Course.getAll();
        const courses = await Course.find().populate('userId', 'email name').select('price title img');

        courses.map(function(el) {
            if (req.user
                && el.userId
                && req.user._id.toString() !== el.userId._id.toString()
            ) {
                el.userId = null;
            }
        });

        res.render('courses', {
            title: 'Courses',
            isCourses: true,
            courses: courses
        });
    } catch (e) {
        console.log(e)
    }
});

// remove course route
router.post('/remove',  auth, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        });
        res.redirect('/courses');
    } catch(e) {
        console.log(e)
    }
});

// route for edit the course
router.get('/:id/edit', auth,  async (req, res) => {
    try {
        if (!req.query.allow) {
            return res.redirect('/');
        }

        //const course = await Course.getById(req.params.id);
        const course = await Course.findById(req.params.id);

        // not allow edit not owner course
        if (notOwner(course, req)) {
            return res.redirect('/courses');
        }

        res.render('edit', {
            title: `Edit course: ${course.title}`,
            course
        })
    } catch (e) {
        console.log(e)
    }
});

// update the course
router.post('/edit', auth,  courseValidators, async (req, res) => {
    try {
        // checking errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.status(422).redirect(`/courses/${req.body.id}/edit?allow=true`)
        }

        const course = await Course.findById(req.params.id);
        // not allow edit not owner course
        if (!notOwner(course, req)) {
            //await Course.update(req.body);
            await Course.findByIdAndUpdate(req.body.id, req.body);
        }
        res.redirect('/courses');
    } catch (e) {
        console.log(e)
    }
});

// get course by id
router.get('/:id', async (req, res) => {
    try {
        //const course = await Course.getById(req.params.id);
        const {id} = req.body;
        delete req.body.id;
        const course = await Course.findById(req.params.id);
        res.render('course', {
            layout: 'empty',
            title: `Course ${course.title}`,
            course
        });
    } catch (e) {
        console.log(e)
    }

});

module.exports = router;