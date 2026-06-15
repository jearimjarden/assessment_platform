'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '../../lib/auth-utils';
import { userGetAssessments } from '../../lib/api-client';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';

type Assessment = {
  id: number;
  title: string;
  description: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'USER') {
      router.push('/login');
      return;
    }
    userGetAssessments()
      .then((data) => setAssessments(data.assessments))
      .catch(() => {
        // silently ignore
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Available Assessments</h1>
        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : assessments.length === 0 ? (
          <Card>
            <p className="text-slate-400 text-sm text-center py-4">
              No assessments available yet. Check back soon!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.map((a) => (
              <Card key={a.id} className="flex flex-col justify-between">
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-900 mb-1">{a.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{a.description}</p>
                </div>
                <Link href={`/dashboard/${a.id}`}>
                  <Button className="w-full">Take Assessment</Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
