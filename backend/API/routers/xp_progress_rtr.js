const express = require('express');
const XPProgress = require('../controllers/xp_progress_ctrl');
const router = express.Router();



router.post('/addXPProgress', XPProgress.createXPProgress)




module.exports = router;