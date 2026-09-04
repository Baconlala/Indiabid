type Props = {
  data: { day: string; count: number }[];
};

export default function ClickChart({ data }: Props) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const barWidth = 100 / data.length;

  return (
    <div className="flex flex-col gap-2">
      <svg viewBox="0 0 100 36" preserveAspectRatio="none" className="h-28 w-full overflow-visible">
        {data.map((d, i) => {
          const h = (d.count / max) * 32;
          return (
            <rect
              key={d.day}
              x={i * barWidth + barWidth * 0.15}
              y={36 - h}
              width={barWidth * 0.7}
              height={h}
              rx={0.6}
              className="fill-saffron"
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-muted">
        <span>{formatShort(data[0]?.day)}</span>
        <span>{formatShort(data[data.length - 1]?.day)}</span>
      </div>
    </div>
  );
}

function formatShort(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
