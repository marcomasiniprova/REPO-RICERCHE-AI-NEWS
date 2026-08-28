'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { AgentStatus } from '@/lib/types';

/* ---------- PageHeader ---------- */
export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[26px] font-bold tracking-tight text-deep">{title}</h1>
        {subtitle && <p className="mt-1 text-[13.5px] text-ink-2">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

/* ---------- CountUp ---------- */
export function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const controls = animate(0, to, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        node.textContent = Math.round(v) + suffix;
      },
    });
    return () => controls.stop();
  }, [to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

/* ---------- StatCard ---------- */
export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = false,
}: {
  label: string;
  value: number;
  hint?: string;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'card card-hover relative overflow-hidden px-5 py-4',
        accent && 'border-brand-200 bg-gradient-to-br from-white to-brand-50',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">
          {label}
        </span>
        {icon && <span className="text-brand-600">{icon}</span>}
      </div>
      <div className="mt-1.5 font-display text-[32px] font-bold leading-none tracking-tight text-deep">
        <CountUp to={value} />
      </div>
      {hint && <div className="mt-1.5 text-[11.5px] text-ink-3">{hint}</div>}
    </div>
  );
}

/* ---------- StatusPill ---------- */
const STATUS_META: Record<AgentStatus, { label: string; cls: string; dot: string }> = {
  working: { label: 'Al lavoro', cls: 'bg-brand-50 text-brand-700 border-brand-200', dot: 'bg-ok dot-working' },
  idle: { label: 'In attesa', cls: 'bg-subtle text-ink-2 border-line', dot: 'bg-ink-3' },
  error: { label: 'Errore', cls: 'bg-[#fdeceb] text-err border-[#f5c9c4]', dot: 'bg-err' },
  paused: { label: 'In pausa', cls: 'bg-[#f7e8d6] text-tan-ink border-[#ecd3b4]', dot: 'bg-tan' },
};

export function StatusPill({ status, size = 'md' }: { status: AgentStatus; size?: 'sm' | 'md' }) {
  const m = STATUS_META[status] ?? STATUS_META.idle;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        size === 'md' ? 'px-2.5 py-1 text-[11.5px]' : 'px-2 py-0.5 text-[10.5px]',
        m.cls,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  );
}

/* ---------- Badge ---------- */
export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'brand' | 'tan' | 'red' | 'outline';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-subtle text-ink-2',
    brand: 'bg-brand-100 text-brand-700',
    tan: 'bg-tan text-tan-ink',
    red: 'bg-[#fbe9e2] text-[#a63d20]',
    outline: 'border border-line bg-white text-ink-2',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------- EmptyState ---------- */
export function EmptyState({ title, note }: { title: string; note?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>
      <div className="font-display text-[15px] font-semibold text-deep">{title}</div>
      {note && <p className="mt-1 max-w-[36ch] text-[12.5px] text-ink-3">{note}</p>}
    </div>
  );
}
