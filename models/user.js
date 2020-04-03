const {Schema, model} = require('mongoose');

const user = new Schema({
    email: {
        type: String,
        required: true
    },
    name: String,
    avatarUrl: String,
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExp: Date,
    cart: {
        items: [
            {
                count: {
                    type: Number,
                    required: true,
                    default: 1
                },
                courseId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                    required: true,
                }
            }
        ]
    }
});

user.methods.addToCart = function(course) {
    const items = [...this.cart.items];
    const index = items.findIndex(c => {
        return c.courseId.toString() === course._id.toString();
    })

    if (index >= 0) {
        items[index].count = items[index].count + 1;
    } else {
        items.push({
            courseId: course.id,
            count: 1
        })
    }

    this.cart = {items}
    return this.save();
}

user.methods.removeFromCart = function(id) {
    let items = [...this.cart.items];
    const index = items.findIndex(c => c.courseId.toString() === id.toString());

    if (items[index].count === 1) {
        items = items.filter(c => c.courseId.toString() !== id.toString())
    } else {
        items[index].count--;
    }

    this.cart = {items}
    return this.save();
}

user.methods.clearCart = function() {
    this.cart = {items: []};
    return this.save()
}

module.exports = model('User', user);