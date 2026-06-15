'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getUser } from '../../../lib/auth-utils';
import { userGetAssessment, userSubmitAttempt } from '../../../lib/api-client';
import Navbar from '../../../components/Navbar';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

type Choice = { id: number; text: string };
type Question = { id: number; text: string; choices: Choice[] };
type AssessmentData = { id: number; title: string; description: string; status: string };

export default function TakeAssessmentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const assessmentId = Number(params.id);

  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'USER') {
      router.push('/login');
      return;
    }
    userGetAssessment(assessmentId)
      .then((data) => {
        setAssessment(data.assessment);
        setQuestions(data.questions);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  function selectChoice(questionId: number, choiceId: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  }

  async function handleSubmit() {
    const unanswered = questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      setError(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const answerList = questions.map((q) => ({
        questionId: q.id,
        choiceId: answers[q.id],
      }));
      const result = await userSubmitAttempt(assessmentId, answerList);
      router.push(`/results/${result.attemptId}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-slate-400 text-sm">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{assessment?.title}</h1>
          <p className="text-slate-500 text-sm">{assessment?.description}</p>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {questions.map((q, qi) => (
            <Card key={q.id}>
              <p className="font-medium text-slate-900 mb-3">
                {qi + 1}. {q.text}
              </p>
              <div className="flex flex-col gap-2">
                {q.choices.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers[q.id] === c.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={c.id}
                      checked={answers[q.id] === c.id}
                      onChange={() => selectChoice(q.id, c.id)}
                      className="accent-emerald-600"
                    />
                    <span className="text-sm text-slate-700">{c.text}</span>
                  </label>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {answeredCount} of {questions.length} answered
          </p>
          <Button onClick={handleSubmit} loading={submitting}>
            Submit Assessment
          </Button>
        </div>
      </main>
    </div>
  );
}
