const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.post('/', studentController.registerStudent);
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.get('/class/:classStreamId', studentController.getStudentsByClassStream);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
