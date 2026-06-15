'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '../../../../lib/auth-utils';
import {
  mentorGetQuestions,
  mentorCreateQuestion,
  mentorDeleteQuestion,
  mentorGetReportTemplates,
  mentorCreateReportTemplate,
} from '../../../../lib/api-client';
import Navbar from '../../../../components/Navbar';
import Card from '../../../../components/Card';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';

type Choice = { id: number; text: string };
type Question = { id: number; text: string; choices: Choice[] };
type ReportTemplate = {
  id: number;
  minScore: number;
  maxScore: number;
  freeReport: string;
  premiumReport: string;
};
type ChoiceRow = { text: string; score: string };

export default function AssessmentEditorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const assessmentId = Number(params.id);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);

  // Question form state
  const [qText, setQText] = useState('');
  const [qOrder, setQOrder] = useState('1');
  const [qChoices, setQChoices] = useState<ChoiceRow[]>([
    { text: '', score: '1' },
    { text: '', score: '2' },
  ]);
  const [qError, setQError] = useState('');
  const [qLoading, setQLoading] = useState(false);

  // Report template form state
  const [tMin, setTMin] = useState('');
  const [tMax, setTMax] = useState('');
  const [tFree, setTFree] = useState('');
  const [tPremium, setTPremium] = useState('');
  const [tError, setTError] = useState('');
  const [tLoading, setTLoading] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'MENTOR') {
      router.push('/login');
      return;
    }
    if (!isNaN(assessmentId)) {
      loadQuestions();
      loadTemplates();
    }
  }, [assessmentId]);

  async function loadQuestions() {
    try {
      const data = await mentorGetQuestions(assessmentId);
      setQuestions(data.questions);
    } catch {
      // silently ignore
    }
  }

  async function loadTemplates() {
    try {
      const data = await mentorGetReportTemplates(assessmentId);
      setTemplates(data.templates);
    } catch {
      // silently ignore
    }
  }

  function addChoiceRow() {
    setQChoices((prev) => [...prev, { text: '', score: '1' }]);
  }

  function removeChoiceRow(idx: number) {
    setQChoices((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateChoice(idx: number, field: 'text' | 'score', val: string) {
    setQChoices((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c)));
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    setQError('');
    if (qChoices.some((c) => !c.text.trim())) {
      setQError('All choice texts are required.');
      return;
    }
    setQLoading(true);
    try {
      const choices = qChoices.map((c) => ({ text: c.text.trim(), score: Number(c.score) }));
      await mentorCreateQuestion(assessmentId, qText, Number(qOrder), choices);
      setQText('');
      setQOrder(String(questions.length + 2));
      setQChoices([{ text: '', score: '1' }, { text: '', score: '2' }]);
      await loadQuestions();
    } catch (err) {
      setQError((err as Error).message);
    } finally {
      setQLoading(false);
    }
  }

  async function handleDeleteQuestion(id: number) {
    if (!confirm('Delete this question?')) return;
    try {
      await mentorDeleteQuestion(id);
      await loadQuestions();
    } catch {
      // silently ignore
    }
  }

  async function handleAddTemplate(e: React.FormEvent) {
    e.preventDefault();
    setTError('');
    setTLoading(true);
    try {
      await mentorCreateReportTemplate(
        assessmentId,
        Number(tMin),
        Number(tMax),
        tFree,
        tPremium
      );
      setTMin('');
      setTMax('');
      setTFree('');
      setTPremium('');
      await loadTemplates();
    } catch (err) {
      setTError((err as Error).message);
    } finally {
      setTLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/mentor" className="text-slate-400 hover:text-slate-600 text-sm">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Assessment Editor</h1>
        </div>

        {/* Questions Section */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Questions{' '}
            <span className="text-slate-400 font-normal text-base">({questions.length})</span>
          </h2>

          {questions.length > 0 && (
            <div className="flex flex-col gap-3 mb-4">
              {questions.map((q, qi) => (
                <Card key={q.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 mb-2">
                        {qi + 1}. {q.text}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {q.choices.map((c) => (
                          <span
                            key={c.id}
                            className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded"
                          >
                            {c.text}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteQuestion(q.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Card>
            <h3 className="font-semibold text-slate-700 mb-4">Add Question</h3>
            <form onSubmit={handleAddQuestion} className="flex flex-col gap-4">
              <Input
                id="q-text"
                label="Question Text"
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder='e.g. "I enjoy leading others"'
                required
              />
              <Input
                id="q-order"
                label="Order Number"
                type="number"
                value={qOrder}
                onChange={(e) => setQOrder(e.target.value)}
                min={0}
                required
              />
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Choices <span className="text-slate-400 font-normal">(text + score)</span>
                </p>
                <div className="flex flex-col gap-2">
                  {qChoices.map((c, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={c.text}
                        onChange={(e) => updateChoice(i, 'text', e.target.value)}
                        placeholder={`Choice ${i + 1}`}
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        type="number"
                        value={c.score}
                        onChange={(e) => updateChoice(i, 'score', e.target.value)}
                        placeholder="Score"
                        className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      {qChoices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChoiceRow(i)}
                          className="text-slate-400 hover:text-red-500 text-lg leading-none"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addChoiceRow}
                  className="mt-2 text-sm text-emerald-600 hover:underline"
                >
                  + Add choice
                </button>
              </div>
              {qError && <p className="text-sm text-red-500">{qError}</p>}
              <Button type="submit" loading={qLoading}>
                Add Question
              </Button>
            </form>
          </Card>
        </section>

        {/* Report Templates Section */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Report Templates{' '}
            <span className="text-slate-400 font-normal text-base">({templates.length})</span>
          </h2>

          {templates.length > 0 && (
            <div className="flex flex-col gap-3 mb-4">
              {templates.map((t) => (
                <Card key={t.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Score range
                    </span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {t.minScore} – {t.maxScore}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-2">{t.freeReport}</p>
                </Card>
              ))}
            </div>
          )}

          <Card>
            <h3 className="font-semibold text-slate-700 mb-4">Add Report Template</h3>
            <form onSubmit={handleAddTemplate} className="flex flex-col gap-4">
              <div className="flex gap-3">
                <Input
                  id="t-min"
                  label="Min Score"
                  type="number"
                  value={tMin}
                  onChange={(e) => setTMin(e.target.value)}
                  placeholder="0"
                  required
                  className="flex-1"
                />
                <Input
                  id="t-max"
                  label="Max Score"
                  type="number"
                  value={tMax}
                  onChange={(e) => setTMax(e.target.value)}
                  placeholder="20"
                  required
                  className="flex-1"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Free Report</label>
                <textarea
                  value={tFree}
                  onChange={(e) => setTFree(e.target.value)}
                  placeholder="Report content shown to users for free..."
                  required
                  rows={4}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Premium Report</label>
                <textarea
                  value={tPremium}
                  onChange={(e) => setTPremium(e.target.value)}
                  placeholder="In-depth content locked behind premium..."
                  required
                  rows={4}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              {tError && <p className="text-sm text-red-500">{tError}</p>}
              <Button type="submit" loading={tLoading}>
                Add Template
              </Button>
            </form>
          </Card>
        </section>
      </main>
    </div>
  );
}
