import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Building2, LayoutGrid, LogOut, PenLine, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { asArray, initials } from '@/lib/appData';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
import { applyTheme, readTheme } from '@/lib/theme';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/practise', label: 'Practise', icon: PenLine },
  { to: '/classes', label: 'Classes', icon: Users },
];

export default function AppShell() {
  const [profile, setProfile] = useState(null);
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const items =
    profile?.role === 'teacher' ? [...nav, { to: '/school', label: 'School', icon: Building2 }] : nav;

  useEffect(() => {
    let active = true;
    const load = async () => {
      const me = await base44.auth.me();
      const profiles = asArray(await base44.entities.Profile.filter({ created_by_id: me.id }));
      if (active) setProfile(profiles[0] || null);
    };
    load();
    window.addEventListener('numera:profile', load);
    return () => {
      active = false;
      window.removeEventListener('numera:profile', load);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground">
              N
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Numera</span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {items.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                    isActive && 'bg-secondary text-foreground'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
            {profile && (
              <span className="num hidden rounded-full bg-accent/35 px-3 py-1.5 text-xs font-semibold sm:inline-flex">
                {profile.xp || 0} XP
              </span>
            )}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials(profile?.display_name)}
            </div>
            <button
              type="button"
              onClick={() => base44.auth.logout()}
              aria-label="Log out"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-3 sm:hidden">
          {items.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground',
                  isActive && 'bg-secondary text-foreground'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}