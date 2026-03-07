import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brush, LogOut, PlusSquare, Heart, Bell } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 border-b border-neutral-200/50 glass-panel animate-fade-in-up bg-white/90 backdrop-blur-md">
            <Link to="/" className="flex items-center gap-3 cursor-pointer group">
                <Brush className="text-accent-blue group-hover:-rotate-12 transition-transform duration-300" />
                <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent-blue to-accent-teal">artTrident</span>
            </Link>

            <div className="flex items-center gap-3 md:gap-6">

                <Link to="/saved" className="text-neutral-500 hover:text-accent-blue transition-colors flex items-center gap-1.5 font-bold text-sm bg-neutral-50 hover:bg-accent-blue/5 px-3 md:px-4 py-2 rounded-lg border border-neutral-200/50">
                    <Heart size={18} className="text-red-400" />
                    <span className="hidden sm:inline">Saved</span>
                </Link>

                {user?.role === 'ARTIST' && (
                    <>
                        <Link to="/activities" className="text-neutral-500 hover:text-accent-blue transition-colors flex items-center gap-1.5 font-bold text-sm bg-neutral-50 hover:bg-accent-blue/5 px-3 md:px-4 py-2 rounded-lg border border-neutral-200/50">
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

                <div className="hidden md:flex items-center pl-6 ml-2 border-l border-neutral-200">
                    <span className="text-sm text-neutral-500 font-bold">
                        {user?.username} <span className="text-neutral-300 px-1 font-normal">•</span> <span className="text-xs uppercase tracking-wider text-neutral-400">{user?.role}</span>
                    </span>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 p-2 ml-2 text-neutral-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100"
                    title="Sign Out"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </nav>
    );
}
