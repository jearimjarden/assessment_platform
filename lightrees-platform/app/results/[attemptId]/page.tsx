'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '../../../lib/auth-utils';
import { userGetResult } from '../../../lib/api-client';
import Navbar from '../../../components/Navbar';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

type Result = {
  score: number;
  freeReport: string | null;
  premiumReport: string | null;
};

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams<{ attemptId: string }>();
  const attemptId = Number(params.attemptId);

  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'USER') {
      router.push('/login');
      return;
    }
    userGetResult(attemptId)
      .then((data) => setResult(data))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-slate-400 text-sm">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-red-500 text-sm">{error || 'Results not found.'}</p>
          <Link href="/dashboard" className="text-emerald-600 text-sm hover:underline mt-2 block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Results</h1>

        {/* Score card */}
        <Card className="mb-4 text-center py-8">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">
            Total Score
          </p>
          <p className="text-6xl font-bold text-emerald-600">{result.score}</p>
          <p className="text-sm text-slate-400 mt-1">points</p>
        </Card>

        {/* Free report */}
        {result.freeReport ? (
          <Card className="mb-4">
            <h2 className="text-base font-semibold text-slate-800 mb-3">Your Report</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
              {result.freeReport}
            </p>
          </Card>
        ) : (
          <Card className="mb-4">
            <p className="text-slate-400 text-sm text-center py-2">
              No report template matched your score range.
            </p>
          </Card>
        )}

        {/* Premium locked section */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h2 className="text-base font-semibold text-white mb-1">Premium Report</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Unlock in-depth insights, personalized action plans, and detailed development
                recommendations tailored to your results.
              </p>
            </div>
            <span className="shrink-0 bg-slate-700 text-slate-400 text-xs px-2 py-1 rounded font-medium">
              Locked
            </span>
          </div>
          <button
            disabled
            className="w-full border border-slate-600 text-slate-400 font-medium px-4 py-2 rounded-lg text-sm cursor-not-allowed"
          >
            Upgrade to Unlock
          </button>
        </div>

        <Link href="/dashboard">
          <Button variant="secondary" className="w-full">
            ← Back to Dashboard
          </Button>
        </Link>
      </main>
    </div>
  );
}
