const keys = require('../keys');

module.exports = function(to, token) {
    return {
        to: to,
        from: keys.mailFrom,
        subject: 'Reset password',
        textBody: `You have requested reset password. Our site is ${keys.baseURL}`,
        htmlBody: `<html>You have requested reset password. <a href="${keys.baseURL}/auth/password/${token}">Reset link</a> Our site is ${keys.baseURL}</html>`,
        messageType: 'basic'
    }
}