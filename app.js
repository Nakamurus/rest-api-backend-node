const path = require('path');
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'iamge/png' ||
        file.mimetype === 'image.jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'application/pdf'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use(bodyParser.json());
app.use(
    multer({
        storage: fileStorage,
        fileFilter: fileFilter
    })
    .single('image')
)

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );
    res.setHeader('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Credentials', true);

    if (req.method === 'OPTIONS') {
        // make sure that OPTIONS request doesn't go to the graphQL's endpoint
        // while we can handle it gracefully
        return res.sendStatus(200);
    }
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error.data);
    const status = error.statusCode || 500;
    const message = error.data[0].msg;

    res.status(status).json({ message: message });
})

mongoose
  .connect(
      process.env.MONGODBCONNECTIONSTR,
      {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false
      })
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err));