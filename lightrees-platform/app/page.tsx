import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-xl">
        <p className="text-emerald-400 font-bold text-sm mb-6 tracking-widest uppercase">
          Lightrees Platform
        </p>
        <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
          Discover Your Potential
        </h1>
        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          Professional self-assessments that help you understand your strengths,
          identify growth areas, and lead with confidence.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
      <p className="text-slate-600 text-xs mt-16">
        Lightrees Group © 2025
      </p>
    </div>
  );
}
