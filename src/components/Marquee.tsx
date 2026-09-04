import IndiaFlag from "./IndiaFlag";

function FlagRow() {
  return (
    <div className="flex items-center gap-6 pr-6">
      {Array.from({ length: 24 }, (_, i) => (
        <IndiaFlag key={i} className="h-4 w-6 shrink-0" />
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div
      className="relative overflow-hidden py-2 opacity-50 select-none"
      aria-hidden="true"
    >
      <div className="flex w-max animate-marquee whitespace-nowrap">
        <FlagRow />
        <FlagRow />
      </div>
    </div>
  );
}
