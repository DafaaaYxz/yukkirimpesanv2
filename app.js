
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();

// PERBAIKAN DI SINI: Memberitahu Vercel lokasi folder views secara absolut
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Route Dasar
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/register', async (req, res) => {
    try {
        const success = await User.create(req.body.username, req.body.password);
        if (success) res.send('<script>alert("Berhasil! Silahkan Login."); window.location="/"</script>');
        else res.send('Username sudah dipakai.');
    } catch (err) {
        res.status(500).send("Error Database: " + err.message);
    }
});

app.post('/login', async (req, res) => {
    const valid = await User.login(req.body.username, req.body.password);
    if (valid) {
        res.cookie('user', req.body.username);
        res.redirect('/dashboard');
    } else {
        res.send('Login Gagal. Username/Password salah.');
    }
});

app.get('/dashboard', async (req, res) => {
    if (!req.cookies.user) return res.redirect('/');
    const msgs = await Message.get(req.cookies.user);
    res.render('dashboard', { user: req.cookies.user, messages: msgs });
});

app.get('/u/:username', (req, res) => {
    res.render('profile', { target: req.params.username });
});

app.post('/send/:username', async (req, res) => {
    await Message.send(req.params.username, req.body.text);
    res.send('<center style="background:black; color:white; height:100vh; padding-top:50px; font-family:sans-serif;"><h1>Pesan Terkirim! 🚀</h1><a href="/u/'+req.params.username+'" style="color:cyan;">Kirim lagi</a></center>');
});

app.get('/logout', (req, res) => {
    res.clearCookie('user');
    res.redirect('/');
});

module.exports = app;
