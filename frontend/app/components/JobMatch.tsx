'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';

interface JobMatch {
  jobId: number;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  matchedSkills: string[];
}

export default function JobMatch() {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('You must be logged in to view job matches.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get<JobMatch[]>(`${API_BASE_URL}/jobs/match`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMatches(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Job Matches</h2>
      <button
        onClick={fetchMatches}
        className="mb-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
      >
        Refresh Matches
      </button>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-4">
        {!loading && !error && matches.length === 0 && (
          <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">No matching jobs were found yet. Upload your resume and try again.</div>
        )}

        {matches.map((match) => (
          <div key={match.jobId} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">{match.title}</h3>
            <p className="text-gray-600">{match.company} - {match.location}</p>
            <p className="text-green-600 font-bold">Match Score: {match.matchScore.toFixed(2)}%</p>
            <p><strong>Matched Skills:</strong> {match.matchedSkills.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}