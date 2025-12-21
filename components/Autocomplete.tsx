export default function Autocomplete({ items, onPick }: { items: string[]; onPick: (word: string) => void }) {
  if (!items.length) return null;

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-primary-100 bg-white shadow-glow">
      {items.map((w) => (
        <button
          key={w}
          type="button"
          onClick={() => onPick(w)}
          className="w-full text-left px-4 py-2 text-primary-800 dark:text-primary-200 hover:bg-primary-50 active:bg-primary-100 transition"
        >
          {w}
        </button>
      ))}
    </div>
  );
}
