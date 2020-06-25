const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const mongoose = require('mongoose');

app.use('/images' , express.static(path.join('backend/images')))
app.use(bodyParser.json())
//app.use(bodyParser.urlencoded({ extended : false})
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://127.0.0.1:27017/mean-posts', {
  useNewUrlParser: true,
    useUnifiedTopology: true
  }) // mean-posts db name
  .then(() => {
    console.log('connected to mongoDB')
  })
  .catch(() => {
    console.log('Connection Error!!!!!;')
  })


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*") // allow all domains will be serve
  // res.setHeader('Access-Control-Allow-Headers', "Origin , X-Request-With , Content-Type , Accept"); // requiests with these headers will be serve
  res.setHeader('Access-Control-Allow-Headers', "Authorization , Origin , X-Request-With , Content-Type , Accept"); // requiests with these headers will be serve
  res.setHeader('Access-Control-Allow-Methods', "GET , POST , PATCH , PUT , DELETE , OPTIONS")
  next();
})


app.use('/api/posts' , postsRoutes)
app.use('/api/user' , userRoutes)



module.exports = app;
