import api from '../config/api';

export const registerStudent = (name, admissionNumber, classStreamId, dateOfBirth) =>
  api.post('/students', { name, admissionNumber, classStreamId, dateOfBirth });

export const getAllStudents = () => api.get('/students');
export const getStudentById = (id) => api.get(`/students/${id}`);
export const getStudentsByClassStream = (classStreamId) => api.get(`/students/class/${classStreamId}`);
export const updateStudent = (id, name, admissionNumber, classStreamId, dateOfBirth) =>
  api.put(`/students/${id}`, { name, admissionNumber, classStreamId, dateOfBirth });
export const deleteStudent = (id) => api.delete(`/students/${id}`);
