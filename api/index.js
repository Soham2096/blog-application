const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/user');
const Post = require('./models/Post')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({dest:'uploads/'})
const fs = require('fs');
const { exit } = require("process");

const app = express();

const salt = bcrypt.genSaltSync(10);
const secret = 'sderfbjhgie56709iyokg';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
// app.use(cors());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.json())
app.use(cookieParser());

mongoose.connect('mongodb+srv://soham6902:dJfpefiErWbb9Pfd@cluster0.cab8pxw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then((res,err) =>{
  if (err) {console.log("eror in connecting to mongodb.")
    exit()}
  console.log("connected to db successfully.")

}
)
app.post('/register', async (req,res) => {
  const {username,password} = req.body;
  try{
    const userDoc = await User.create({
      username,
      password:bcrypt.hashSync(password,salt),
    });
    res.json(userDoc);
  } catch(e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post('/login', async (req,res) => {
  const {username,password} = req.body;
  const userDoc = await User.findOne({username});
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id:userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});

app.get('/profile', (req,res) => {
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, (err,info) => {
    if (err) return res.json({error: `${err.message}`});
    console.log({info})
    res.json({info});
  });
});

app.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
  if (!req.file) return res.json({error:"no file received."})
  const {originalname,path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) return res.json({error: `${err.message}`});;
    const {title,summary,content} = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover:newPath,
      author:info.id,
    });
    res.json(postDoc);
  });

});

app.put('/post', uploadMiddleware.single('file'), async (req,res) => {
  let newPath = null;
  if (req.file) {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  }

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) return res.status(401).json("unauthticated.");
    const {id,title,summary,content} = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }
    // this code inserts/updates the post to mongodb. 
    await postDoc.updateOne({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });

    res.json(postDoc);
  });

});

app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
});

app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})

const port = 4000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });


 
  
//dJfpefiErWbb9Pfd
//mongodb+srv://soham6902:dJfpefiErWbb9Pfd@cluster0.cab8pxw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0