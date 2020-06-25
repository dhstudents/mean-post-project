const express = require('express');
const router = express.Router();
const Post = require('../models/post.schema');
const multer = require('multer');
// const {
//   createPostfix
// } = require('typescript');
const checkAuth = require('../middleware/check-auth')


const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype]
    let error = new Error('Invalid mime type')
    if (isValid) {
      error = null
    }
    cb(error, 'backend/images') // relative to server.js
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLocaleLowerCase().split(' ').join('-')
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext)
  }
})

// get all
router.get('', (req, res) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * currentPage - 1)
      .limit(pageSize)
  }
  // Post.find()
  let posts;
  postQuery
    .then(documents => {
      posts = documents;
      return Post.count()
    })
    .then(count => {
      console.log(posts) // _id on server , id on client
      res.status(200).json({
        message: 'ok',
        posts,
        count
      });
    });
})


// multer with config will search single file in the request body named image
router.post('', checkAuth, multer({
  storage
}).single('image'), (req, res) => {
  url = req.protocol + "://" + req.get('host')
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userid
  })
  console.log(post)
  post.save() // save to database mean-posts the collectios name is 'posts'
    .then(createdPost => {
      res.status(201).json({
        message: 'POST ok created',
        // postId: createdPost._id
        post: {
          ...createdPost,
          id: createdPost._id
        }
      })
    })
})

router.put('/:id', checkAuth, multer({
  storage
}).single('image'), (req, res) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get('host');
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    imagePath,
    creator: req.userData.userid
  })
  Post.updateOne({
      _id: req.params.id,
      creator: req.userData.userid
    }, post)
    .then(result => {
      console.log(result);
      if (result.nModified) {
        res.status(200).json({
          message: 'Update successfull'
        })
      } else {
        res.status(401).json({
          message: 'Not authorized'
        })
      }
    })
})

router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post)

      } else {
        res.status(404).send({
          message: 'Post not found!'
        })
      }
    })
})

// DELETE
router.delete('/:id', checkAuth, (req, res) => {
  console.log(req.params.id);
  Post.deleteOne({
      _id: req.params.id,
      creator: req.userData.userid
    })
    .then(result => {
      console.log(result)
      if (result.n > 0) {
        res.status(200).send({
          message: 'Post deleted...'
        })
      } else {
        res.status(401).send({
          message: 'Not authorized...'
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
})


module.exports = router;
