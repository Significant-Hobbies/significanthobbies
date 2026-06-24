import type React from 'react';

interface QuizResultCardProps {
  archetype: string;
  archetypeEmoji: string;
  topCategories: string[];
  recommendedHobbies: string[];
  exportRef?: React.RefObject<HTMLDivElement | null>;
}

export function QuizResultCard({
  archetype,
  archetypeEmoji,
  topCategories,
  recommendedHobbies,
  exportRef,
}: QuizResultCardProps) {
  return (
    <div
      ref={exportRef}
      style={{
        width: '600px',
        height: '400px',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxShadow: '0 0 60px rgba(16,185,129,0.08)',
        borderRadius: '16px',
        padding: '40px',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Emerald glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(16,185,129,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Branding */}
      <div style={{ position: 'relative' }}>
        <p
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#10b981',
            margin: 0,
          }}
        >
          significanthobbies
        </p>
      </div>

      {/* Center: archetype */}
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '72px', lineHeight: 1 }}>{archetypeEmoji}</div>
        <div>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#10b981',
              margin: '0 0 6px 0',
            }}
          >
            Your Hobby Archetype
          </p>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#f1f5f9',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {archetype}
          </h2>
        </div>

        {/* Top categories */}
        {topCategories.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {topCategories.map((cat) => (
              <span
                key={cat}
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#6ee7b7',
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: '9999px',
                  padding: '3px 10px',
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recommended hobby pills */}
      {recommendedHobbies.length > 0 && (
        <div style={{ position: 'relative', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {recommendedHobbies.slice(0, 5).map((hobby) => (
            <span
              key={hobby}
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                background: 'rgba(51,65,85,0.8)',
                border: '1px solid rgba(71,85,105,0.6)',
                borderRadius: '9999px',
                padding: '4px 10px',
              }}
            >
              {hobby}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(51,65,85,0.6)',
          paddingTop: '12px',
          marginTop: '12px',
        }}
      >
        <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>
          significanthobbies.com/find-your-hobby
        </p>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#10b981', margin: 0 }}>
          Take the quiz →
        </p>
      </div>
    </div>
  );
}
