//frontend/src/components/BlogPostDetail.jsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getBlogPost } from '../services/blogService';
import { getBlogComments } from '../services/commentService';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { useToast } from '../contexts/ToastContext';

function BlogPostDetail() {
  const [blogPost, setBlogPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const showToast = useToast();
  const fetchCount = useRef(0);

  console.log('BlogPostDetail rendered, id:', id, 'fetch count:', fetchCount.current);

  const fetchBlogPost = useCallback(async () => {
    if (fetchCount.current > 0) return; // Prevent multiple fetches
    fetchCount.current += 1;
    console.log('Fetching blog post');
    try {
      const response = await getBlogPost(id);
      setBlogPost(response.data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      showToast('Failed to load blog post', 'error');
    }
  }, [id, showToast]);

  const fetchComments = useCallback(async () => {
    console.log('Fetching comments');
    try {
      const response = await getBlogComments(id);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      showToast('Failed to load comments', 'error');
    }
  }, [id, showToast]);

  useEffect(() => {
    console.log('Effect running');
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchBlogPost(), fetchComments()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchBlogPost, fetchComments]);

  const memoizedBlogPost = useMemo(() => {
    if (!blogPost) return null;
    return (
      <div>
        <h1 className="text-4xl font-bold mb-4">{blogPost.title}</h1>
        <p className="text-gray-600 mb-4">By {blogPost.author.username} on {new Date(blogPost.createdAt).toLocaleDateString()}</p>
        {blogPost.imageUrl && (
          <img src={blogPost.imageUrl} alt={blogPost.title} className="w-full max-w-2xl h-64 object-cover mb-4 rounded" />
        )}
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blogPost.content }} />
      </div>
    );
  }, [blogPost]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!blogPost) {
    return <div>Blog post not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {memoizedBlogPost}
      <CommentList comments={comments} onCommentUpdated={fetchComments} />
      <CommentForm blogId={blogPost._id} onCommentAdded={fetchComments} />
    </div>
  );
}

export default React.memo(BlogPostDetail);