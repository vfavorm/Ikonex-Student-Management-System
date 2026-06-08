const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

router.post('/', subjectController.createSubject);
router.get('/', subjectController.getAllSubjects);
router.get('/:id', subjectController.getSubjectById);
router.get('/class/:classStreamId', subjectController.getSubjectsByClassStream);
router.put('/:id', subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);
router.post('/assign', subjectController.assignSubjectToClassStream);
router.post('/remove', subjectController.removeSubjectFromClassStream);

module.exports = router;
