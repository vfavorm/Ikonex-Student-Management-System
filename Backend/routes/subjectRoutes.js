const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

router.post('/', subjectController.createSubject);
router.get('/', subjectController.getAllSubjects);
router.get('/class/:classStreamId', subjectController.getSubjectsByClassStream);
router.get('/:id/streams', subjectController.getStreamsBySubject);
router.get('/:id', subjectController.getSubjectById);
router.put('/:id', subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);
router.post('/assign', subjectController.assignSubjectToClassStream);
router.post('/remove', subjectController.removeSubjectFromClassStream);

module.exports = router;
