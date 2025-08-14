const express = require('express');
const router = express.Router();
const healthController = require('./health.controller');

router.get('/', healthController.checkHealth);

module.exports = router;
