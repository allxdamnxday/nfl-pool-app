//frontend/src/components/BlogPostEdit.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBlogPost, updateBlogPost } from '../services/blogService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { FaArrowLeft } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageUpload from './ImageUpload';

function BlogPostEdit() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [tags, setTags] = useState([]);
  const [readTimeMinutes, setReadTimeMinutes] = useState(0);
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [image, setImage] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const showToast = useToast();

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const response = await getBlogPost(id);
        const { title, content, imageUrl, imagePublicId, tags, readTimeMinutes, status } = response.data;
        setTitle(title);
        setContent(content);
        setImageUrl(imageUrl || '');
        setImagePublicId(imagePublicId || '');
        setTags(tags || []);
        setReadTimeMinutes(readTimeMinutes || 0);
        setStatus(status || 'draft');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setError('Failed to fetch blog post');
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }
      formData.append('tags', JSON.stringify(tags));
      formData.append('readTimeMinutes', readTimeMinutes);
      formData.append('status', status);

      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await updateBlogPost(id, formData);
      showToast('Blog post updated successfully', 'success');
      navigate(`/blog/${id}`);
    } catch (error) {
      setError('Failed to update blog post. Please try again.');
      console.error('Error updating blog post:', error);
      showToast('Failed to update blog post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTagChange = (e) => {
    setTags(e.target.value.split(',').map(tag => tag.trim()));
  };

  const handleImageUpload = (file) => {
    setImage(file);
    // Create a preview URL for the image
    setImageUrl(URL.createObjectURL(file));
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!user || (user.role !== 'admin' && user.role !== 'author')) {
    return <div className="text-red-500">You are not authorized to edit this post.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/blog/${id}`)}
        className="mb-4 flex items-center text-purple-600 hover:text-purple-700 transition-colors duration-200"
      >
        <FaArrowLeft className="mr-2" />
        Back to Post
      </button>

      <h1 className="text-3xl font-bold mb-4">Edit Blog Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1 font-semibold">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
        <div>
          <label htmlFor="content" className="block mb-1 font-semibold">Content</label>
          <ReactQuill 
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            className="bg-white"
          />
        </div>
        <div>
          <label htmlFor="image" className="block mb-1 font-semibold">Image</label>
          <ImageUpload onImageUpload={handleImageUpload} />
          {imageUrl && (
            <div className="mt-2">
              <img src={imageUrl} alt="Preview" className="max-w-xs" />
            </div>
          )}
        </div>
        <div>
          <label htmlFor="tags" className="block mb-1 font-semibold">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            value={tags.join(', ')}
            onChange={handleTagChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
        <div>
          <label htmlFor="readTimeMinutes" className="block mb-1 font-semibold">Read Time (minutes)</label>
          <input
            type="number"
            id="readTimeMinutes"
            value={readTimeMinutes}
            onChange={(e) => setReadTimeMinutes(parseInt(e.target.value))}
            min="1"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
        <div>
          <label htmlFor="status" className="block mb-1 font-semibold">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200">
          Update Post
        </button>
      </form>
    </div>
  );
}

export default BlogPostEdit;