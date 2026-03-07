import { useState, useEffect } from 'react';
import type { Artwork } from '../types';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { Link } from 'react-router-dom';
import ArtworkModal from './ArtworkModal';

interface ArtworkCardProps {
    artwork: Artwork;
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
    const { user } = useAuth();
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            apiClient.get(`/interactions/save/${artwork.id}/status`)
                .then(res => setIsSaved(res.data.isSaved))
                .catch(err => console.error("Failed to fetch save status", err));
        }
    }, [artwork.id, user]);

    const toggleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return; // In a full app, might trigger a login modal

        try {
            setLoading(true);
            await apiClient.post(`/interactions/save/${artwork.id}`);
            setIsSaved(!isSaved);
        } catch (error) {
            console.error("Failed to toggle save", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6 break-inside-avoid animate-fade-in-up" style={{ animationDelay: `${Math.random() * 0.3}s` }}>
            <div
                className="relative group rounded-xl overflow-hidden glass-panel hover-glow transition-all duration-500 cursor-pointer"
                onClick={() => setIsModalOpen(true)}
            >
                <div className="overflow-hidden">
                    <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full object-cover image-hover-zoom"
                    />
                </div>

                {/* Top Action Bar (Heart) */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button
                        onClick={toggleSave}
                        disabled={loading}
                        className={`p-2 rounded-full backdrop-blur-md transition-all border ${isSaved ? 'bg-red-50/90 text-red-500 border-red-200 hover:bg-red-100' : 'bg-white/70 text-neutral-700 border-neutral-200/50 hover:bg-white hover:text-neutral-900 shadow-sm'}`}
                        title={isSaved ? "Remove from Saves" : "Save Artwork"}
                    >
                        <Heart className={isSaved ? "fill-current" : ""} size={20} />
                    </button>
                </div>

                {/* Hover Overlay - Soft Light Theme */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/60 to-transparent backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5 pointer-events-none">
                    <div className="pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                        <h3 className="text-xl font-extrabold text-neutral-900 truncate tracking-tight">{artwork.title}</h3>
                        <Link
                            to={`/artist/${artwork.artistName}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm font-medium text-neutral-600 hover:text-accent-blue truncate mb-3 block w-max transition-colors"
                        >
                            {artwork.artistName}
                        </Link>

                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-200/50">
                            <span className="text-xs font-bold text-neutral-700 px-2.5 py-1 bg-neutral-100/80 rounded-md shadow-sm">
                                {artwork.medium}
                            </span>
                            {artwork.forSale && (
                                <span className="font-bold text-accent-blue text-lg">
                                    ${artwork.price.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fullscreen Artwork Modal */}
            <ArtworkModal
                artwork={artwork}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isSaved={isSaved}
                onToggleSave={toggleSave}
                isSaveLoading={loading}
            />
        </div>
    );
}
