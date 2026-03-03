import { useState } from "react";
import { X, AlertCircle } from "lucide-react";

interface AddRowModalProps {
  columns: string[];
  onAdd: (row: Record<string, string>) => void;
  onClose: () => void;
}

export function AddRowModal({ columns, onAdd, onClose }: AddRowModalProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(columns.map((c) => [c, ""]))
  );
  const [submitted, setSubmitted] = useState(false);
  const [shaking, setShaking] = useState(false);

  const hasErrors = columns.some((c) => !values[c]?.trim());

  const handleSubmit = () => {
    setSubmitted(true);
    if (hasErrors) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }
    onAdd(values);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`
          relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-elevated
          animate-slide-up
          ${shaking ? "shake" : ""}
        `}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Add New Row</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {columns.map((col) => {
            const invalid = submitted && !values[col]?.trim();
            return (
              <div key={col}>
                <label className="mb-1 block text-sm font-medium capitalize text-foreground">
                  {col}
                </label>
                <input
                  value={values[col]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [col]: e.target.value }))
                  }
                  placeholder={`Enter ${col}`}
                  className={`
                    w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all
                    placeholder:text-muted-foreground
                    focus:border-primary focus:ring-2 focus:ring-ring/20
                    ${invalid ? "border-destructive ring-1 ring-destructive/30" : "border-input"}
                  `}
                />
                {invalid && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-destructive animate-fade-in">
                    <AlertCircle className="h-3 w-3" />
                    {col} is required
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitted && hasErrors}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:shadow-elevated hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            Add Row
          </button>
        </div>
      </div>
    </div>
  );
}
