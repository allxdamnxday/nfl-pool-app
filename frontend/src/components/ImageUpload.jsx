import React from 'react';

function ImageUpload({ onImageUpload }) {
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  return (
    <input
      type="file"
      onChange={handleFileChange}
      accept="image/*"
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
    />
  );
}

export default ImageUpload;