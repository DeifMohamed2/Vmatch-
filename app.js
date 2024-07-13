require('dotenv').config()
const express = require('express');
const morgan = require('morgan')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')
const session = require('express-session')
const cors = require('cors')




const homeRoutes = require('./routes/homeRoutes')
const orgDashboardRoutes = require('./routes/orgDashboardRoutes')
const userDashboardRoutes = require('./routes/userDashboardRoutes')
const adminDashboardRoutes = require('./routes/adminDashboardRoutes')



// express app
const app = express();

const socketio = require('socket.io');


// Connect to mongodb
let io
const dbURI =   process.env.MONGODB_URI 
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        let server = app.listen(2000);

        io = socketio(server)
        io.on('connection', (socket) => {
            console.log(`New connection: ${socket.id}`);
        })

        console.log("App lisitning on port 2000")
    }).catch((err) => {
        console.log(err)
    })

// register view engine
app.set('view engine', 'ejs');

// listen for requests

app.use(cors())
app.use((req, res, next) => {
    req.io = io; // Attach io to the request object
    next(); // Move to the next middleware or route handler
});

app.use(morgan('dev'));

app.use(express.static('public'))


app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// let uri = ""; // Declare the 'uri' variable

app.use(session({
    secret: "Keybord",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: dbURI
    }),

}))


// Custom middleware to make io accessible in all routes


app.use('/', homeRoutes)
app.use('/org', orgDashboardRoutes)
app.use('/user', userDashboardRoutes)
app.use('/admin', adminDashboardRoutes)


// 404 page
app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});
