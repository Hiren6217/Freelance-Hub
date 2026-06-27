'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';

interface ParsedData {
  skills: string[];
  experience: string;
  education: string;
  keywords: string[];
}

interface UploadResponse {
  resumeId: number;
  message: string;
  parsedData: ParsedData;
}

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('resumeUploadResponse');
    if (stored) {
      setResponse(JSON.parse(stored));
    }
  }, []);

  const saveResponse = (data: UploadResponse) => {
    setResponse(data);
    localStorage.setItem('resumeUploadResponse', JSON.stringify(data));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const res = await axios.post<UploadResponse>(`${API_BASE_URL}/resume/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      saveResponse(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Resume</h2>
      <div className="mb-4">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
      >
        {uploading ? 'Uploading...' : 'Upload Resume'}
      </button>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {response && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Parsed Data</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p><strong>Skills:</strong> {response.parsedData.skills.join(', ')}</p>
            <p><strong>Experience:</strong> {response.parsedData.experience}</p>
            <p><strong>Education:</strong> {response.parsedData.education}</p>
            <p><strong>Keywords:</strong> {response.parsedData.keywords.join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );
}