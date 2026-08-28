'use client';

import { useEffect, useState } from 'react';
import { useData } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function LiveBadge() {
  const { live, mode } = useData();
  const [now, setNow] = useState<string>('');

  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Europe/Rome',
        }),
      );
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const today = new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Rome',
  });

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right leading-tight sm:block">
        <div className="font-display text-[15px] font-semibold tabular-nums text-deep">{now}</div>
        <div className="text-[10.5px] capitalize text-ink-3">{today}</div>
      </div>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
          live
            ? 'border-brand-200 bg-brand-50 text-brand-700'
            : mode === 'demo'
              ? 'border-[#ecd3b4] bg-[#f7e8d6] text-tan-ink'
              : 'border-line bg-subtle text-ink-3',
        )}
      >
        <span
          className={cn('h-1.5 w-1.5 rounded-full', live ? 'dot-working bg-ok' : mode === 'demo' ? 'bg-tan' : 'bg-ink-3')}
        />
        {live ? 'Live' : mode === 'demo' ? 'Demo' : 'Sync'}
      </span>
    </div>
  );
}
