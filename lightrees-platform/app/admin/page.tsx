'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '../../lib/auth-utils';
import { adminGetMentors, adminCreateMentor } from '../../lib/api-client';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';

type Mentor = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    loadMentors();
  }, [router]);

  async function loadMentors() {
    try {
      const data = await adminGetMentors();
      setMentors(data.mentors);
    } catch {
      // silently ignore on initial load
    }
  }

  async function handleCreateMentor(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await adminCreateMentor(name, email, password);
      setSuccess(`Mentor "${data.mentor.name}" created successfully.`);
      setName('');
      setEmail('');
      setPassword('');
      await loadMentors();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Create Mentor</h2>
            <form onSubmit={handleCreateMentor} className="flex flex-col gap-4">
              <Input
                id="mentor-name"
                label="Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mentor name"
                required
              />
              <Input
                id="mentor-email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mentor@example.com"
                required
              />
              <Input
                id="mentor-password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set a password"
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-emerald-600">{success}</p>}
              <Button type="submit" loading={loading} className="w-full">
                Create Mentor
              </Button>
            </form>
          </Card>

          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Mentors{' '}
              <span className="text-slate-400 font-normal text-base">({mentors.length})</span>
            </h2>
            {mentors.length === 0 ? (
              <Card>
                <p className="text-slate-400 text-sm text-center py-4">
                  No mentors yet. Create your first one.
                </p>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {mentors.map((m) => (
                  <Card key={m.id} className="p-4">
                    <p className="font-medium text-slate-900">{m.name}</p>
                    <p className="text-sm text-slate-500">{m.email}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
