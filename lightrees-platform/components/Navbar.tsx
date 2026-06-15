'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearAuth, getUser } from '../lib/auth-utils';

export default function Navbar() {
  const router = useRouter();
  const user = getUser();

  function handleLogout() {
    clearAuth();
    router.push('/');
  }

  const homeLink =
    user?.role === 'ADMIN' ? '/admin' :
    user?.role === 'MENTOR' ? '/mentor' :
    '/dashboard';

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={homeLink} className="text-lg font-bold text-emerald-600 tracking-tight">
          Lightrees
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-slate-500 hidden sm:block">{user.name || user.email}</span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-slate-600 hover:text-slate-900 font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
