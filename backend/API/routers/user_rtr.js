const express = require('express');
const { User } = require("../models"); // Adjust the path based on your project structure
const user_ctrl = require('../controllers/user_ctrl');
const router = express.Router();


router.get('/getUser/:id', user_ctrl.getUserById)
router.get('/getAllUsers', user_ctrl.getAllUsers)
router.get('/checkUser', user_ctrl.checkUserExists)
router.post('/addUser', user_ctrl.addUser)
router.put('/setPasscode/:id', user_ctrl.setPasscode)
router.put('/updateUser/:id', user_ctrl.updateUserById)
router.delete('/deleteUser/:id', user_ctrl.deleteUser)




module.exports = router;