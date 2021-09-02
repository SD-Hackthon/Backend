const express = require('express');
const path = require('path');
const connectDB = require("./config/db.js");
const userRoutes = require('./routes/userRoutes.js');
const companyRoutes = require('./routes/companyRoutes.js');
const { notFound, errorHandler } = require('./middleware/error.js');
const multer = require('multer');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const shortid = require('shortid')
const Razorpay = require('razorpay')
const bodyParser = require('body-parser')

const razorpay = new Razorpay({
    key_id: 'rzp_test_fojLAXlUSy8SKB',
    key_secret: '7LKPfIcR9tbtwwyWAouhVJf0'
});

// const bodyParser = require('body-parser');

require('dotenv').config()

const app = express()
app.use(cors())
app.use(bodyParser.json())

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
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

// middleware - access to any req-res cycle
app.use((req, res, next) => {
    console.log(req.originalUrl)
    next()
})


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'logo')));
app.use('/docs', express.static(path.join(__dirname, 'docs')));


// routes
app.use('/api/users', userRoutes)
app.use('/api/company', companyRoutes)

app.get('/lg.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'logo', '1630507769181-lg.png'))
})

app.post('/verification', (req, res) => {
    const secret = 'abcdefghijklmnopqrstuvwxyz'

    const crypto = require('crypto')
    const shasum = crypto.createHmac('sha256', secret)
    shasum.update(JSON.stringify(req.body))
    const digest = shasum.digest('hex')

    if (digest === req.headers['x-razorpay-signature']) {
        console.log(req.body);
        console.log(req.body['payload']['payment']);
        console.log('request is legit')
        require('fs').writeFileSync('payment1.json', JSON.stringify(req.body, null, 4))
    } else {
        // pass it
    }
    res.json({ status: 'ok' })
})

app.post('/razorpay', async (req, res) => {
    const payment_capture = 1
    const amount = 499
    const currency = 'INR'

    const options = {
        amount: amount * 100,
        currency,
        receipt: shortid.generate(),
        payment_capture
    }

    try {
        const response = await razorpay.orders.create(options)
        console.log(response)
        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount
        })
    } catch (error) {
        console.log(error)
    }
});


function sendmail(to, subject, html) {
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
        to: to,
        from: 'subramanyag9112@gmail.com',
        subject: subject,
        text: '',
        html: html,
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
            res.send("OKAY");
        })
        .catch((error) => {
            console.error(error)
        })
}

app.get("/payment-success", (req, res) => {
    require('fs').writeFileSync('payment1.json', JSON.stringify(req.body, null, 4))
    res.json({ status: 'ok' })
})

app.get("/create-link", (req, res) => {
    fetch("https://api.razorpay.com/v1/payment_links/", {
        body: JSON.stringify({
            "upi_link": "true",
            "amount": 100,
            "currency": "INR",
            "accept_partial": false,
            "expire_by": 1691097057,
            "reference_id": shortid.generate(),
            "description": "Payment for policy no #23456",
            "customer": {
                "name": "Subramanya G",
                "contact": "+919482117332",
                "email": "subramanyag9112@gmail.com"
            },
            "notify": {
                "sms": true,
                "email": true
            },
            "reminder_enable": true,
            "notes": {
                "policy_name": "Jeevan Bima"
            },
        }),
        headers: {
            "Authorization": 'Basic cnpwX2xpdmVfeUlBWlk2VG5iZk9TV0M6d2ZmNGlCT0I4ZGp2YXZnNEJtQ3U5cVFq',
            "Content-Type": "application/json"
        },
        method: "POST"
    })
        .then(res => res.json())
        .then(resp => {
            res.json({ message: resp });
        });
});

// fallback for 404 error (using after all routes)
app.use(notFound)

// express error middleware
// overloading default error handler as it sends HTML as response
app.use(errorHandler)

app.listen(5000, () => {
    console.log('App is listening on url http://localhost:5000')
});