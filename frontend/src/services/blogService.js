import api from './api';

export const getBlogPosts = async () => {
  const response = await api.get('/blogs');
  return response.data;
};

export const getBlogPost = async (id) => {
  const response = await api.get(`/blogs/${id}`);
  return response.data;
};

export const createBlogPost = async (blogData) => {
  const response = await api.post('/blogs', blogData);
  return response.data;
};

export const updateBlogPost = async (id, blogData) => {
  const response = await api.put(`/blogs/${id}`, blogData);
  return response.data;
};

export const deleteBlogPost = async (id) => {
  const response = await api.delete(`/blogs/${id}`);
  return response.data;
};