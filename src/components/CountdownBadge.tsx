export function CountdownBadge({
  count,
  color = "#0b3a8a",
  size = 224, // 56 * 4 (w-56 = 14rem ≈ 224px)
  stroke = 8,
}: {
  count: number;
  color?: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div
      className="absolute inset-0 m-auto flex items-center justify-center"
      style={{ width: size, height: size }}
    >
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
      <div className="text-8xl font-bold" style={{ color }}>
        {count}
      </div>
    </div>
  );
}
