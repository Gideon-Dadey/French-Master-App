import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Use your backend URL - update this to your actual backend
// For Android Emulator: use 'http://10.0.2.2:5001/api'
// For iOS Simulator: use 'http://localhost:5001/api'
// For Physical Device: use your computer's local IP (e.g., 'http://192.168.0.135:5001/api')
// Find your IP: Windows (ipconfig) or Mac/Linux (ifconfig)

// Auto-detect platform and set appropriate URL
const getApiUrl = () => {
  if (__DEV__) {
    // For Android
    if (Platform.OS === 'android') {
      // Try to detect if running on emulator or physical device
      // Physical device: use your computer's local IP
      // Emulator: use 10.0.2.2 to access host machine
      // 
      // IMPORTANT: If you're using a PHYSICAL Android device, 
      // change this to your computer's IP address (192.168.0.135)
      // If you're using Android EMULATOR, use 10.0.2.2
      
      // For physical device (uncomment and use your IP):
      return 'http://192.168.0.135:5001/api';
      
      // For Android emulator (uncomment this instead):
      // return 'http://10.0.2.2:5001/api';
    }
    // For iOS simulator
    if (Platform.OS === 'ios') {
      return 'http://localhost:5001/api';
    }
    // Default for physical device
    return 'http://192.168.0.135:5000/api';
  }
  return 'https://api.frenchmastergh.com/api';
};

const API_URL = getApiUrl();
console.log('API URL:', API_URL); // Debug: Check which URL is being used

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { token } = response.data;
          await SecureStore.setItemAsync('authToken', token);
          
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

// Courses API
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  getFeatured: () => api.get('/courses/featured/list'),
  search: (query) => api.get('/courses', { params: { search: query } }),
};

// Lessons API
export const lessonsAPI = {
  getByCourse: (courseId) => api.get(`/lessons/course/${courseId}`),
  getById: (id) => api.get(`/lessons/${id}`),
  updateProgress: (id, data) => api.post(`/lessons/${id}/progress`, data),
};

// Payments API
export const paymentsAPI = {
  createIntent: (data) => api.post('/payments/create-intent', data),
  confirm: (data) => api.post('/payments/confirm', data),
  getHistory: () => api.get('/payments/history'),
};

// Progress API
export const progressAPI = {
  getByCourse: (courseId) => api.get(`/progress/course/${courseId}`),
  getDashboard: () => api.get('/progress/dashboard'),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getMyCourses: () => api.get('/users/my-courses'),
};

