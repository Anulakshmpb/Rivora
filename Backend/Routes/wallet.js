const express = require('express');
const router = express.Router();
const WalletController = require('../Controllers/WalletController');
const { authenticateUser } = require('../Middlewares/auth');

router.get('/', authenticateUser, WalletController.getWallet);

module.exports = router;
