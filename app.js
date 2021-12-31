if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport')
const localStrat = require('passport-local')
const MongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')

const MongoStore = require("connect-mongo")(session);

const AppError = require('./utilities/AppError');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/user')
const User = require('./models/user')

const dbURL = process.env.DB_URL
// const dbURL = 'mongodb://localhost:27017/showApp'
const secret = process.env.SECRET

mongoose.connect(dbURL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        autoIndex: false, // Don't build indexes
        //maxPoolSize: 10, // Maintain up to 10 socket connections
        //serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        ///socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
    })
    .then(() => {
        console.log('connection open')
    })
    .catch(e => {
        console.log('ERROR OCCURED', e)
    })


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsMate);

const store = new MongoStore({
    url: dbURL,
    secret: secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


const sessionConfig = {
    store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 30,
        maxAge: 1000 * 60 * 60 * 24 * 30,
    },
}
app.use(session(sessionConfig))

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(flash());
app.use(MongoSanitize());
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/showappimageapi/",
                'https://i.pinimg.com/originals/84/58/61/84586164248f9862b4117b2c2ab540aa.jpg',
                'https://i.imgflip.com/2hrn59.jpg',
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrat(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const author = "k6daniel";
var viewMode = 'dark'

//flash middleware
app.use((req, res, next) => {
    if (!req.user) res.locals.viewMode = viewMode
    else res.locals.viewMode = req.user.viewMode
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

//Routing to home page
app.get('/', async (req, res) => {
    delete req.session.returnTo
    if (req.user) {
        const currentUser = await User.findById(req.user._id).populate('posts').populate('comments')
        const length = currentUser.posts.length - 1;
        const cLength = currentUser.comments.length - 1;
        res.render('home', { user: currentUser, length, cLength })
    } else {
        res.render('entry')
    }
})

//TRASH changing system
app.get('/change', async (req, res) => {
    if (req.user) {
        const currentUser = await User.findById(req.user._id)
        if (currentUser.viewMode == 'light') currentUser.viewMode = 'dark';
        else currentUser.viewMode = 'light'
        await currentUser.save()
    } else {
        if (viewMode == 'light') viewMode = 'dark';
        else viewMode = 'light'
    }
    var redirect = req.session.returnTo || '/'
    res.redirect(redirect)
})


//All the commenting routes
app.use('/posts/:id/comment', commentRoutes)


//All the posting routes
app.use('/posts', postRoutes)

//All user related routes
app.use('/', userRoutes)

app.all('*', (req, res, next) => {
    next(new AppError('Sorry Page Not Found', 404))
})

app.use((err, req, res, next) => {
    if (!err.message) err.message = 'Something went wrong';
    if (!err.status) err.status = 500;
    res.status(err.status).render('error', { err, viewMode })
})

const port = process.env.PORT

app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
