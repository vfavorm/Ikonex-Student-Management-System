import api from '../config/api';

export const createSubject = (name, code) => api.post('/subjects', { name, code });
export const getAllSubjects = () => api.get('/subjects');
export const getSubjectById = (id) => api.get(`/subjects/${id}`);
export const getSubjectsByClassStream = (classStreamId) => api.get(`/subjects/class/${classStreamId}`);
export const getStreamsBySubject = (subjectId) => api.get(`/subjects/${subjectId}/streams`);
export const updateSubject = (id, name, code) => api.put(`/subjects/${id}`, { name, code });
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);
export const assignSubject = (classStreamId, subjectId) =>
  api.post('/subjects/assign', { classStreamId, subjectId });
export const removeSubject = (classStreamId, subjectId) =>
  api.post('/subjects/remove', { classStreamId, subjectId });
