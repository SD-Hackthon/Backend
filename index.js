const express = require('express');
const path = require('path');
const connectDB = require("./config/db.js");
const userRoutes = require('./routes/userRoutes.js');
const companyRoutes = require('./routes/companyRoutes.js');
const { notFound, errorHandler } = require('./middleware/error.js');
const multer = require('multer');
// const cors = require('cors');
// const bodyParser = require('body-parser');


const app = express()
// app.use(cors)

//connect DB
connectDB()

// multer setup
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'logo');
    },
    filename: (req, file, cb) => {
        const tmp = Date.now().toString() + '-' + file.originalname;
        cb(null, tmp);
    }
});

const fileFilter = (req, file, cb) => {
if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
) {
    cb(null, true);
} else {
    cb(null, false);
}
};

// middleware for req.body to parse 
app.use(express.json())
app.use(multer({ storage : fileStorage, fileFilter : fileFilter }).single('image'));

// middleware - access to any req-res cycle
app.use((req, res, next) => {
    console.log(req.originalUrl)
    next()
})


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use( express.static(path.join(__dirname, 'logo')));
app.use('/docs', express.static(path.join(__dirname, 'docs')));


// routes
app.use('/api/users', userRoutes)
app.use('/api/company', companyRoutes)


// fallback for 404 error (using after all routes)
app.use(notFound)

// express error middleware
// overloading default error handler as it sends HTML as response
app.use(errorHandler)

app.listen(5000, () => {
    console.log('App is listening on url http://localhost:5000')
});