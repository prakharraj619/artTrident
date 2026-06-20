import { X, Heart, Maximize2, MessageCircle, Send, Trash2 } from 'lucide-react';
import type { Artwork, CommentResponse } from '../types';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { formatDistanceToNow } from 'date-fns';

interface ArtworkModalProps {
    artwork: Artwork;
    isOpen: boolean;
    onClose: () => void;
    isSaved: boolean;
    onToggleSave: (e: React.MouseEvent) => void;
    isSaveLoading: boolean;
}

// Small avatar helper
function Avatar({ url, username, size = 8 }: { url?: string | null; username: string; size?: number }) {
    const px = `w-${size} h-${size}`;
    if (url) return <img src={url} alt={username} className={`${px} rounded-full object-cover flex-shrink-0`} />;
    return (
        <div className={`${px} rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {username.slice(0, 2).toUpperCase()}
        </div>
    );
}

export default function ArtworkModal({ artwork, isOpen, onClose, isSaved, onToggleSave, isSaveLoading }: ArtworkModalProps) {
    const { user, isAuthenticated } = useAuth();

    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [commentText, setCommentText] = useState('');
    const [isPostingComment, setIsPostingComment] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const commentsEndRef = useRef<HTMLDivElement>(null);

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Fetch comments when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setIsLoadingComments(true);
        apiClient.get<CommentResponse[]>(`/artworks/${artwork.id}/comments`)
            .then(res => setComments(res.data))
            .catch(console.error)
            .finally(() => setIsLoadingComments(false));
    }, [isOpen, artwork.id]);

    // Scroll to latest comment
    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const handlePostComment = async () => {
        if (!commentText.trim() || !isAuthenticated) return;
        setIsPostingComment(true);
        try {
            const res = await apiClient.post<CommentResponse>(`/artworks/${artwork.id}/comments`, {
                content: commentText.trim(),
            });
            setComments(prev => [...prev, res.data]);
            setCommentText('');
        } catch (err) {
            console.error('Failed to post comment', err);
        } finally {
            setIsPostingComment(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            await apiClient.delete(`/artworks/${artwork.id}/comments/${commentId}`);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (err) {
            console.error('Failed to delete comment', err);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostComment(); }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-md" />

            {/* Modal */}
            <div
                className="relative w-full max-w-6xl max-h-[92vh] flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-2xl z-10 animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    id="modal-close-btn"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white text-neutral-700 hover:text-neutral-900 rounded-full backdrop-blur-sm shadow-md transition-all"
                >
                    <X size={20} />
                </button>

                {/* ── Left: Image ─────────────────────────────────── */}
                <div className="w-full md:w-[55%] bg-neutral-950 flex items-center justify-center relative group min-h-[40vh]">
                    <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="max-w-full max-h-[92vh] object-contain"
                    />
                    <a
                        href={artwork.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-4 left-4 p-2 bg-white/80 hover:bg-white text-neutral-900 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        title="View full resolution"
                    >
                        <Maximize2 size={18} />
                    </a>
                </div>

                {/* ── Right: Info + Comments ───────────────────────── */}
                <div className="w-full md:w-[45%] flex flex-col bg-white overflow-hidden">

                    {/* Artwork header */}
                    <div className="px-6 pt-6 pb-4 border-b border-neutral-100 flex-shrink-0">
                        <div className="flex items-start justify-between pr-8">
                            <div>
                                <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">{artwork.title}</h2>
                                <Link
                                    to={`/artist/${artwork.artistName}`}
                                    onClick={onClose}
                                    className="text-sm font-semibold text-sky-500 hover:text-sky-600 transition-colors mt-0.5 block"
                                >
                                    @{artwork.artistName}
                                </Link>
                            </div>
                        </div>

                        {/* Actions row */}
                        <div className="flex items-center gap-3 mt-4">
                            <button
                                id="modal-save-btn"
                                onClick={onToggleSave}
                                disabled={isSaveLoading}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-all
                                    ${isSaved ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'} disabled:opacity-50`}
                            >
                                <Heart className={isSaved ? 'fill-current w-4 h-4' : 'w-4 h-4'} />
                                {isSaved ? 'Saved' : 'Save'}
                            </button>
                            <div className="flex items-center gap-1.5 text-sm text-neutral-400 font-medium">
                                <MessageCircle className="w-4 h-4" />
                                {comments.length} comment{comments.length !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {/* Description + metadata */}
                        {artwork.description && (
                            <p className="text-sm text-neutral-600 leading-relaxed mt-4 line-clamp-3">{artwork.description}</p>
                        )}
                        <div className="flex gap-4 mt-3">
                            <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-md">{artwork.medium}</span>
                            {artwork.forSale && (
                                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md">${artwork.price?.toFixed(2)}</span>
                            )}
                        </div>
                    </div>

                    {/* ── Comments list ───────────────────── */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                        {isLoadingComments ? (
                            <div className="space-y-3 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex-shrink-0" />
                                        <div className="flex-1 space-y-1.5 pt-1">
                                            <div className="h-2.5 bg-neutral-100 rounded w-20" />
                                            <div className="h-2 bg-neutral-100 rounded w-full" />
                                            <div className="h-2 bg-neutral-100 rounded w-3/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                <MessageCircle className="w-10 h-10 text-neutral-200 mb-3" />
                                <p className="text-sm font-medium text-neutral-500">No comments yet</p>
                                <p className="text-xs text-neutral-400 mt-1">Be the first to share your thoughts!</p>
                            </div>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="flex items-start gap-3 group">
                                    <Link to={`/artist/${comment.authorUsername}`} onClick={onClose}>
                                        <Avatar url={comment.authorAvatarUrl} username={comment.authorUsername} size={8} />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2">
                                            <Link
                                                to={`/artist/${comment.authorUsername}`}
                                                onClick={onClose}
                                                className="text-sm font-semibold text-neutral-800 hover:text-sky-500 transition-colors"
                                            >
                                                {comment.authorUsername}
                                            </Link>
                                            <span className="text-[10px] text-neutral-400 flex-shrink-0">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-700 leading-relaxed mt-0.5 break-words">{comment.content}</p>
                                    </div>
                                    {/* Delete button: visible only to author or artwork owner */}
                                    {isAuthenticated && (user?.username === comment.authorUsername || user?.username === artwork.artistName) && (
                                        <button
                                            id={`delete-comment-${comment.id}`}
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-neutral-300 hover:text-red-400 flex-shrink-0 mt-1"
                                            title="Delete comment"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={commentsEndRef} />
                    </div>

                    {/* ── Comment input ────────────────────── */}
                    <div className="px-5 py-4 border-t border-neutral-100 flex-shrink-0">
                        {isAuthenticated ? (
                            <div className="flex items-start gap-3">
                                <Avatar url={null} username={user?.username ?? '?'} size={8} />
                                <div className="flex-1 flex items-end gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-50 transition-all">
                                    <textarea
                                        id="comment-input"
                                        rows={1}
                                        value={commentText}
                                        onChange={e => setCommentText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Add a comment..."
                                        maxLength={1000}
                                        className="flex-1 text-sm text-neutral-800 placeholder:text-neutral-400 bg-transparent outline-none resize-none py-0.5"
                                    />
                                    <button
                                        id="post-comment-btn"
                                        onClick={handlePostComment}
                                        disabled={!commentText.trim() || isPostingComment}
                                        className="w-8 h-8 rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
                                    >
                                        {isPostingComment
                                            ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            : <Send className="w-3.5 h-3.5 text-white" />
                                        }
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-center text-neutral-400">
                                <Link to="/login" onClick={onClose} className="text-sky-500 font-semibold hover:underline">Sign in</Link> to leave a comment
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
