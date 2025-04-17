const express = require('express');
const Notifications = require('../controllers/mood_entries_ctrl');
const router = express.Router();

router.post('/addNotif', Notifications.createNotif)
router.get('/getEntry/:id', Notifications.getNotif)
router.put('/updateNotif', Notifications.updateNotif)

module.exports = router;