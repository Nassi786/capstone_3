const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const postsFilePath = path.join(__dirname, 'posts.json');

let posts = [];
if (fs.existsSync(postsFilePath)) {
  try {
    const data = fs.readFileSync(postsFilePath, 'utf8');
    posts = JSON.parse(data);
  } catch (err) {
    console.error('Error reading posts file:', err);
  }
}

const savePosts = () => {
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
};

app.get('/', (req, res) => {
  res.render('index', { posts });
});

app.get('/create', (req, res) => {
  res.render('create', { error: null });
});

app.post('/create', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.render('create', { error: 'Title and content are required!' });
  }
  const newPost = { id: Date.now().toString(), title, content };
  posts.push(newPost);
  savePosts();
  res.redirect('/');
});

app.get('/edit/:id', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  res.render('edit', { post });
});

app.post('/update/:id', (req, res) => {
  const { title, content } = req.body;
  const post = posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.redirect('/');
  }
  post.title = title;
  post.content = content;
  savePosts();
  res.redirect('/');
});

app.post('/delete/:id', (req, res) => {
  posts = posts.filter(p => p.id !== req.params.id);
  savePosts();
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));