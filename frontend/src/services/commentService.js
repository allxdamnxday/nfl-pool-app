import api from './api';

export const createComment = async (blogId, content) => {
  const response = await api.post(`/blogs/${blogId}/comments`, { content });
  return response.data;
};

export const getBlogComments = async (blogId) => {
  const response = await api.get(`/blogs/${blogId}/comments`);
  return response.data;
};

export const likeComment = async (commentId) => {
  const response = await api.post(`/comments/${commentId}/like`);
  return response.data;
};

export const editComment = async (commentId, content) => {
  const response = await api.put(`/comments/${commentId}`, { content });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

export const getComments = async (page = 1, limit = 10) => {
  const response = await api.get(`/comments?page=${page}&limit=${limit}`);
  return response.data;
};