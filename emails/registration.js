const keys = require('../keys');

module.exports = function(to) {
    return {
        to: to,
        from: keys.mailFrom,
        subject: 'Account created',
        textBody: `You have success registered in the shop. Our site is ${keys.baseURL}`,
        htmlBody: `<html>You have success registered in the shop. ${keys.baseURL}</html>`,
        messageType: 'basic'
    }
}