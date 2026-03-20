import { X, AlertCircle, Trash2, LogOut } from 'lucide-react';

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'primary' }) {
  if (!isOpen) return null;

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  const icons = {
    primary: <AlertCircle className="h-6 w-6 text-primary" />,
    destructive: <Trash2 className="h-6 w-6 text-destructive" />,
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full bg-secondary/50`}>
              {variant === 'destructive' ? <Trash2 className="h-6 w-6 text-destructive" /> : <AlertCircle className="h-6 w-6 text-primary" />}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground leading-relaxed italic">{message}</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary/20 p-4 flex justify-end gap-3 border-t border-border/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 text-sm font-black rounded-lg transition-all active:scale-95 shadow-lg ${variants[variant] || variants.primary}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
