'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Music2,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CarouselSlide } from '@/lib/types';

const HANDLE = 'valerio_alieri';

/* ---------- fallback slide (quando manca l'immagine generata) ---------- */
function SlideFallback({ s }: { s: CarouselSlide }) {
  const isCover = s.tipo === 'copertina';
  const isCta = s.tipo === 'cta';
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col justify-center p-6 text-center',
        isCover ? 'bg-[#0a3b31] text-white' : isCta ? 'bg-[#0e7c6b] text-white' : 'bg-[#f3f5f1] text-[#0a3b31]',
      )}
    >
      {s.titolo && <div className="font-display text-[20px] font-bold leading-tight">{s.titolo}</div>}
      {s.testo && <div className={cn('mt-3 text-[13px] leading-snug', isCover || isCta ? 'text-white/85' : 'text-[#4c5a53]')}>{s.testo}</div>}
      <div className="mt-4 text-[10px] font-semibold uppercase tracking-widest opacity-60">Anteprima testo · immagine in arrivo</div>
    </div>
  );
}

/* ---------- Carosello sfogliabile stile post Instagram ---------- */
export function IgCarouselMockup({ slides, caption }: { slides: CarouselSlide[]; caption?: string }) {
  const [i, setI] = useState(0);
  const list = (slides ?? []).slice().sort((a, b) => a.n - b.n);
  const n = list.length;
  if (n === 0) return null;
  const s = list[Math.min(i, n - 1)];
  const go = (d: number) => setI((p) => Math.max(0, Math.min(n - 1, p + d)));
  const captionFirst = (caption ?? '').split('\n')[0];

  return (
    <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl border border-[#dbe0e6] bg-white shadow-[0_8px_30px_rgba(16,40,33,0.12)]">
      {/* header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] p-[2px]">
          <span className="flex h-full w-full items-center justify-center rounded-full bg-white">
            <Image src="/logo.png" alt="" width={20} height={20} />
          </span>
        </span>
        <div className="flex-1 leading-tight">
          <div className="text-[12.5px] font-semibold text-[#262626]">{HANDLE}</div>
          <div className="text-[10.5px] text-[#8e8e8e]">Sponsorizzato</div>
        </div>
        <MoreHorizontal size={18} className="text-[#262626]" />
      </div>

      {/* media 4:5 */}
      <div className="relative aspect-[4/5] w-full select-none bg-[#0a0a0a]">
        {s.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.img} alt={s.titolo ?? `slide ${s.n}`} className="h-full w-full object-cover" />
        ) : (
          <SlideFallback s={s} />
        )}
        {/* contatore */}
        <span className="absolute right-2.5 top-2.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
          {i + 1}/{n}
        </span>
        {/* frecce */}
        {i > 0 && (
          <button
            onClick={() => go(-1)}
            className="absolute left-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#262626] shadow hover:bg-white"
            aria-label="Slide precedente"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {i < n - 1 && (
          <button
            onClick={() => go(1)}
            className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#262626] shadow hover:bg-white"
            aria-label="Slide successiva"
          >
            <ChevronRight size={16} />
          </button>
        )}
        {/* dots */}
        <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
          {list.map((_, d) => (
            <span key={d} className={cn('h-1.5 w-1.5 rounded-full', d === i ? 'bg-white' : 'bg-white/45')} />
          ))}
        </div>
      </div>

      {/* azioni */}
      <div className="flex items-center gap-4 px-3 pt-2.5 text-[#262626]">
        <Heart size={22} />
        <MessageCircle size={22} />
        <Send size={22} />
        <Bookmark size={22} className="ml-auto" />
      </div>

      {/* likes + caption */}
      <div className="px-3 pb-3 pt-2">
        <div className="text-[12.5px] font-semibold text-[#262626]">Salvato da chi vola smart</div>
        {captionFirst && (
          <div className="mt-1 text-[12.5px] leading-snug text-[#262626]">
            <span className="font-semibold">{HANDLE}</span>{' '}
            <span className="text-[#3c3c3c]">{captionFirst}</span>
          </div>
        )}
        <div className="mt-1 text-[11.5px] text-[#8e8e8e]">Scorri le slide con le frecce</div>
      </div>
    </div>
  );
}

/* ---------- Video verticale stile Reel / TikTok ---------- */
export function ReelMockup({ videoUrl, caption }: { videoUrl?: string; caption?: string }) {
  const captionShort = (caption ?? '').split('\n')[0];
  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[240px] overflow-hidden rounded-[26px] border-[5px] border-[#111] bg-black shadow-[0_10px_34px_rgba(0,0,0,0.35)]">
      {videoUrl ? (
        <video src={videoUrl} controls playsInline preload="metadata" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[11px] text-white/50">Anteprima non disponibile</div>
      )}
      {/* overlay UI stile TikTok/Reel */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2.5">
        <div className="flex justify-center gap-4 pt-1 text-[11px] font-semibold text-white/90">
          <span className="opacity-70">Seguiti</span>
          <span className="border-b-2 border-white pb-0.5">Per te</span>
        </div>
        <div className="flex items-end justify-between">
          <div className="max-w-[75%]">
            <div className="text-[12px] font-bold text-white drop-shadow">@{HANDLE}</div>
            {captionShort && <div className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-white/90 drop-shadow">{captionShort}</div>}
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-white/85">
              <Music2 size={11} /> audio originale
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 text-white">
            <div className="flex flex-col items-center"><Heart size={22} className="fill-white" /><span className="text-[9px]">12.4k</span></div>
            <div className="flex flex-col items-center"><MessageCircle size={22} /><span className="text-[9px]">318</span></div>
            <div className="flex flex-col items-center"><Bookmark size={22} /><span className="text-[9px]">2.1k</span></div>
            <div className="flex flex-col items-center"><Send size={22} /><span className="text-[9px]">590</span></div>
          </div>
        </div>
      </div>
      <Volume2 size={14} className="absolute right-2.5 top-2.5 text-white/70" />
    </div>
  );
}
