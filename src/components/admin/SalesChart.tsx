interface Props {
  data: Array<{ day: string; amount: number }>
}

export function SalesChart({ data }: Props) {
  const max = Math.max(...data.map((d) => d.amount))
  const width = 640
  const height = 220
  const padX = 24
  const padY = 20
  const chartW = width - padX * 2
  const chartH = height - padY * 2
  const stepX = chartW / (data.length - 1)

  const points = data.map((d, i) => {
    const x = padX + i * stepX
    const y = padY + chartH - (d.amount / max) * chartH
    return { x, y, ...d }
  })

  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')
  const area = `${line} L ${padX + chartW} ${padY + chartH} L ${padX} ${
    padY + chartH
  } Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b6cf1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5b6cf1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={padX}
          x2={padX + chartW}
          y1={padY + chartH * t}
          y2={padY + chartH * t}
          stroke="#eef0f5"
          strokeDasharray="4 4"
        />
      ))}
      <path d={area} fill="url(#area)" />
      <path d={line} fill="none" stroke="#5b6cf1" strokeWidth="2.4" />
      {points.map((p) => (
        <circle
          key={p.day}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="#fff"
          stroke="#5b6cf1"
          strokeWidth="2"
        />
      ))}
      {points.map((p, i) => (
        <text
          key={p.day + i}
          x={p.x}
          y={height - 4}
          textAnchor="middle"
          fontSize="10"
          fill="#8f8f9d"
        >
          {p.day}
        </text>
      ))}
    </svg>
  )
}
