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
  const isNested = depth > 0;
  
  // Tailles adaptatives selon la profondeur
  const avatarSize = isNested ? 'w-6 h-6' : 'w-8 h-8';
  const textSize = isNested ? 'text-xs' : 'text-sm';
  const nameSize = isNested ? 'text-xs' : 'text-sm';
  const dateSize = 'text-xs';
  
  return (
    <>
      {thread.map((c) => (
        <div key={c.id} className={`${isNested ? 'ml-6 pl-4 border-l-2 border-border/50' : ''}`}>
          <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
            {c.user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={c.user.avatar_url} 
                alt={c.user.username} 
                className={`${avatarSize} rounded-full object-cover flex-shrink-0 mt-0.5`} 
              />
            ) : (
              <div className={`${avatarSize} rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5`}>
                {getInitials(c.user)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`${nameSize} font-medium`}>{displayName(c.user)}</span>
                <span className={`${dateSize} text-muted-foreground`}>
                  {new Date(c.created_at).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className={`${textSize} text-foreground mt-0.5`}>{c.content}</p>
              
              {/* Bouton répondre */}
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Reply size={12} />
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
                <Trash2 size={isNested ? 12 : 14} />
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
