import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brush, LogOut, PlusSquare, Heart, Bell, MessageSquare, Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';

interface UserSummary {
    id: number;
    username: string;
    profilePictureUrl: string | null;
    role: string;
}

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search — waits 300ms after the user stops typing before hitting the API
    // This avoids firing a request on every single keypress
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setSearchQuery(q);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (!q.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        debounceTimer.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await apiClient.get<UserSummary[]>(`/users/search?q=${encodeURIComponent(q)}`);
                setSearchResults(res.data);
                setShowDropdown(true);
            } catch (err) {
                console.error('Search failed', err);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    };

    const handleSelectUser = (username: string) => {
        navigate(`/artist/${username}`);
        setSearchQuery('');
        setSearchResults([]);
        setShowDropdown(false);
    };

    return (
        <nav className="sticky top-0 z-50 flex justify-between items-center px-6 py-3 border-b border-neutral-200/50 glass-panel animate-fade-in-up bg-white/90 backdrop-blur-md gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 cursor-pointer group flex-shrink-0">
                <Brush className="text-accent-blue group-hover:-rotate-12 transition-transform duration-300" />
                <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent-blue to-accent-teal">artTrident</span>
            </Link>

            {/* ── Global Search Bar ────────────────────────────── */}
            <div ref={searchRef} className="relative flex-1 max-w-sm">
                <div className={`flex items-center gap-2 bg-neutral-50 border rounded-xl px-3 py-2 transition-all
                    ${showDropdown || searchQuery ? 'border-sky-400 ring-2 ring-sky-100' : 'border-neutral-200'}`}>
                    <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <input
                        id="global-search"
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                        placeholder="Search artists..."
                        className="flex-1 bg-transparent text-sm outline-none text-neutral-800 placeholder:text-neutral-400"
                    />
                    {searchQuery && (
                        <button onClick={() => { setSearchQuery(''); setSearchResults([]); setShowDropdown(false); }}>
                            <X className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-700 transition-colors" />
                        </button>
                    )}
                    {isSearching && <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />}
                </div>

                {/* Search Results Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-scale-in">
                        {searchResults.slice(0, 8).map(result => (
                            <button
                                key={result.id}
                                id={`search-result-${result.id}`}
                                onClick={() => handleSelectUser(result.username)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left border-b border-neutral-50 last:border-0"
                            >
                                {result.profilePictureUrl ? (
                                    <img src={result.profilePictureUrl} alt={result.username}
                                        className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                        {result.username.slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-neutral-900">{result.username}</p>
                                    <p className="text-xs text-neutral-400 capitalize">{result.role.toLowerCase()}</p>
                                </div>
                            </button>
                        ))}
                        {searchResults.length === 0 && (
                            <p className="px-4 py-3 text-sm text-neutral-400">No users found for "{searchQuery}"</p>
                        )}
                    </div>
                )}

                {/* No results state */}
                {showDropdown && searchQuery && !isSearching && searchResults.length === 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white border border-neutral-200 rounded-2xl shadow-xl p-4 z-50">
                        <p className="text-sm text-neutral-400 text-center">No artists found for "{searchQuery}"</p>
                    </div>
                )}
            </div>

            {/* ── Nav Links ───────────────────────────────────── */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                <Link to="/saved" className="text-neutral-500 hover:text-accent-blue transition-colors flex items-center gap-1.5 font-bold text-sm bg-neutral-50 hover:bg-accent-blue/5 px-3 py-2 rounded-lg border border-neutral-200/50">
                    <Heart size={18} className="text-red-400" />
                    <span className="hidden sm:inline">Saved</span>
                </Link>

                <Link to="/messages" className="text-neutral-500 hover:text-accent-blue transition-colors flex items-center gap-1.5 font-bold text-sm bg-neutral-50 hover:bg-accent-blue/5 px-3 py-2 rounded-lg border border-neutral-200/50">
                    <MessageSquare size={18} className="text-sky-500" />
                    <span className="hidden sm:inline">Messages</span>
                </Link>

                {user?.role === 'ARTIST' && (
                    <>
                        <Link to="/activities" className="text-neutral-500 hover:text-accent-blue transition-colors flex items-center gap-1.5 font-bold text-sm bg-neutral-50 hover:bg-accent-blue/5 px-3 py-2 rounded-lg border border-neutral-200/50">
                            <Bell size={18} className="text-accent-teal" />
                            <span className="hidden sm:inline">Activity</span>
                        </Link>
                        <button
                            onClick={() => navigate('/upload')}
                            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-teal text-white hover:opacity-90 rounded-lg transition-all font-bold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            <PlusSquare size={18} />
                            <span className="hidden sm:inline">Upload</span>
                        </button>
                    </>
                )}

                <div className="hidden md:flex items-center pl-4 ml-1 border-l border-neutral-200">
                    <span className="text-sm text-neutral-500 font-bold">
                        {user?.username} <span className="text-neutral-300 px-1 font-normal">•</span> <span className="text-xs uppercase tracking-wider text-neutral-400">{user?.role}</span>
                    </span>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 p-2 ml-1 text-neutral-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100"
                    title="Sign Out"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </nav>
    );
}
