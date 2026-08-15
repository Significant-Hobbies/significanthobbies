import { ImageResponse } from 'next/og';

import type { Phase } from './types';

export const timelineOgImageSize = { width: 1200, height: 630 };
export const timelineOgImageContentType = 'image/png';

type TimelineOgArchetype = {
  emoji: string;
  name: string;
};

type TimelineOgRenderInput = {
  title: string | null;
  username: string | null;
  phases: Phase[];
  totalHobbies: number;
  archetype: TimelineOgArchetype;
};

export function fallbackTimelineImage(message: string) {
  return new ImageResponse(
    <div
      style={{
        background: '#FEFDF8',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 40,
        fontFamily: 'system-ui, sans-serif',
        color: '#78716C',
      }}
    >
      {message}
    </div>,
    { width: 1200, height: 630 }
  );
}

function TimelineOgHeader({ username }: { username: string | null }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 40,
      }}
    >
      <div style={{ fontSize: 22, color: '#059669', fontWeight: 700 }}>significanthobbies.com</div>
      {username && <div style={{ fontSize: 22, color: '#78716C' }}>@{username}</div>}
    </div>
  );
}

function TimelineOgPersonalityBadge({ archetype }: { archetype: TimelineOgArchetype }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 28px',
          borderRadius: 16,
          background: 'linear-gradient(135deg, #D1FAE5 0%, #FEF3C7 100%)',
          border: '2px solid #A7F3D0',
        }}
      >
        <span style={{ fontSize: 32 }}>{archetype.emoji}</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 13,
              color: '#6B7280',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Personality
          </span>
          <span style={{ fontSize: 24, color: '#1C1917', fontWeight: 800 }}>{archetype.name}</span>
        </div>
      </div>
    </div>
  );
}

function TimelineOgStats({ phases, totalHobbies }: { phases: Phase[]; totalHobbies: number }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
      <div
        style={{
          padding: '12px 24px',
          borderRadius: 12,
          background: '#ECFDF5',
          color: '#059669',
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        {phases.length} phase{phases.length !== 1 ? 's' : ''}
      </div>
      <div
        style={{
          padding: '12px 24px',
          borderRadius: 12,
          background: '#FEF3C7',
          color: '#D97706',
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        {totalHobbies} hobb{totalHobbies !== 1 ? 'ies' : 'y'}
      </div>
    </div>
  );
}

function TimelineOgPhaseLabels({ phases }: { phases: Phase[] }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {phases.slice(0, 5).map((p, i) => (
        <div
          key={p.id}
          style={{
            padding: '10px 20px',
            borderRadius: 24,
            background: `hsl(${160 - i * 25}, 60%, 90%)`,
            color: `hsl(${160 - i * 25}, 60%, 30%)`,
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          {p.label}
        </div>
      ))}
    </div>
  );
}

export function renderTimelineOgImage({
  title,
  username,
  phases,
  totalHobbies,
  archetype,
}: TimelineOgRenderInput) {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #FEFDF8 0%, #ECFDF5 60%, #FFF8EE 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px 80px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <TimelineOgHeader username={username} />
      <div
        style={{
          fontSize: 52,
          fontWeight: 800,
          color: '#1C1917',
          lineHeight: 1.2,
          marginBottom: 24,
          maxWidth: 800,
        }}
      >
        {title ?? 'Hobby Timeline'}
      </div>
      <TimelineOgPersonalityBadge archetype={archetype} />
      <TimelineOgStats phases={phases} totalHobbies={totalHobbies} />
      <TimelineOgPhaseLabels phases={phases} />
    </div>,
    { width: 1200, height: 630 }
  );
}
