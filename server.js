const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));


app.post('/posts', upload.single('image'), async (req, res) => {
  try {
    const { title, text } = req.body;

    const imageUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

    const post = await prisma.post.create({
      data: {
        title,
        text,
        image: imageUrl,
      },
    });

    res.status(201).json(post); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});


app.get('/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany();
    res.status(200).json(posts); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve posts' });
  }
});


app.put('/posts/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, text } = req.body;
    const imageUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

    const post = await prisma.post.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title,
        text,
        ...(imageUrl && { image: imageUrl }),
      },
    });

    res.status(200).json(post); 
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(500).json({ error: 'Failed to update post' });
  }
});


app.delete('/posts/:id', async (req, res) => {
  try {
    const post = await prisma.post.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(200).json("Deleted Successfully");
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(500).json({ error: 'Failed to delete post' });
  }
});


app.use((err, req, res, next) => {
  console.error(err); 
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
