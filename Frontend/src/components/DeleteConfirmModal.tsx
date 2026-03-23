import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  rowName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteConfirmModal({ rowName, onConfirm, onClose }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-elevated animate-slide-up">
        <div className="mb-4 flex flex-col items-center text-center">
          <div className="mb-3 rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Delete Row?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Are you sure you want to delete <strong className="text-foreground">{rowName}</strong>? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
