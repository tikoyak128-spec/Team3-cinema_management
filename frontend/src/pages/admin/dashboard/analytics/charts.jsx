export function AreaChart({
  labels,
  values,
  width = 640,
  height = 250,
  color = "#e50914",
  gradientId = "an-area-grad",
  format = (v) => `${v.toFixed(1)}k`,
}) {
  const padX = 44;
  const padTop = 18;
  const padBottom = 30;
  const max = Math.max(...values, 1);
  const innerW = width - padX - 12;
  const innerH = height - padTop - padBottom;
  const stepX = innerW / (values.length - 1);

  const pts = values.map((v, i) => {
    const x = padX + i * stepX;
    const y = padTop + innerH - (v / max) * innerH;
    return [x, y];
  });

  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `M ${pts[0][0].toFixed(1)} ${height - padBottom} L ${line} L ${
    pts[pts.length - 1][0].toFixed(1)
  } ${height - padBottom} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      className="an-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Chart"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {gridLines.map((g) => {
        const y = padTop + innerH * (1 - g);
        return (
          <g key={g}>
            <line
              x1={padX}
              x2={width - 12}
              y1={y}
              y2={y}
              stroke="#242424"
              strokeDasharray="4 6"
            />
            <text x={padX - 10} y={y + 4} textAnchor="end" className="an-chart-axis">
              {format(max * g)}
            </text>
          </g>
        );
      })}

      <path d={area} fill={`url(#${gradientId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === pts.length - 1 ? 5 : 0}
          fill={color}
        />
      ))}

      {labels.map((lb, i) => {
        const x = padX + i * stepX;
        return (
          <text key={lb} x={x} y={height - 8} textAnchor="middle" className="an-chart-axis">
            {lb}
          </text>
        );
      })}
    </svg>
  );
}

export function BarChart({
  labels,
  values,
  width = 640,
  height = 240,
  barColor = "#e50914",
  format = (v) => `${v}`,
}) {
  const padX = 40;
  const padTop = 14;
  const padBottom = 28;
  const max = Math.max(...values, 1);
  const innerW = width - padX - 12;
  const innerH = height - padTop - padBottom;
  const slot = innerW / values.length;
  const barW = Math.min(34, slot * 0.55);

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      className="an-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Bar chart"
    >
      {gridLines.map((g) => {
        const y = padTop + innerH * (1 - g);
        return (
          <g key={g}>
            <line
              x1={padX}
              x2={width - 12}
              y1={y}
              y2={y}
              stroke="#242424"
              strokeDasharray="4 6"
            />
            <text x={padX - 10} y={y + 4} textAnchor="end" className="an-chart-axis">
              {format(max * g)}
            </text>
          </g>
        );
      })}

      {values.map((v, i) => {
        const x = padX + i * slot + (slot - barW) / 2;
        const h = (v / max) * innerH;
        const y = padTop + innerH - h;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, 2)}
              rx={5}
              fill={barColor}
            />
          </g>
        );
      })}

      {labels.map((lb, i) => {
        const x = padX + i * slot + slot / 2;
        return (
          <text key={lb} x={x} y={height - 8} textAnchor="middle" className="an-chart-axis">
            {lb}
          </text>
        );
      })}
    </svg>
  );
}

export function DonutChart({
  data,
  size = 170,
  thickness = 24,
  centerValue,
  centerLabel = "Total",
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;

  const slices = data.reduce((acc, d) => {
    const prev = acc[acc.length - 1];
    const len = Math.max((d.value / total) * c - 3, 1);
    const offset = prev ? prev.offset + prev.len + 3 : 0;
    acc.push({ ...d, len, offset });
    return acc;
  }, []);

  return (
    <div className="an-donut-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#1c1c1c"
          strokeWidth={thickness}
        />
        {slices.map((d) => (
          <circle
            key={d.name}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={thickness}
            strokeDasharray={`${d.len} ${c - d.len}`}
            strokeDashoffset={-d.offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
      </svg>
      <div className="an-donut-center">
        <div className="an-donut-value">{centerValue ?? total.toLocaleString()}</div>
        <div className="an-donut-label">{centerLabel}</div>
      </div>
    </div>
  );
}