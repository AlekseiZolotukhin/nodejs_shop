module.exports = {
    mongoUrl: process.env.mongodb_uri,
    session_secret: process.env.session_secret,
    mailServerId: process.env.mailServerId,
    mailInjectionApiKey: process.env.mailInjectionApiKey,
    mailFrom: process.env.mailFrom,
    baseURL: process.env.baseURL,
}