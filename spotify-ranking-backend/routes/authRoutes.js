const express = require('express');
const { login, refreshUserToken, logout } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/refresh', refreshUserToken);
router.post('/logout', logout);

module.exports = router;