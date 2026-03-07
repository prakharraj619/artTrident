import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Brush } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiClient.post('/auth/authenticate', { email, password });
            login(response.data.token);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-900 p-4">
            <div className="w-full max-w-md p-8 rounded-2xl glass-panel shadow-xl animate-fade-in-up">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-accent-blue/10 rounded-full text-accent-blue">
                        <Brush size={32} />
                    </div>
                </div>
                <h2 className="text-3xl font-extrabold text-center mb-8 tracking-tight text-neutral-900">Welcome Back</h2>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-neutral-200 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue text-neutral-900 placeholder-neutral-400 transition-colors"
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
                            className="w-full px-4 py-3 bg-white border border-neutral-200 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue text-neutral-900 placeholder-neutral-400 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 mt-4 bg-accent-blue text-white font-bold rounded-lg hover:bg-accent-blue/90 shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50 transform hover:-translate-y-0.5"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-6 text-center text-neutral-600">
                    Don't have an account? <Link to="/register" className="font-bold text-neutral-900 hover:underline transition-colors hover:text-accent-blue">Apply here</Link>
                </p>
            </div>
        </div>
    );
}
