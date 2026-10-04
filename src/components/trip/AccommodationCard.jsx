import { useState } from "react";
import { Star, CheckCircle2, Hotel, Plus, Edit2, X } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function AccommodationCard({ stay, onSaveStay, destination = "" }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: stay?.name || "",
    roomType: stay?.roomType || "Standard Suite",
    rating: stay?.rating || "4.8",
    confirmationNumber: stay?.confirmationNumber || "",
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSaveStay?.({
      ...form,
      rating: parseFloat(form.rating) || 4.8,
      reviews: stay?.reviews || 128,
    });
    setEditing(false);
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
        <div
          className="h-20 w-full flex items-center justify-between px-5 text-white"
          style={{ backgroundImage: "linear-gradient(135deg, var(--brand-mid), var(--brand-dark))" }}
        >
          <div className="flex items-center gap-2">
            <Hotel className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Stay & Accommodation</span>
          </div>
          {stay && (
            <button
              onClick={() => {
                setForm({
                  name: stay.name,
                  roomType: stay.roomType || "Standard Suite",
                  rating: String(stay.rating || "4.8"),
                  confirmationNumber: stay.confirmationNumber || "",
                });
                setEditing(true);
              }}
              className="rounded-lg bg-white/20 p-1.5 hover:bg-white/30 transition text-white"
              title="Edit accommodation"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="p-5">
          {stay ? (
            <>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Confirmed Booking
              </div>
              <h4 className="font-display text-base font-semibold text-slate-900">{stay.name}</h4>
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {stay.rating} · {stay.reviews || 95} reviews
              </div>
              {stay.roomType && <p className="mt-2 text-xs text-slate-500">{stay.roomType}</p>}
              {stay.confirmationNumber && (
                <div className="mt-3 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                  Ref: <span className="font-mono font-bold text-slate-800">{stay.confirmationNumber}</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-slate-500">
                No accommodation attached yet for {destination || "this trip"}.
              </p>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-emerald-600/40 bg-emerald-50/50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add hotel / stay
              </button>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                {stay ? "Edit accommodation" : "Add accommodation"}
              </h3>
              <button
                onClick={() => setEditing(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <Input
                label="Hotel / Resort Name"
                placeholder="e.g. Grand Palace Hotel & Spa"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Input
                label="Room / Suite Type"
                placeholder="e.g. Deluxe Sea View Suite"
                value={form.roomType}
                onChange={(e) => setForm((f) => ({ ...f, roomType: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Star Rating"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={form.rating}
                  onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                />
                <Input
                  label="Booking Ref / Voucher"
                  placeholder="e.g. HTL-92812"
                  value={form.confirmationNumber}
                  onChange={(e) => setForm((f) => ({ ...f, confirmationNumber: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setEditing(false)} className="w-auto px-4">
                  Cancel
                </Button>
                <Button type="submit" className="w-auto px-5">
                  Save stay
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

