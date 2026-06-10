import api from '../config/api';

export const createClassStream = (name) => api.post('/class-streams', { name });
export const getAllClassStreams = () => api.get('/class-streams');
export const getClassStreamById = (id) => api.get(`/class-streams/${id}`);
export const updateClassStream = (id, name) => api.put(`/class-streams/${id}`, { name });
export const deleteClassStream = (id) => api.delete(`/class-streams/${id}`);
