import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import type { Artwork } from '../types';
import ArtworkCard from '../components/ArtworkCard';
import { Brush } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Home() {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await apiClient.get('/artworks/feed');
                // Spring Data JPA paginated response wraps the array in 'content'
                setArtworks(response.data.content || []);
            } catch (error) {
                console.error("Failed to fetch artworks feed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, []);

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-accent-blue/20">
            {/* Navigation Bar */}
            <Navbar />

            {/* Main Feed Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 tracking-tight">
                        Explore Masterpieces
                    </h1>
                    <p className="text-neutral-500 mt-3 text-lg font-light">Discover original artwork straight from the artists.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-blue"></div>
                    </div>
                ) : artworks.length === 0 ? (
                    <div className="text-center py-20 border border-neutral-200 rounded-2xl bg-white/50">
                        <Brush className="mx-auto text-neutral-400 mb-4" size={48} />
                        <h2 className="text-xl font-semibold text-neutral-900">No artwork found</h2>
                        <p className="text-neutral-500 mt-2">Be the first to upload a masterpiece.</p>
                    </div>
                ) : (
                    // Masonry Grid using Tailwind CSS columns
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                        {artworks.map((artwork) => (
                            <ArtworkCard key={artwork.id} artwork={artwork} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
