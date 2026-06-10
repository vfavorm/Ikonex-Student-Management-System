import api from '../config/api';

export const getStudentSummary = (studentId) => api.get(`/results/student/${studentId}`);
export const getClassRanking = (classStreamId) => api.get(`/results/class/${classStreamId}/ranking`);
export const getSubjectPositions = (subjectId, classStreamId) =>
  api.get(`/results/subject/${subjectId}/class/${classStreamId}/positions`);
export const getClassPerformance = (subjectId, classStreamId) =>
  api.get(`/results/subject/${subjectId}/class/${classStreamId}/performance`);

export const downloadStudentReport = async (studentId) => {
  try {
    const response = await api.get(`/results/report/student/${studentId}`, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `student_${studentId}_report.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading student report:', error);
    throw error;
  }
};

export const downloadClassReport = async (classStreamId) => {
  try {
    const response = await api.get(`/results/report/class/${classStreamId}`, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `class_${classStreamId}_report.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading class report:', error);
    throw error;
  }
};
