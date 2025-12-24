
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Middleware Auth Sederhana
const checkAuth = (req, res, next) => {
    if (!req.cookies.user) return res.redirect('/');
    next();
};

// ROUTES
app.get('/', (req, res) => res.render('index'));

app.post('/register', async (req, res) => {
    const success = await User.create(req.body.username, req.body.password);
    if (success) res.send('<script>alert("Berhasil! Silahkan Login."); window.location="/"</script>');
    else res.send('Username sudah dipakai.');
});

app.post('/login', async (req, res) => {
    const valid = await User.login(req.body.username, req.body.password);
    if (valid) {
        res.cookie('user', req.body.username);
        res.redirect('/dashboard');
    } else {
        res.send('Login Gagal.');
    }
});

app.get('/dashboard', checkAuth, async (req, res) => {
    const msgs = await Message.get(req.cookies.user);
    res.render('dashboard', { user: req.cookies.user, messages: msgs });
});

// Halaman Public Kirim Pesan
app.get('/u/:username', (req, res) => {
    res.render('profile', { target: req.params.username });
});

app.post('/send/:username', async (req, res) => {
    await Message.send(req.params.username, req.body.text);
    res.send('<center><h1>Pesan Terkirim! 🚀</h1><a href="/u/'+req.params.username+'">Kirim lagi</a></center>');
});

app.get('/logout', (req, res) => {
    res.clearCookie('user');
    res.redirect('/');
});

module.exports = app; // Penting untuk Vercel
