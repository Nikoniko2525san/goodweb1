
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ファイル保存先設定
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const number = req.body.number || 'unknown';
    const ext = path.extname(file.originalname);
    cb(null, `${number}${ext}`);
  }
});
const upload = multer({ storage });

// ログイン認証
app.post('/login', (req, res) => {
  const { id, password } = req.body;
  const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));
  const user = users.find(u => u.id === id && u.password === password);

  if (user) {
    res.json({ success: true, admin: id === '25252525' });
  } else {
    res.json({ success: false });
  }
});

// 画像アップロード処理
app.post('/upload', upload.single('photo'), (req, res) => {
  const { number } = req.body;
  const filePath = `/uploads/${req.file.filename}`;

  const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
  data[number] = filePath;
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

  res.json({ success: true, path: filePath });
});

// 顔写真取得
app.get('/photo/:number', (req, res) => {
  const number = req.params.number;
  const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

  if (data[number]) {
    res.sendFile(path.join(__dirname, data[number]));
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
