import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';
import type { UserProfile, Artwork } from '../types';
import ArtworkCard from '../components/ArtworkCard';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { UserPlus, UserCheck, Edit3 } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';

const ArtistProfile = () => {
    const { username } = useParams<{ username: string }>();
    const { isAuthenticated, user } = useAuth();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isFollowing, setIsFollowing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Pagination State
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        const fetchProfileAndWorks = async () => {
            if (!username) return;
            setLoading(true);
            setError('');
            try {
                // Fetch Profile Header
                const profileRes = await apiClient.get(`/users/${username}`);
                setProfile(profileRes.data);

                // Fetch First Page of Portfolio
                const portfolioRes = await apiClient.get(`/artworks/artist/${username}?page=0&size=10`);
                setArtworks(portfolioRes.data.content);
                setHasMore(!portfolioRes.data.last);
                setPage(0);

                // Only fetch follow status if logged in and looking at someone else
                if (isAuthenticated && user?.username !== username) {
                    const followRes = await apiClient.get(`/interactions/follow/${username}/status`);
                    setIsFollowing(followRes.data.isFollowing);
                }
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setError('Artist not found.');
                } else {
                    setError('Failed to load profile.');
                }
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileAndWorks();
    }, [username, isAuthenticated, user]);

    const loadMore = async () => {
        if (loadingMore || !hasMore || !username) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const res = await apiClient.get(`/artworks/artist/${username}?page=${nextPage}&size=10`);
            setArtworks(prev => [...prev, ...res.data.content]);
            setHasMore(!res.data.last);
            setPage(nextPage);
        } catch (err) {
            console.error('Failed to load more works:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!isAuthenticated || !username) return;
        setActionLoading(true);
        try {
            await apiClient.post(`/interactions/follow/${username}`);
            setIsFollowing(prev => !prev);

            // Optimistically update the follower count display
            if (profile) {
                setProfile({
                    ...profile,
                    followerCount: isFollowing ? profile.followerCount - 1 : profile.followerCount + 1
                });
            }
        } catch (err) {
            console.error('Error toggling follow:', err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-neutral-50 text-neutral-600">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex justify-center items-center h-screen bg-neutral-50 text-red-500">
                <p className="text-xl font-light">{error || 'An unexpected error occurred.'}</p>
            </div>
        );
    }

    const isOwnProfile = user?.username === username;

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto pt-10 pb-12 px-4 sm:px-6 lg:px-8">

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 border-b border-neutral-200 pb-12">
                    {/* Avatar Placeholder */}
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden bg-gradient-to-tr from-neutral-100 to-white flex-shrink-0 shadow-xl border-4 border-white hover-glow transition-all duration-500 animate-scale-in">
                        {profile.profilePictureUrl ? (
                            <img src={profile.profilePictureUrl} alt={profile.username} className="w-full h-full object-cover animate-image-reveal" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-5xl md:text-7xl font-light">
                                {profile.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <div className="flex flex-col items-center md:items-start">
                                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-500">
                                    {profile.name || profile.username}
                                </h1>
                                {profile.name && (
                                    <p className="text-neutral-400 font-medium text-lg md:text-xl mt-1">@{profile.username}</p>
                                )}
                            </div>

                            {isOwnProfile ? (
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 shadow-sm hover:shadow-md transition-all duration-300 mx-auto md:mx-0"
                                >
                                    <Edit3 className="w-5 h-5" />
                                    Edit Profile
                                </button>
                            ) : (
                                isAuthenticated && (
                                    <button
                                        onClick={handleFollowToggle}
                                        disabled={actionLoading}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-1
                    ${isFollowing
                                                ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-md'
                                                : 'bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 shadow-sm hover:shadow-md'
                                            } disabled:opacity-50 disabled:cursor-not-allowed mx-auto md:mx-0`}
                                    >
                                        {actionLoading ? (
                                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        ) : isFollowing ? (
                                            <>
                                                <UserCheck className="w-5 h-5" />
                                                Following
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-5 h-5" />
                                                Follow
                                            </>
                                        )}
                                    </button>
                                )
                            )}
                        </div>

                        <p className="text-accent-blue font-bold tracking-widest text-sm uppercase animate-fade-in-up" style={{ animationDelay: '0.2s' }}>{profile.role}</p>

                        <div className="flex gap-6 mt-2 pb-4 text-neutral-600 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-2xl font-bold text-neutral-900">{profile.artworkCount}</span>
                                <span className="text-xs uppercase tracking-wider font-medium">Posts</span>
                            </div>
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-2xl font-bold text-neutral-900">{profile.followerCount}</span>
                                <span className="text-xs uppercase tracking-wider font-medium">Followers</span>
                            </div>
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-2xl font-bold text-neutral-900">{profile.followingCount}</span>
                                <span className="text-xs uppercase tracking-wider font-medium">Following</span>
                            </div>
                        </div>

                        {profile.bio && (
                            <p className="text-neutral-600 max-w-2xl leading-relaxed text-sm md:text-base">
                                {profile.bio}
                            </p>
                        )}
                    </div>
                </div>

                {/* Portfolio Grid */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Portfolio</h2>
                </div>

                {artworks.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 rounded-2xl border border-neutral-200">
                        <p className="text-neutral-500 text-lg">No artworks uploaded yet.</p>
                    </div>
                ) : (
                    <>
                        {/* Custom Masonry Layout using Flexbox */}
                        <div className="flex w-full gap-6">
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
                                <p>You've reached the end of the artist's portfolio.</p>
                            </div>
                        )}
                    </>
                )}

            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentName={profile.name || ''}
                currentBio={profile.bio || ''}
                currentPictureUrl={profile.profilePictureUrl || ''}
                onSuccess={(updatedData) => {
                    setProfile({
                        ...profile,
                        name: updatedData.name,
                        bio: updatedData.bio,
                        profilePictureUrl: updatedData.profilePictureUrl,
                    });
                }}
            />
        </div>
    );
};

export default ArtistProfile;
