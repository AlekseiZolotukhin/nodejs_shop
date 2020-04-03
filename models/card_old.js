const path = require('path');
const fs = require('fs');

const cardPath = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'card.json'
);

class Card_old {
    static async add(course) {
        const card = await Card_old.list();

        const index = card.courses.findIndex(c => c.id === course.id);
        const exist = card.courses[index];

        if (exist) {
            exist.count++;
            card.courses[index] = exist;
        } else {
            course.count = 1;
            card.courses.push(course);
        }

        card.price += +course.price;

        return new Promise((resolve, reject) => {
            fs.writeFile(cardPath, JSON.stringify(card), err => {
                if (err) {
                    reject(err);
                }
                resolve()
            })
        })
    }

    static async remove(id) {
        const card = await Card_old.list();

        const index = card.courses.findIndex(c => c.id === id);
        const course = card.courses[index];

        if (course.count === 1) {
            // remove
            card.courses = card.courses.filter(c => c.id !== id)
        } else {
            card.courses[index].count--;
        }

        card.price -= course.price;

        return new Promise((resolve, reject) => {
            fs.writeFile(cardPath, JSON.stringify(card), err => {
                if (err) {
                    reject(err);
                }
                resolve(card)
            })
        })
    }

    static async list() {
        return new Promise((resolve, reject) => {
            fs.readFile(cardPath, 'utf-8', (err, content) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(JSON.parse(content));
                }
            })
        })
    }
}

module.exports = Card_old;