const multer = require('multer');

const storage = multer.diskStorage({
    destination(req, file, callback) {
        // 1st param is error, we haven't it so null
        callback(null, 'images')
    },
    filename(req, file, callback) {
        const d = new Date();
        callback(null, d.getDay() + '-' + d.getMonth() + '-' + d.getFullYear()+ '_' + req.session.user._id.toString() + '_' + file.originalname)
    }
});

const allowedTypes = ['image/ong', 'image/jpeg', 'image/jpg'];

const fileFilter = (req, file, callback) => {
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(null, false)
    }
}

module.exports = multer({
    storage,
    fileFilter
});