// Reviews API
export const reviewsAPI = {
  getByCourse: (courseId) => api.get(`/reviews/course/${courseId}`),
  create: (data) => api.post('/reviews', data),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

// Wishlist API
export const wishlistAPI = {
  getAll: () => api.get('/wishlist'),
  add: (courseId) => api.post('/wishlist', { courseId }),
  remove: (courseId) => api.delete(`/wishlist/${courseId}`),
};

// Resources API
export const resourcesAPI = {
  getAll: (params) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  getCategories: () => api.get('/resources/categories'),
  getDownloadUrl: (id) => api.get(`/resources/${id}/download-url`),
  trackDownload: (id) => api.post(`/resources/${id}/download`),
};

// Blog API
export const blogAPI = {
  getAll: (params) => api.get('/blog', { params }),
  getById: (id) => api.get(`/blog/${id}`),
  getByCategory: (category, params) => api.get(`/blog/category/${category}`, { params }),
  getFeatured: () => api.get('/blog/featured/list'),
};

// Study Groups API
export const studyGroupsAPI = {
  getAll: (params) => api.get('/study-groups', { params }),
  getById: (id) => api.get(`/study-groups/${id}`),
  create: (data) => api.post('/study-groups', data),
  update: (id, data) => api.put(`/study-groups/${id}`, data),
  join: (id, inviteCode) => api.post(`/study-groups/${id}/join`, { inviteCode }),
  leave: (id) => api.post(`/study-groups/${id}/leave`),
  removeMember: (groupId, userId) => api.post(`/study-groups/${groupId}/members/${userId}/remove`),
  addDiscussion: (id, message) => api.post(`/study-groups/${id}/discussions`, { message }),
  addResource: (id, data) => api.post(`/study-groups/${id}/resources`, data),
  delete: (id) => api.delete(`/study-groups/${id}`),
};

// Leaderboard API
export const leaderboardAPI = {
  getAll: (params) => api.get('/leaderboard', { params }),
  getMe: () => api.get('/leaderboard/me'),
  getAroundMe: (params) => api.get('/leaderboard/around-me', { params }),
  updateStats: (data) => api.post('/leaderboard/update-stats', data),
};

// Questions API (Q&A Forum)
export const questionsAPI = {
  getAll: (params) => api.get('/questions', { params }),
  getById: (id) => api.get(`/questions/${id}`),
  create: (data) => api.post('/questions', data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
  upvote: (id) => api.post(`/questions/${id}/upvote`),
  downvote: (id) => api.post(`/questions/${id}/downvote`),
  addAnswer: (id, content) => api.post(`/questions/${id}/answers`, { content }),
  acceptAnswer: (questionId, answerId) => api.post(`/questions/${questionId}/answers/${answerId}/accept`),
  upvoteAnswer: (questionId, answerId) => api.post(`/questions/${questionId}/answers/${answerId}/upvote`),
  downvoteAnswer: (questionId, answerId) => api.post(`/questions/${questionId}/answers/${answerId}/downvote`),
  addComment: (questionId, answerId, content) => api.post(`/questions/${questionId}/answers/${answerId}/comments`, { content }),
};

// Progress Share API
export const progressShareAPI = {
  getAll: (params) => api.get('/progress-share', { params }),
  getById: (id) => api.get(`/progress-share/${id}`),
  create: (data) => api.post('/progress-share', data),
  update: (id, data) => api.put(`/progress-share/${id}`, data),
  delete: (id) => api.delete(`/progress-share/${id}`),
  like: (id) => api.post(`/progress-share/${id}/like`),
  addComment: (id, content) => api.post(`/progress-share/${id}/comments`, { content }),
  share: (id) => api.post(`/progress-share/${id}/share`),
  getByUser: (userId, params) => api.get(`/progress-share/user/${userId}`, { params }),
};

// Discussions API
export const discussionsAPI = {
  getAll: (params) => api.get('/discussions', { params }),
  getById: (id) => api.get(`/discussions/${id}`),
  create: (data) => api.post('/discussions', data),
  update: (id, data) => api.put(`/discussions/${id}`, data),
  delete: (id) => api.delete(`/discussions/${id}`),
  like: (id) => api.post(`/discussions/${id}/like`),
  addReply: (id, content) => api.post(`/discussions/${id}/replies`, { content }),
  updateReply: (id, replyId, content) => api.put(`/discussions/${id}/replies/${replyId}`, { content }),
  deleteReply: (id, replyId) => api.delete(`/discussions/${id}/replies/${replyId}`),
  likeReply: (id, replyId) => api.post(`/discussions/${id}/replies/${replyId}/like`),
};

// Topics API
export const topicsAPI = {
  getAll: () => api.get('/topics'),
  getById: (topicId, params) => api.get(`/topics/${topicId}`, { params }),
};

// Admin Students API
export const studentsAPI = {
  getAll: (params) => api.get('/admin/students', { params }),
  getById: (id) => api.get(`/admin/students/${id}`),
  update: (id, data) => api.put(`/admin/students/${id}`, data),
  delete: (id) => api.delete(`/admin/students/${id}`),
};

// Instructor Students API
export const instructorStudentsAPI = {
  getAll: (params) => api.get('/users/instructor/students', { params }),
  getById: (id) => api.get(`/users/instructor/students/${id}`),
};

export default api;
