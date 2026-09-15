import { useState } from "react";
import { Plus } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";

export default function AddActivityForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, time: time || "Anytime" }); // hands the new activity up to the day it belongs to
    setTitle("");
    setTime("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="focus-ring flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <Plus className="h-4 w-4" /> Add activity
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-slate-100 bg-white p-4 shadow-card">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
        <Input placeholder="e.g. Sunset boat ride" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="e.g. 5:00 PM" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="w-auto px-5">
          Add
        </Button>
        <Button type="button" variant="ghost" className="w-auto px-5" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
