const express = require('express');
const router = express.Router();
const User = require('../models/user.schema');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
// npm i bcrypt
router.post('/signup', (req, res) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      })

      user.save().then(result => {
        res.status(201).json({
          message: 'User created.',
          result
        })
      }).catch(error => {
        res.status(500).json({
          error
        })
      })
    })
});

router.post('/login', (req, res) => {
  let fetchedUser
  User.findOne({
      email: req.body.email
    })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          massage: 'Authentication failed!!!!'
        })
      }
      fetchedUser = user
      return bcrypt.compare(req.body.password, user.password)
        .then(result => {
          if (!result) {
            return res.status(401).json({
              massage: 'Authentication failed!!!!'
            })
          }

          // create jwt: npm i jsonwebtoken
          const token = jwt.sign({ email: fetchedUser.email, userId: fetchedUser._id }, 'a_long_secret_word', {
            expiresIn: '1h',
          });

          res.status(200).json({
            token,
            expiresIn: 3600,
            userId: fetchedUser._id
          });
        })
        .catch(error => {
          return res.status(500).json({
            error
          })
        })

    })
})
















module.exports = router;
