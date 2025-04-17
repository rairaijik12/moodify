const express = require('express');
const MoodEntries = require('../controllers/mood_entries_ctrl');
const router = express.Router();




router.post('/addEntry', MoodEntries.addMoodEntry)
router.get('/getEntry/:user_ID', MoodEntries.getEntriesByUId)
router.get('/getAllEntries', MoodEntries.getAllEntries)
router.put('/updateEntry/:id', MoodEntries.updateEntryById)
router.delete('/deleteEntry/:id', MoodEntries.deleteMoodEntry)


module.exports = router;