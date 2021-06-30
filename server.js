const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const mongoose = require("mongoose");
const exphbs = require('express-handlebars');
const connectDB = require("./config/db");
const path = require("path");
const methodOverride = require('method-override');
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = express();

const views_path = path.join(__dirname, "/views");

// Load config
dotenv.config({ path: './config/config.env' });

require("./config/passport")(passport)

connectDB();

// handlebars helpers
const { formatDate, stripTags, truncate, editIcon, select } = require("./helper/hbs")

app.engine('.hbs', exphbs({
    helpers: {
        formatDate,
        stripTags,
        truncate,
        editIcon,
        select
    },
    defaultLayout: 'index',
    extname: '.hbs',
}))
app.set("view engine", ".hbs");
app.set("views", views_path);

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//method override
app.use(
    methodOverride(function(req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            let method = req.body._method
            delete req.body._method
            return method
        }
    })
)

// sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    })
}))

// passport middleware
app.use(passport.initialize())
app.use(passport.session())

// set global variable
app.use(function(req, res, next) {
    res.locals.user = req.user || null;
    next()
});

// static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan("dev"))

// Routes
app.use("/", require("./routes/index"))
app.use("/auth", require("./routes/auth"))
app.use("/stories", require("./routes/stories"))

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})