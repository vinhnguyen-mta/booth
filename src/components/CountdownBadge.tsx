export function CountdownBadge({
  count,
  color = "#0b3a8a",
  size = 224,
  stroke = 8,
}: {
  count: number;
  color?: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const shouldFlash = count === 1;

  return (
    <div
      className="absolute inset-0 m-auto flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div className="relative w-full h-full">
        <svg
          width={size}
          height={size}
          className="absolute inset-0"
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeOpacity={0.2}
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            key={count}
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={c}
            style={{ animation: "sweep 1s linear forwards" }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   text-8xl font-bold leading-none text-center tabular-nums z-10"
          style={{
            color: shouldFlash ? "#ffffff" : color,
            animation: shouldFlash ? "photo-pop 220ms ease-out" : undefined,
          }}
        >
          {count}
        </div>
        {shouldFlash && (
          <>
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                animation: "camera-flash 220ms ease-out",
                background:
                  "radial-gradient(closest-side, rgba(255,255,255,0.95), rgba(255,255,255,0.6) 60%, rgba(255,255,255,0) 100%)",
              }}
            />
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: "6px solid rgba(255,255,255,0.85)",
                animation: "ring-pop 420ms cubic-bezier(.2,.7,.2,1) forwards",
              }}
            />
          </>
        )}

        <style>{`
        @keyframes sweep { to { stroke-dashoffset: 0; } }
        @keyframes camera-flash {
          0% { opacity: 0; }
          12% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes photo-pop {
          0% { transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
          50% { transform: translate(-50%, -50%) scale(1.06); filter: brightness(1.6); }
          100% { transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
        }
        @keyframes ring-pop {
          0%   { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1.15); opacity: 0; }
        }
      `}</style>
      </div>
    </div>
  );
}
