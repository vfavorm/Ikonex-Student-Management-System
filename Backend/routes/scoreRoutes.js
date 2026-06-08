const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

router.post('/', scoreController.recordScore);
router.get('/', scoreController.getAllScores);
router.get('/:id', scoreController.getScoreById);
router.get('/student/:studentId', scoreController.getStudentScores);
router.get('/subject/:subjectId/class/:classStreamId', scoreController.getSubjectClassScores);
router.put('/:id', scoreController.updateScore);
router.delete('/:id', scoreController.deleteScore);

module.exports = router;
