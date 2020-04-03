const {Router} = require('express');
const router = Router();

router.get('/', (req, res) => {
    // это мы использовали до внедрения handlebars
    // res.sendFile(path.join(__dirname, 'views', 'index.html'));

    // теперь используем просто метод render и имя файла без расширения
    res.render('index', {
        title: 'Main page',
        isHome: true
    });
});

module.exports = router;