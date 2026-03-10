import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Brush } from 'lucide-react';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('ARTIST');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const response = await apiClient.post('/auth/register', { username, email, password, role });
            
            if (response.data.token === 'VERIFICATION_REQUIRED') {
                setSuccessMessage('Account created! Please check your email to verify your account.');
                // Clear form
                setUsername('');
                setEmail('');
                setPassword('');
            } else {
                login(response.data.token);
                navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register. Please try another email or username.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-900 p-4">
            <div className="w-full max-w-md p-8 rounded-2xl glass-panel shadow-xl animate-fade-in-up mt-8 mb-8">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-accent-teal/10 rounded-full text-accent-teal">
                        <Brush size={32} />
                    </div>
                </div>
                <h2 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-neutral-900">Join artTrident</h2>
                <p className="text-center text-neutral-500 font-medium mb-8">The artist-first social network</p>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center font-bold shadow-sm">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-1">I want to join as a:</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal text-neutral-900 shadow-sm transition-colors"
                        >
                            <option value="ARTIST">Visual Artist</option>
                            <option value="COLLECTOR">Collector</option>
                            <option value="VIEWER">General Viewer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal text-neutral-900 placeholder-neutral-400 shadow-sm transition-colors"
                            placeholder="artbyjohn"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal text-neutral-900 placeholder-neutral-400 shadow-sm transition-colors"
                            placeholder="artist@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal text-neutral-900 placeholder-neutral-400 shadow-sm transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 mt-4 bg-accent-teal text-white font-bold rounded-lg hover:bg-accent-teal/90 shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50 transform hover:-translate-y-0.5"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-6 text-center text-neutral-600">
                    Already have an account? <Link to="/login" className="font-bold text-neutral-900 hover:underline transition-colors hover:text-accent-teal">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
