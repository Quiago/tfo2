'use client';

import dynamic from 'next/dynamic';

const MultiLayerTimeline = dynamic(
  () =>
    import('@/components/features/Timeline').then((m) => m.MultiLayerTimeline),
  { ssr: false }
);

export default function TimelinePlayground() {
  return (
    <div className="min-h-screen bg-white">
      <MultiLayerTimeline />
    </div>
  );
}
