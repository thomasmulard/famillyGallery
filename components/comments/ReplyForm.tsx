import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ReplyFormProps {
  parentId: number;
  photoId: number;
  onReply: (comment: string, parentId: number) => Promise<void>;
  onCancel?: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ parentId, photoId, onReply, onCancel }) => {
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setLoading(true);
    await onReply(reply.trim(), parentId);
    setReply('');
    setLoading(false);
  };

  return (
    <form onSubmit={handleReply} className="mt-2 flex gap-2 items-center">
      <input
        type="text"
        value={reply}
        onChange={e => setReply(e.target.value)}
        placeholder="Écrire une réponse..."
        className="flex-1 px-2 py-1 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        autoFocus
      />
      <button
        type="submit"
        disabled={!reply.trim() || loading}
        className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Envoi...' : 'Publier'}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Annuler"
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
};

export default ReplyForm;
