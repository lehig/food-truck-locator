import React, { useState } from 'react';
import api from '../../api/client';
import './ImageUpload.css';

const ImageUpload = ({ label, value, onChange, userId, imageType }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      // 1. Get presigned URL from our backend
      const extension = file.name.split('.').pop();
      const targetFileName = imageType ? `${imageType}.${extension}` : file.name;

      const presignRes = await api.post('/images/presign', {
        userID: userId,
        fileName: targetFileName,
        contentType: file.type,
      });

      const { uploadURL, objectKey } = presignRes.data;

      // 2. Upload file directly to S3
      const uploadRes = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadRes.ok) {
        // Fetch doesn't throw on HTTP errors (e.g. 403), so we manually check and throw
        const errText = await uploadRes.text();
        console.error('S3 Upload Error:', errText);
        throw new Error(`Upload failed with status ${uploadRes.status}`);
      }

      // 3. Extract the final public URL by stripping query parameters
      const finalUrl = uploadURL.split('?')[0];

      // 4. Pass the URL up to the parent component
      onChange(finalUrl);
      setSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload-container">
      <label className="image-upload-label">{label}</label>
      <div className="image-upload-controls">
        {value ? (
          <div className="image-preview-wrapper">
            <img src={value} alt={label} className="image-preview" />
            <button
              type="button"
              className="btn btn-rmv btn-small"
              onClick={() => onChange('')}
            >
              Remove
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        )}
        {uploading && <span className="uploading-text">Uploading...</span>}
      </div>
      {error && <p className="error" style={{ color: '#d9534f', fontSize: '0.9rem', marginTop: '0.5rem' }}>{error}</p>}
      {success && <p className="success" style={{ color: '#5cb85c', fontSize: '0.9rem', marginTop: '0.5rem' }}>✓ Image successfully uploaded!</p>}
    </div>
  );
};

export default ImageUpload;
