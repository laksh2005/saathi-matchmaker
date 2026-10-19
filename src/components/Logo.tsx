export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
        <circle cx="12" cy="16" r="9" fill="none" stroke={light ? "#fff" : "#e2506b"} strokeWidth="3" />
        <circle cx="20" cy="16" r="9" fill="none" stroke={light ? "#fecdd5" : "#b9a287"} strokeWidth="3" />
      </svg>
      <span className={`font-serif text-xl ${light ? "text-white" : "text-sand-800"}`}>Saathi</span>
    </div>
  );
}
