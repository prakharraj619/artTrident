import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import type { Artwork } from '../types';
import ArtworkCard from '../components/ArtworkCard';
import Navbar from '../components/Navbar';
import { Heart, Loader2 } from 'lucide-react';

export default function SavedArtworks() {
    const [savedArtworks, setSavedArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSaved = async () => {
            try {
                const response = await apiClient.get('/interactions/saved');
                setSavedArtworks(response.data.content || []);
            } catch (error) {
                console.error("Failed to fetch saved artworks", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSaved();
    }, []);

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-accent-blue/20">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8 animate-fade-in-up flex items-center gap-3">
                    <div className="p-3 bg-red-50 text-red-500 rounded-xl shadow-sm">
                        <Heart className="fill-current w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 tracking-tight">
                            Saved Artworks
                        </h1>
                        <p className="text-neutral-500 mt-1 text-base font-light">Your personal collection of masterpieces.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-accent-blue w-8 h-8" />
                    </div>
                ) : savedArtworks.length === 0 ? (
                    <div className="text-center py-20 border border-neutral-200 rounded-2xl bg-white/50 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <Heart className="mx-auto text-neutral-300 mb-4 w-12 h-12" />
                        <h2 className="text-xl font-semibold text-neutral-900">Your collection is empty</h2>
                        <p className="text-neutral-500 mt-2">Discover and save artworks you love to see them here.</p>
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 animate-fade-in">
                        {savedArtworks.map((artwork) => (
                            <ArtworkCard key={artwork.id} artwork={artwork} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
