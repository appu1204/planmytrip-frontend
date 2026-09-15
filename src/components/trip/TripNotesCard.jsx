import { useState } from "react";

export default function TripNotesCard({ value, onSave }) {
  const [draft, setDraft] = useState(value || "");

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <h4 className="text-sm font-semibold text-slate-800">Trip notes</h4>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft !== value && onSave(draft)} // only calls the API when the text actually changed
        rows={4}
        placeholder="Anything the group shouldn't forget…"
        className="focus-ring mt-3 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm text-slate-700 placeholder:text-slate-400"
      />
    </div>
  );
}
