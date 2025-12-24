
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    // Jika sudah login, langsung ke dashboard
    if (req.cookies.user) return res.redirect('/dashboard');
    res.render('index');
});

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const success = await User.create(username, password);
        if (success) {
            res.send('<script>alert("Registrasi Berhasil! Silahkan Login."); window.location="/"</script>');
        } else {
            res.send('<script>alert("Username sudah ada!"); window.location="/"</script>');
        }
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const isValid = await User.login(username, password);

        if (isValid) {
            // Set cookie dengan maxAge 1 hari
            res.cookie('user', username.trim().toLowerCase(), { maxAge: 86400000, httpOnly: true });
            res.redirect('/dashboard');
        } else {
            res.send('<script>alert("Login Gagal! Username atau Password salah."); window.location="/"</script>');
        }
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

app.get('/dashboard', async (req, res) => {
    if (!req.cookies.user) return res.redirect('/');
    try {
        const msgs = await Message.get(req.cookies.user);
        res.render('dashboard', { user: req.cookies.user, messages: msgs });
    } catch (err) {
        res.status(500).send("Error ambil pesan");
    }
});

app.get('/u/:username', (req, res) => {
    res.render('profile', { target: req.params.username });
});

app.post('/send/:username', async (req, res) => {
    try {
        await Message.send(req.params.username, req.body.text);
        res.send('<center style="background:black;color:white;padding:50px;height:100vh;"><h1>Pesan Terkirim! 🚀</h1><a href="/u/'+req.params.username+'" style="color:cyan">Kirim lagi</a></center>');
    } catch (err) {
        res.send("Gagal mengirim pesan.");
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('user');
    res.redirect('/');
});

module.exports = app;
