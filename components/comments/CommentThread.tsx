import React, { useState } from 'react';
import ReplyForm from './ReplyForm';
import { Trash2, Reply } from 'lucide-react';

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  parentId?: number | null;
  user: {
    id: number;
    username: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface CommentThreadProps {
  comments: Comment[];
  parentId: number | null;
  currentUser: any;
  displayName: (u: any) => string;
  getInitials: (u: any) => string;
  handleDeleteComment: (id: number) => void;
  handleReplyComment: (content: string, parentId: number) => Promise<void>;
  photoId: number;
  depth?: number;
}

const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  parentId,
  currentUser,
  displayName,
  getInitials,
  handleDeleteComment,
  handleReplyComment,
  photoId,
  depth = 0,
}) => {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const thread = comments.filter(c => c.parentId === parentId);
  
  // Indentation uniquement au premier niveau de réponse (depth === 1)
  // Tous les niveaux suivants restent alignés
  const shouldIndent = depth === 1;
  
  return (
    <>
      {thread.map((c) => (
        <div key={c.id} className={shouldIndent ? 'ml-10 relative' : ''}>
          {/* Ligne de connexion pour le premier niveau de réponse seulement */}
          {shouldIndent && (
            <div className="absolute left-0 top-0 bottom-0 w-px bg-border/50" />
          )}
          
          <div className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors group ${shouldIndent ? 'ml-4' : ''}`}>
            {c.user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={c.user.avatar_url} 
                alt={c.user.username} 
                className="w-8 h-8 rounded-full object-cover flex-shrink-0" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {getInitials(c.user)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold">{displayName(c.user)}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              <p className="text-sm text-foreground leading-relaxed">{c.content}</p>
              
              {/* Bouton répondre */}
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                  className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Reply size={14} />
                  Répondre
                </button>
              </div>
              
              {/* Formulaire de réponse (affiché uniquement quand actif) */}
              {replyingTo === c.id && (
                <ReplyForm 
                  parentId={c.id} 
                  photoId={photoId} 
                  onReply={async (content, parentId) => {
                    await handleReplyComment(content, parentId);
                    setReplyingTo(null);
                  }}
                  onCancel={() => setReplyingTo(null)}
                />
              )}
            </div>
            {(currentUser && (c.user.id === currentUser.id || currentUser.is_admin)) && (
              <button
                onClick={() => handleDeleteComment(c.id)}
                className="p-1 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Supprimer"
                title={currentUser.is_admin && c.user.id !== currentUser.id ? "Supprimer (Admin)" : "Supprimer"}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          {/* Affichage récursif des réponses */}
          <CommentThread
            comments={comments}
            parentId={c.id}
            currentUser={currentUser}
            displayName={displayName}
            getInitials={getInitials}
            handleDeleteComment={handleDeleteComment}
            handleReplyComment={handleReplyComment}
            photoId={photoId}
            depth={depth + 1}
          />
        </div>
      ))}
    </>
  );
};

export default CommentThread;
