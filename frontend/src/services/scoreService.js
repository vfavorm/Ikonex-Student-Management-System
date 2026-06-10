import api from '../config/api';

export const recordScore = (studentId, subjectId, examScore, continuousAssessment) =>
  api.post('/scores', { studentId, subjectId, examScore, continuousAssessment });

export const getAllScores = () => api.get('/scores');
export const getScoreById = (id) => api.get(`/scores/${id}`);
export const getStudentScores = (studentId) => api.get(`/scores/student/${studentId}`);
export const getSubjectClassScores = (subjectId, classStreamId) =>
  api.get(`/scores/subject/${subjectId}/class/${classStreamId}`);
export const updateScore = (id, examScore, continuousAssessment) =>
  api.put(`/scores/${id}`, { examScore, continuousAssessment });
export const deleteScore = (id) => api.delete(`/scores/${id}`);
