import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const getApiUrl = () => {
  if (__DEV__) {

    if (Platform.OS === 'android') {

      return 'http://192.168.0.135:5001/api';

    }

    if (Platform.OS === 'ios') {
      return 'http://localhost:5001/api';
    }

    return 'http://192.168.0.135:5000/api';
  }
  return 'https://api.frenchmastergh.com/api';
};

const API_URL = getApiUrl();
console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {

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

        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  getFeatured: () => api.get('/courses/featured/list'),
  search: (query) => api.get('/courses', { params: { search: query } }),
};

export const lessonsAPI = {
  getByCourse: (courseId) => api.get(`/lessons/course/${courseId}`),
  getById: (id) => api.get(`/lessons/${id}`),
  updateProgress: (id, data) => api.post(`/lessons/${id}/progress`, data),
};

export const paymentsAPI = {
  createIntent: (data) => api.post('/payments/create-intent', data),
  confirm: (data) => api.post('/payments/confirm', data),
  confirmCourse: (data) => api.post('/payments/confirm', data),
  getHistory: () => api.get('/payments/history'),
};

export const progressAPI = {
  getByCourse: (courseId) => api.get(`/progress/course/${courseId}`),
  getDashboard: () => api.get('/progress/dashboard'),
};

export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getMyCourses: () => api.get('/users/my-courses'),
  updatePushToken: (pushToken) => api.put('/users/push-token', { pushToken }),
};

export const reviewsAPI = {
  getByCourse: (courseId) => api.get(`/reviews/course/${courseId}`),
  create: (data) => api.post('/reviews', data),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

export const wishlistAPI = {
  getAll: () => api.get('/wishlist'),
  add: (courseId) => api.post('/wishlist', { courseId }),
  remove: (courseId) => api.delete(`/wishlist/${courseId}`),
};

export const resourcesAPI = {
  getAll: (params) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  getCategories: () => api.get('/resources/categories'),
  getDownloadUrl: (id) => api.get(`/resources/${id}/download-url`),
  trackDownload: (id) => api.post(`/resources/${id}/download`),
};

export const blogAPI = {
  getAll: (params) => api.get('/blog', { params }),
  getById: (id) => api.get(`/blog/${id}`),
  getByCategory: (category, params) => api.get(`/blog/category/${category}`, { params }),
  getFeatured: () => api.get('/blog/featured/list'),
  create: (data) => api.post('/blog', data),
  update: (id, data) => api.put(`/blog/${id}`, data),
  delete: (id) => api.delete(`/blog/${id}`),
  like: (id) => api.post(`/blog/${id}/like`),
  comment: (id, content) => api.post(`/blog/${id}/comments`, { content }),
};

export const studyGroupsAPI = {
  getAll: (params) => api.get('/study-groups', { params }),
  getById: (id) => api.get(`/study-groups/${id}`),
  create: (data) => api.post('/study-groups', data),
  update: (id, data) => api.put(`/study-groups/${id}`, data),
  join: (id, inviteCode) => api.post(`/study-groups/${id}/join`, { inviteCode }),
  leave: (id) => api.post(`/study-groups/${id}/leave`),
  removeMember: (groupId, userId) => api.post(`/study-groups/${groupId}/members/${userId}/remove`),
  addDiscussion: (id, message) => api.post(`/study-groups/${id}/discussions`, { message }),
  deleteDiscussion: (groupId, messageId) => api.delete(`/study-groups/${groupId}/discussions/${messageId}`),
  reactToDiscussion: (groupId, messageId, emoji) => api.post(`/study-groups/${groupId}/discussions/${messageId}/react`, { emoji }),
  addResource: (id, data) => api.post(`/study-groups/${id}/resources`, data),
  delete: (id) => api.delete(`/study-groups/${id}`),
};

export const leaderboardAPI = {
  getAll: (params) => api.get('/leaderboard', { params }),
  getMe: () => api.get('/leaderboard/me'),
  getAroundMe: (params) => api.get('/leaderboard/around-me', { params }),
  updateStats: (data) => api.post('/leaderboard/update-stats', data),
};

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

export const topicsAPI = {
  getAll: () => api.get('/topics'),
  getById: (topicId, params) => api.get(`/topics/${topicId}`, { params }),
};

export const studentsAPI = {
  getAll: (params) => api.get('/admin/students', { params }),
  getById: (id) => api.get(`/admin/students/${id}`),
  update: (id, data) => api.put(`/admin/students/${id}`, data),
  delete: (id) => api.delete(`/admin/students/${id}`),
};

export const instructorStudentsAPI = {
  getAll: (params) => api.get('/users/instructor/students', { params }),
  getById: (id) => api.get(`/users/instructor/students/${id}`),
};

export const subscriptionsAPI = {
  getAll: () => api.get('/subscriptions'),
  getActive: () => api.get('/subscriptions/active'),
  create: (data) => api.post('/subscriptions', data),
  cancel: (id) => api.put(`/subscriptions/${id}/cancel`),
  createSubscriptionIntent: (data) => api.post('/payments/create-subscription-intent', data),
  confirmSubscription: (data) => api.post('/payments/confirm-subscription', data),
};

export const uploadsAPI = {

  uploadVideo: async (videoData, onProgress) => {
    const formData = new FormData();
    formData.append('video', {
      uri: videoData.uri,
      type: videoData.type || 'video/mp4',
      name: videoData.name || `video_${Date.now()}.mp4`,
    });

    return api.post('/uploads/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },

  uploadImage: async (imageData) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageData.uri,
      type: imageData.type || 'image/jpeg',
      name: imageData.name || `image_${Date.now()}.jpg`,
    });

    return api.post('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getSignedUrl: (fileType, fileName) =>
    api.post('/uploads/signed-url', { fileType, fileName }),

  deleteFile: (fileUrl) =>
    api.delete('/uploads/file', { data: { fileUrl } }),
};

export const sampleVideosAPI = {
  getAll: (params) => api.get('/sample-videos', { params }),
  getById: (id) => api.get(`/sample-videos/${id}`),
  create: (data) => api.post('/sample-videos', data),
  update: (id, data) => api.put(`/sample-videos/${id}`, data),
  delete: (id) => api.delete(`/sample-videos/${id}`),
  publish: (id) => api.put(`/sample-videos/${id}/publish`),
  unpublish: (id) => api.put(`/sample-videos/${id}/unpublish`),
  getByCourse: (courseId) => api.get(`/sample-videos/course/${courseId}`),
  assignToCourse: (videoId, courseId) =>
    api.put(`/sample-videos/${videoId}/assign`, { courseId }),
};

export default api;
