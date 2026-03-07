import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Bell, UserPlus, Heart, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Activity {
    id: string; // The backend uses UUID strings for the ActivityResponse DTO ID
    type: 'FOLLOW' | 'SAVE';
    actorUsername: string;
    actorProfileUrl: string | null;
    targetName: string | null;
    targetImageUrl: string | null;
    timestamp: string;
}

export default function ActivityFeed() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'ARTIST') {
            navigate('/');
            return;
        }

        const fetchActivities = async () => {
            try {
                const response = await apiClient.get('/interactions/activities');
                setActivities(response.data);
            } catch (error) {
                console.error("Failed to fetch activities", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [user, navigate]);

    if (user && user.role !== 'ARTIST') {
        return null; // Don't render anything while redirecting
    }

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-accent-blue/20">
            <Navbar />

            <main className="max-w-3xl mx-auto px-6 py-8">
                <div className="mb-8 animate-fade-in-up flex items-center gap-3">
                    <div className="p-3 bg-accent-blue/10 text-accent-blue rounded-xl shadow-sm">
                        <Bell className="fill-current w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 tracking-tight">
                            Activity
                        </h1>
                        <p className="text-neutral-500 mt-1 text-base font-light">See how collectors are interacting with your art.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-accent-blue w-8 h-8" />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-20 border border-neutral-200 rounded-2xl bg-white/50 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <Bell className="mx-auto text-neutral-300 mb-4 w-12 h-12" />
                        <h2 className="text-xl font-semibold text-neutral-900">No activity yet</h2>
                        <p className="text-neutral-500 mt-2">Publish more art or build your audience to see interactions here.</p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        {activities.map((activity, index) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-4 p-5 bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {/* Actor Avatar */}
                                <div className="flex-shrink-0 relative">
                                    {activity.actorProfileUrl ? (
                                        <img
                                            src={activity.actorProfileUrl}
                                            alt={activity.actorUsername}
                                            className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-blue/20 to-accent-teal/20 flex items-center justify-center border border-accent-blue/10">
                                            <span className="text-lg font-bold text-accent-blue">
                                                {activity.actorUsername ? activity.actorUsername.charAt(0).toUpperCase() : '?'}
                                            </span>
                                        </div>
                                    )}
                                    {/* Icon Badge */}
                                    <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm border border-neutral-100">
                                        {activity.type === 'FOLLOW' ? (
                                            <UserPlus className="w-3.5 h-3.5 text-accent-blue" />
                                        ) : (
                                            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <p className="text-neutral-900 text-sm">
                                        <span className="font-bold">{activity.actorUsername}</span>
                                        {activity.type === 'FOLLOW' ? (
                                            <span className="text-neutral-600"> started following you</span>
                                        ) : (
                                            <span className="text-neutral-600"> saved your artwork <span className="font-semibold text-neutral-800">"{activity.targetName}"</span></span>
                                        )}
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-1 font-medium">
                                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                    </p>
                                </div>

                                {/* Target Image (if applicable) */}
                                {activity.type === 'SAVE' && activity.targetImageUrl && (
                                    <div className="flex-shrink-0 ml-4 hidden sm:block">
                                        <img
                                            src={activity.targetImageUrl}
                                            alt={activity.targetName || 'Artwork'}
                                            className="w-14 h-14 rounded-lg object-cover border border-neutral-200 shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
