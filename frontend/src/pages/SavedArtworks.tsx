import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import type { Artwork } from '../types';
import ArtworkCard from '../components/ArtworkCard';
import Navbar from '../components/Navbar';
import { Heart, Loader2 } from 'lucide-react';

export default function SavedArtworks() {
    const [savedArtworks, setSavedArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        const fetchSaved = async () => {
            try {
                const response = await apiClient.get('/interactions/saved?page=0&size=10');
                setSavedArtworks(response.data.content || []);
                setHasMore(!response.data.last);
            } catch (error) {
                console.error("Failed to fetch saved artworks", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSaved();
    }, []);

    const loadMore = async () => {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const response = await apiClient.get(`/interactions/saved?page=${nextPage}&size=10`);
            setSavedArtworks(prev => [...prev, ...(response.data.content || [])]);
            setPage(nextPage);
            setHasMore(!response.data.last);
        } catch (error) {
            console.error("Failed to load more saved artworks", error);
        } finally {
            setLoadingMore(false);
        }
    };

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
                    <>
                        <div className="flex w-full gap-6 animate-fade-in">
                            {/* Mobile Grid (1 Column) */}
                            <div className="flex-1 flex flex-col gap-6 sm:hidden">
                                {savedArtworks.map((artwork) => (
                                    <ArtworkCard key={artwork.id} artwork={artwork} />
                                ))}
                            </div>

                            {/* Tablet Grid (2 Columns) */}
                            <div className="flex-1 flex flex-col gap-6 hidden sm:flex lg:hidden">
                                {savedArtworks.filter((_, i) => i % 2 === 0).map((artwork) => (
                                    <ArtworkCard key={artwork.id} artwork={artwork} />
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col gap-6 hidden sm:flex lg:hidden">
                                {savedArtworks.filter((_, i) => i % 2 === 1).map((artwork) => (
                                    <ArtworkCard key={artwork.id} artwork={artwork} />
                                ))}
                            </div>

                            {/* Desktop Grid (3 Columns) */}
                            <div className="flex-1 flex flex-col gap-6 hidden lg:flex xl:hidden">
                                {savedArtworks.filter((_, i) => i % 3 === 0).map((artwork) => (
                                    <ArtworkCard key={`desktop-0-${artwork.id}`} artwork={artwork} />
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col gap-6 hidden lg:flex xl:hidden">
                                {savedArtworks.filter((_, i) => i % 3 === 1).map((artwork) => (
                                    <ArtworkCard key={`desktop-1-${artwork.id}`} artwork={artwork} />
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col gap-6 hidden lg:flex xl:hidden">
                                {savedArtworks.filter((_, i) => i % 3 === 2).map((artwork) => (
                                    <ArtworkCard key={`desktop-2-${artwork.id}`} artwork={artwork} />
                                ))}
                            </div>

                            {/* Large Desktop Grid (4 Columns) */}
                            <div className="flex-1 flex flex-col gap-6 hidden xl:flex">
                                {savedArtworks.filter((_, i) => i % 4 === 0).map((artwork) => (
                                    <ArtworkCard key={`xl-0-${artwork.id}`} artwork={artwork} />
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col gap-6 hidden xl:flex">
                                {savedArtworks.filter((_, i) => i % 4 === 1).map((artwork) => (
                                    <ArtworkCard key={`xl-1-${artwork.id}`} artwork={artwork} />
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col gap-6 hidden xl:flex">
                                {savedArtworks.filter((_, i) => i % 4 === 2).map((artwork) => (
                                    <ArtworkCard key={`xl-2-${artwork.id}`} artwork={artwork} />
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col gap-6 hidden xl:flex">
                                {savedArtworks.filter((_, i) => i % 4 === 3).map((artwork) => (
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
                                    {loadingMore ? 'Loading...' : 'Load More Saved Artworks'}
                                </button>
                            </div>
                        )}
                        {!hasMore && savedArtworks.length > 0 && (
                            <div className="mt-12 text-center text-neutral-500 pb-12">
                                <p>You've reached the end of your collection.</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
