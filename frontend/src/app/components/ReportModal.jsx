import { useState } from 'react';
import { X, Flag, Loader2 } from 'lucide-react';

export function ReportModal({ isOpen, onClose, onConfirm, isSubmitting }) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2 text-destructive font-semibold">
            <Flag className="h-5 w-5" />
            <span>Report Content</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Help us understand what's wrong with this post. Your report will be reviewed by college administrators.
          </p>
          
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for reporting (e.g., Harassment, Inappropriate, Spam...)"
            className="w-full px-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none text-sm mb-4"
            rows={4}
            required
          />
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium text-sm hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
