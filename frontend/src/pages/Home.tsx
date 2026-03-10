import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import type { Artwork } from '../types';
import ArtworkCard from '../components/ArtworkCard';
import { Brush } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Home() {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await apiClient.get('/artworks/feed?page=0&size=10');
                setArtworks(response.data.content || []);
                setHasMore(!response.data.last);
            } catch (error) {
                console.error("Failed to fetch artworks feed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, []);

    const loadMore = async () => {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const response = await apiClient.get(`/artworks/feed?page=${nextPage}&size=10`);
            setArtworks(prev => [...prev, ...(response.data.content || [])]);
            setPage(nextPage);
            setHasMore(!response.data.last);
        } catch (error) {
            console.error("Failed to load more artworks", error);
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-accent-blue/20">
            {/* Navigation Bar */}
            <Navbar />

            {/* Main Feed Content */}
            <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
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
                    <>
                        {/* Custom Masonry Layout using Flexbox */}
                        <div className="flex w-full gap-6">
                            {/* 
                                We split the artworks into 3 columns for desktop, 2 for tablet, 1 for mobile.
                                For simplicity in this component without complex window listeners, 
                                we rely on Tailwind's responsive hiding to show the correct column structure.
                            */}
                            {/* Mobile Grid (1 Column) */}
                            <div className="flex-1 flex flex-col gap-6 sm:hidden">
                                {artworks.map((artwork) => (
                                    <ArtworkCard key={artwork.id} artwork={artwork} />
                                ))}
                            </div>

                            {/* Tablet Grid (2 Columns) */}
                            <div className="flex-1 flex flex-col gap-6 hidden sm:flex lg:hidden">
                                {artworks.filter((_, i) => i % 2 === 0).map((artwork) => (
                                    <ArtworkCard key={artwork.id} artwork={artwork} />
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col gap-6 hidden sm:flex lg:hidden">
                                {artworks.filter((_, i) => i % 2 === 1).map((artwork) => (
                                    <ArtworkCard key={artwork.id} artwork={artwork} />
                                ))}
                            </div>

                            {/* Desktop Grid (3 Columns) */}
                            <div className="flex-1 flex flex-col gap-6 hidden lg:flex xl:hidden">
                                {artworks.filter((_, i) => i % 3 === 0).map((artwork) => (
                                    <ArtworkCard key={`desktop-0-${artwork.id}`} artwork={artwork} />
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col gap-6 hidden lg:flex xl:hidden">
                                {artworks.filter((_, i) => i % 3 === 1).map((artwork) => (
                                    <ArtworkCard key={`desktop-1-${artwork.id}`} artwork={artwork} />
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col gap-6 hidden lg:flex xl:hidden">
                                {artworks.filter((_, i) => i % 3 === 2).map((artwork) => (
                                    <ArtworkCard key={`desktop-2-${artwork.id}`} artwork={artwork} />
                                ))}
                            </div>

                            {/* Large Desktop Grid (4 Columns) */}
                            <div className="flex-1 flex flex-col gap-6 hidden xl:flex">
                                {artworks.filter((_, i) => i % 4 === 0).map((artwork) => (
                                    <ArtworkCard key={`xl-0-${artwork.id}`} artwork={artwork} />
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col gap-6 hidden xl:flex">
                                {artworks.filter((_, i) => i % 4 === 1).map((artwork) => (
                                    <ArtworkCard key={`xl-1-${artwork.id}`} artwork={artwork} />
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col gap-6 hidden xl:flex">
                                {artworks.filter((_, i) => i % 4 === 2).map((artwork) => (
                                    <ArtworkCard key={`xl-2-${artwork.id}`} artwork={artwork} />
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col gap-6 hidden xl:flex">
                                {artworks.filter((_, i) => i % 4 === 3).map((artwork) => (
                                    <ArtworkCard key={`xl-3-${artwork.id}`} artwork={artwork} />
                                ))}
                            </div>
                        </div>
                        {hasMore && (
                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="px-8 py-3 bg-white border border-neutral-200 text-neutral-900 rounded-full font-semibold shadow-sm hover:shadow-md hover:bg-neutral-50 transition-all disabled:opacity-50"
                                >
                                    {loadingMore ? 'Loading...' : 'Load More Artworks'}
                                </button>
                            </div>
                        )}
                        {!hasMore && artworks.length > 0 && (
                            <div className="mt-12 text-center text-neutral-500 pb-12">
                                <p>You've reached the end of the feed.</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
