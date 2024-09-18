import React, { useState } from 'react';
import useVideoUpload from '../hooks/useVideoUpload';

interface VideoUploadProps {
  userId: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ userId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadAndTranscribe, isUploading } = useVideoUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await uploadAndTranscribe(selectedFile, userId);
    }
  };

  return (
    <div>
      <input type="file" accept="video/mp4" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={isUploading || !selectedFile}>
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default VideoUpload;
