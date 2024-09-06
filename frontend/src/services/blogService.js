import api from './api';

export const getBlogPosts = async (page = 1, limit = 10) => {
  const response = await api.get(`/blogs?page=${page}&limit=${limit}`);
  return response.data;
};

export const getBlogPost = async (id) => {
  const response = await api.get(`/blogs/${id}`);
  return response.data;
};

export const createBlogPost = async (blogData) => {
  const response = await api.post('/blogs', blogData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateBlogPost = async (id, blogData) => {
  const response = await api.put(`/blogs/${id}`, blogData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteBlogPost = async (id) => {
  const response = await api.delete(`/blogs/${id}`);
  return response.data;
};

export const likeBlogPost = async (id) => {
  const response = await api.post(`/blogs/${id}/like`);
  return response.data;
};

export const getFeaturedBlogPosts = async () => {
  const response = await api.get('/blogs/featured');
  return response.data;
};

export const getBlogComments = async (blogId) => {
  const response = await api.get(`/blogs/${blogId}/comments`);
  return response.data;
};

export const createComment = async (blogId, commentData) => {
  const response = await api.post(`/blogs/${blogId}/comments`, commentData);
  return response.data;
};

export const updateComment = async (blogId, commentId, commentData) => {
  const response = await api.put(`/blogs/${blogId}/comments/${commentId}`, commentData);
  return response.data;
};

export const deleteComment = async (blogId, commentId) => {
  const response = await api.delete(`/blogs/${blogId}/comments/${commentId}`);
  return response.data;
};

export const likeComment = async (blogId, commentId) => {
  const response = await api.post(`/blogs/${blogId}/comments/${commentId}/like`);
  return response.data;
};

export const getLatestBlogPost = async () => {
  try {
    const response = await getBlogPosts(1, 1); // Get the first page with only one post
    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error('Error fetching latest blog post:', error);
    throw error;
  }
};