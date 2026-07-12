import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const squares = [
  ['Take the', 'long way'],
  ['Make', 'something'],
  ['Invite', 'someone'],
  ['Try it', 'badly'],
  ['Say yes', 'once'],
  ['Go before', 'sunrise'],
  ['Learn one', 'small thing'],
  ['Leave the', 'usual path'],
  ['Keep the', 'story'],
];

const colors = [
  '#dce9d8',
  '#f3d776',
  '#d9e8ee',
  '#e8cabb',
  '#f7efe0',
  '#c9d8c7',
  '#ecd9b3',
  '#d7cfe4',
  '#e8d7ca',
];

export default function LifeBingoOpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: '#f7f1e7',
        color: '#20352c',
        padding: '48px 58px',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div
        style={{
          width: '42%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '18px 42px 18px 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: '#176b4a',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#176b4a',
              color: 'white',
              fontSize: 13,
            }}
          >
            SH
          </div>
          Significant Hobbies
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#176b4a',
              marginBottom: 18,
            }}
          >
            Life Bingo
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 67,
              fontWeight: 700,
              lineHeight: 0.93,
              letterSpacing: -3,
            }}
          >
            <span>Make life</span>
            <span>less repetitive.</span>
          </div>
          <div
            style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: 21,
              lineHeight: 1.35,
              color: '#655f55',
              marginTop: 24,
              maxWidth: 390,
            }}
          >
            A beautiful Bucket List you can actually play.
          </div>
        </div>
        <div
          style={{
            fontFamily: 'Arial, sans-serif',
            display: 'flex',
            fontSize: 18,
            fontWeight: 700,
            color: '#176b4a',
          }}
        >
          significanthobbies.com/life-bingo
        </div>
      </div>
      <div
        style={{ width: '58%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div
          style={{
            width: 520,
            height: 520,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            padding: 15,
            border: '3px solid #20352c',
            borderRadius: 28,
            background: '#fffaf0',
            transform: 'rotate(1.5deg)',
            boxShadow: '0 25px 55px rgba(32,53,44,.18)',
          }}
        >
          {squares.map((square, index) => (
            <div
              key={square.join('-')}
              style={{
                width: 156,
                height: 156,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                border: '2px solid #20352c',
                borderRadius: index % 3 === 0 ? 24 : 12,
                background: colors[index],
                fontSize: 25,
                fontWeight: 700,
                lineHeight: 1.05,
                transform: `rotate(${index % 2 === 0 ? -0.7 : 0.6}deg)`,
              }}
            >
              <span>{square[0]}</span>
              <span>{square[1]}</span>
              {[1, 4, 7].includes(index) && (
                <span
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    marginTop: 11,
                    padding: '5px 9px',
                    border: '2px solid #9b4d34',
                    color: '#9b4d34',
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: 2,
                    transform: 'rotate(-6deg)',
                  }}
                >
                  LIVED
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>,
    size
  );
}
