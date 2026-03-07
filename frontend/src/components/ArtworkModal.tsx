import { X, Heart, Maximize2 } from 'lucide-react';
import type { Artwork } from '../types';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ArtworkModalProps {
    artwork: Artwork;
    isOpen: boolean;
    onClose: () => void;
    isSaved: boolean;
    onToggleSave: (e: React.MouseEvent) => void;
    isSaveLoading: boolean;
}

export default function ArtworkModal({ artwork, isOpen, onClose, isSaved, onToggleSave, isSaveLoading }: ArtworkModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-fade-in" onClick={onClose}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-900/80 backdrop-blur-md transition-opacity"
            ></div>

            {/* Modal Content */}
            <div
                className="relative w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-2xl z-10 animate-scale-in"
                onClick={e => e.stopPropagation()} // Prevent clicking inside modal from closing it
            >

                {/* Close Button - Absolute */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-neutral-900 rounded-full backdrop-blur-sm transition-colors shadow-sm"
                >
                    <X size={24} />
                </button>

                {/* Left Side: Image */}
                <div className="w-full md:w-2/3 bg-neutral-100 flex items-center justify-center p-4 min-h-[50vh] relative group">
                    <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="max-w-full max-h-[85vh] object-contain drop-shadow-lg"
                    />
                    <a
                        href={artwork.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-4 left-4 p-2 bg-white/80 hover:bg-white text-neutral-900 rounded-full backdrop-blur-sm transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                        title="View Full Resolution"
                    >
                        <Maximize2 size={20} />
                    </a>
                </div>

                {/* Right Side: Details */}
                <div className="w-full md:w-1/3 flex flex-col bg-white p-8 overflow-y-auto">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-6 pr-8">
                        <div>
                            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">{artwork.title}</h2>
                            <Link
                                to={`/artist/${artwork.artistName}`}
                                onClick={onClose} // close modal if navigating
                                className="text-lg font-bold text-accent-blue hover:text-accent-teal transition-colors"
                            >
                                {artwork.artistName}
                            </Link>
                        </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-neutral-100">
                        <button
                            onClick={onToggleSave}
                            disabled={isSaveLoading}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all border shadow-sm ${isSaved
                                ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900'
                                } disabled:opacity-50`}
                        >
                            <Heart className={isSaved ? "fill-current" : ""} size={20} />
                            {isSaved ? "Saved" : "Save"}
                        </button>
                    </div>

                    {/* Description */}
                    <div className="flex-grow">
                        <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">About this piece</h4>
                        <p className="text-neutral-700 leading-relaxed mb-8">
                            {artwork.description || "The artist has not provided a description for this artwork."}
                        </p>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Medium</h4>
                                <p className="font-semibold text-neutral-900">{artwork.medium}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Created At</h4>
                                <p className="font-semibold text-neutral-900">
                                    {new Date(artwork.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions / Price */}
                    <div className="pt-6 border-t border-neutral-100 mt-auto">
                        {artwork.forSale ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-neutral-500 mb-1">Price</p>
                                    <p className="text-3xl font-extrabold text-neutral-900">${artwork.price.toFixed(2)}</p>
                                </div>
                                <button className="px-8 py-4 bg-accent-blue text-white font-bold rounded-xl hover:bg-accent-blue/90 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5">
                                    Purchase
                                </button>
                            </div>
                        ) : (
                            <div className="bg-neutral-50 rounded-xl p-4 text-center border border-neutral-100">
                                <p className="font-bold text-neutral-500">Not for sale</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
