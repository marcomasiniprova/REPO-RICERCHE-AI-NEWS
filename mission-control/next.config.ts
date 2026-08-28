import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Icone e avatar locali gia ottimizzati: niente pipeline di ottimizzazione in prod.
    unoptimized: true,
  },
};

export default nextConfig;
