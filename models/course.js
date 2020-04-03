const {Schema, model} = require('mongoose');
const idPlugin = require('mongoose-id');

const course = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    img: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

course.plugin(idPlugin);

module.exports = model('Course', course);