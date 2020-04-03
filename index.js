const express = require('express');
const path = require('path');
const csrf = require('csurf');
const flash = require('connect-flash');
const Handlebars = require('handlebars');
const helmet = require('helmet');
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const mongoose = require('mongoose');
const session = require('express-session');
const compression = require('compression');
// use this for store session in the mongodb and add it's only after session declare
const MongoStore = require('connect-mongodb-session')(session);

// declare routes
const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const cardRoutes = require('./routes/cart');
const ordersRoute = require('./routes/orders');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const errorHandler = require('./middleware/error');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const fileMiddleware = require('./middleware/file');

// url for connect to mongo
const keys = require('./keys');

const app = express();

const hbs = exphbs.create({
    defaultLayout: 'main', // имя дефолтного лэйаута в папке layouts
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: require('./utils/hbs-helpers')
});

// sessionstore settings
const store = new MongoStore({
    collection: 'sessions',
    uri: keys.mongoUrl
});

// register folder public for access to it
app.use(express.static(path.join(__dirname, 'public')));

// add 'images' for access by path URL/images/...
app.use('/images', express.static(path.join(__dirname, 'images')));

// for get form data we use next midleware
app.use(express.urlencoded({extended: true}));

// set session
app.use(session({
    secret: keys.session_secret,
    resave: false,
    saveUninitialized: false,
    store
}));

// fileupload middleware. 'avatar' it's name what we will watch in request, single - we upload only 1 file
app.use(fileMiddleware.single('avatar'));

// add csrf middleware after session and after urlencoded, we must call variable, so add
app.use(csrf());

// add flash for error messages
app.use(flash());

// add helmet for secure
app.use(helmet());

// compress data which we send to user
app.use(compression());

// add middleware
app.use(varMiddleware);
app.use(userMiddleware);

// регистрируем в экспрессе движок
app.engine('hbs', hbs.engine);
// указываем папку где храняться вью (2 параметр) при этом html переименовываем в hds
app.set('views', path.join(__dirname, 'views'));
// указываем какой движок для view использовать
app.set('view engine', 'hbs');

// для роутов передаем данные где лежат роуты
app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/cart', cardRoutes);
app.use('/orders', ordersRoute);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

// error handler 404 we must add in the end only, so this mean we not found a route
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await mongoose.connect(keys.mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch(e) {
        console.log(e);
    }
}
start();



