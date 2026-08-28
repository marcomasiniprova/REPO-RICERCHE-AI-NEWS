'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  MailOpen,
  MessageCircle,
  MessagesSquare,
  PhoneCall,
  Radar,
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/lib/store';

const NAV = [
  { href: '/', label: 'Mission Control', icon: LayoutGrid },
  { href: '/creator', label: 'Creator', icon: Users },
  { href: '/messaggi', label: 'Messaggi', icon: MessagesSquare },
  { href: '/bozze', label: 'Bozze', icon: MailOpen },
  { href: '/call', label: 'Call', icon: PhoneCall },
  { href: '/scout', label: 'Scout', icon: Radar },
  { href: '/reddit', label: 'Reddit', icon: MessageCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { drafts, live, mode } = useData();
  const pending = drafts.filter((d) => d.status === 'bozza').length;

  return (
    <aside className="glass sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--color-line)] px-4 py-5 md:flex">
      <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
        <Image src="/logo.png" alt="Rivolio" width={30} height={30} priority />
        <div className="leading-tight">
          <div className="font-display text-[17px] font-bold tracking-tight text-deep">Rivolio</div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand-600">
            Mission Control
          </div>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150',
                active
                  ? 'bg-deep text-white shadow-[0_4px_14px_rgba(10,59,49,0.25)]'
                  : 'text-ink-2 hover:bg-white hover:text-deep hover:shadow-[var(--shadow-card)]',
              )}
            >
              <Icon
                size={17}
                className={cn(
                  'transition-colors',
                  active ? 'text-mint' : 'text-ink-3 group-hover:text-brand-600',
                )}
              />
              {label}
              {href === '/bozze' && pending > 0 && (
                <span className="ml-auto rounded-full bg-tan px-2 py-0.5 text-[11px] font-bold text-tan-ink">
                  {pending}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="card flex items-center gap-2.5 px-3 py-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={cn(
                'inline-flex h-2.5 w-2.5 rounded-full',
                live ? 'dot-working bg-ok' : mode === 'demo' ? 'bg-tan' : 'bg-ink-3',
              )}
            />
          </span>
          <div className="leading-tight">
            <div className="text-[12px] font-semibold text-ink">
              {live ? 'Collegata live' : mode === 'demo' ? 'Anteprima demo' : 'In collegamento'}
            </div>
            <div className="text-[10.5px] text-ink-3">
              {live ? 'Aggiornamenti in tempo reale' : mode === 'demo' ? 'Dati snapshot 28/8' : 'Supabase realtime'}
            </div>
          </div>
          <Radio size={14} className="ml-auto text-ink-3" />
        </div>
        <div className="px-2 text-[10.5px] leading-relaxed text-ink-3">
          RIVO Growth Team
          <br />
          rivolio.it
        </div>
      </div>
    </aside>
  );
}
