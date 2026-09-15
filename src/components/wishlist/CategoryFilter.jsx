export default function CategoryFilter({ categories, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => {
        const isActive = active === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)} // narrows the wishlist grid to this category
            className={`focus-ring rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              isActive ? "text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            style={isActive ? { backgroundColor: "var(--brand)" } : undefined}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
