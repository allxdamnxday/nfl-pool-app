import React from 'react';

function CommentList({ comments }) {
  return (
    <div>
      <h2>Comments</h2>
      {comments.map((comment) => (
        <div key={comment._id}>
          <p>{comment.content}</p>
          <p>By: {comment.author.username}</p>
        </div>
      ))}
    </div>
  );
}

export default CommentList;