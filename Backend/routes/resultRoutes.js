const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const reportController = require('../controllers/reportController');

router.get('/student/:studentId', resultController.getStudentSummary);
router.get('/class/:classStreamId/ranking', resultController.getClassRanking);
router.get('/subject/:subjectId/class/:classStreamId/positions', resultController.getSubjectPositions);
router.get('/subject/:subjectId/class/:classStreamId/performance', resultController.getClassPerformanceBySubject);
router.get('/report/student/:studentId', reportController.generateStudentReportCard);
router.get('/report/class/:classStreamId', reportController.generateClassReport);

module.exports = router;
