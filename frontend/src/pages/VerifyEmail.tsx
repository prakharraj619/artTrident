import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email address...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided. The link may be broken.');
            return;
        }

        const verifyToken = async () => {
            try {
                // Wait briefly for a smooth UX animation
                await new Promise(resolve => setTimeout(resolve, 800));
                await apiClient.get(`/auth/verify?token=${token}`);
                setStatus('success');
                setMessage('Your email has been successfully verified! Welcome to artTrident.');
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. The link may have expired or is invalid.');
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
            <div className="w-full max-w-md p-8 rounded-2xl glass-panel shadow-xl text-center animate-fade-in-up">
                
                <div className="flex justify-center mb-6">
                    {status === 'loading' && (
                        <Loader2 className="animate-spin text-accent-teal" size={48} />
                    )}
                    {status === 'success' && (
                        <CheckCircle className="text-green-500" size={48} />
                    )}
                    {status === 'error' && (
                        <XCircle className="text-red-500" size={48} />
                    )}
                </div>

                <h2 className="text-3xl font-extrabold mb-4 text-neutral-900 tracking-tight">
                    {status === 'loading' ? 'Verifying...' : 
                     status === 'success' ? 'Verified!' : 'Verification Failed'}
                </h2>
                
                <p className="text-neutral-600 mb-8 font-medium px-4">
                    {message}
                </p>

                {status !== 'loading' && (
                    <div className="flex flex-col space-y-4">
                        {status === 'success' ? (
                            <Link 
                                to="/login" 
                                className="w-full py-3 bg-accent-teal text-white font-bold rounded-lg hover:bg-accent-teal/90 shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Continue to Login
                            </Link>
                        ) : (
                            <Link 
                                to="/register" 
                                className="w-full py-3 bg-neutral-800 text-white font-bold rounded-lg hover:bg-neutral-900 shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Back to Registration
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
