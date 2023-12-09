//users.js
const express = require('express');
const router = express.Router();
const path = require('path');
const pool = require('../db');
const bcrypt = require('bcrypt');

const staticPath = path.join(__dirname, 'public');

router.use(express.static(staticPath));

router.get('/register', (req, res) => {
    res.render('register', { message: req.query.message });
});

router.post('/register', async (req, res) => {
    const { login, pass, name } = req.body;

    const hashedPassword = await bcrypt.hash(pass, 10);

    const query = 'INSERT INTO account (login, pass, name) VALUES (?, ?, ?)';

    pool.query(query, [login, hashedPassword, name], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.redirect('/users/register?message=Registration failed');
        }

        console.log('Registration successful!');
        res.redirect('/users/registration-success');
    });
});


router.get('/login', (req, res) => {
    res.render('login', { message: req.query.message });
});

router.post('/login', (req, res) => {
    const { login, pass } = req.body;

    const query = 'SELECT * FROM account WHERE login = ?';

    pool.query(query, [login], async (error, results) => {
        if (error) throw error;

        if (results.length > 0) {
            const match = await bcrypt.compare(pass, results[0].pass);

            if (match) {
                req.session.userId = results[0].id;
                res.redirect('/users/dashboard');
            } else {
                res.redirect('/users/login?message=Invalid login or password');
            }
        } else {
            res.redirect('/users/login?message=Invalid login or password');
        }
    });
});

router.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

router.get('/registration-success', (req, res) => {
    res.render('registration-success');
});

module.exports = router;
