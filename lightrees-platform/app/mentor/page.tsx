'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '../../lib/auth-utils';
import {
  mentorGetMyAssessments,
  mentorCreateAssessment,
  mentorPublishAssessment,
  mentorDeleteAssessment,
} from '../../lib/api-client';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';

type Assessment = {
  id: number;
  title: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
};

export default function MentorPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'MENTOR') {
      router.push('/login');
      return;
    }
    loadAssessments();
  }, [router]);

  async function loadAssessments() {
    try {
      const data = await mentorGetMyAssessments();
      setAssessments(data.assessments);
    } catch {
      // silently ignore
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await mentorCreateAssessment(title, description);
      setTitle('');
      setDescription('');
      setShowCreate(false);
      await loadAssessments();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(id: number) {
    try {
      await mentorPublishAssessment(id);
      await loadAssessments();
    } catch {
      // silently ignore
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this assessment? This cannot be undone.')) return;
    try {
      await mentorDeleteAssessment(id);
      await loadAssessments();
    } catch {
      // silently ignore
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Assessments</h1>
          <Button onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? 'Cancel' : '+ New Assessment'}
          </Button>
        </div>

        {showCreate && (
          <Card className="mb-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4">New Assessment</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <Input
                id="title"
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Leadership Self-Assessment"
                required
              />
              <div className="flex flex-col gap-1">
                <label htmlFor="description" className="text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this assessment..."
                  required
                  rows={3}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" loading={loading}>
                  Create
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {assessments.length === 0 ? (
          <Card>
            <p className="text-slate-400 text-sm text-center py-4">
              No assessments yet. Create your first one!
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {assessments.map((a) => (
              <Card key={a.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">{a.title}</h3>
                      <span
                        className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                          a.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{a.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/mentor/assessments/${a.id}`}>
                      <Button size="sm" variant="secondary">
                        Edit
                      </Button>
                    </Link>
                    {a.status === 'DRAFT' && (
                      <Button size="sm" onClick={() => handlePublish(a.id)}>
                        Publish
                      </Button>
                    )}
                    <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
