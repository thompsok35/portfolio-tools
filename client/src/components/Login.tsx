import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isRegistering) {
                await apiClient.register(email, password);
                // After successful registration, automatically log in
                const { token, email: userEmail } = await apiClient.login(email, password);
                login(token, userEmail);
            } else {
                const { token, email: userEmail } = await apiClient.login(email, password);
                login(token, userEmail);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-color-background flex items-center justify-center p-4">
            <div className="bg-color-surface rounded-xl shadow-lg border border-slate-200 p-8 max-w-md w-full">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-100 p-3 rounded-full mb-4">
                        <Shield className="h-8 w-8 text-color-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-color-text-main">
                        Income & Expense Planner
                    </h2>
                    <p className="text-color-text-muted mt-2">
                        {isRegistering ? 'Create your secure account' : 'Sign in to access your finances'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-color-text-main mb-1">
                            Email address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-color-primary focus:ring-color-primary sm:text-sm p-2.5 border"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-color-text-main mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-color-primary focus:ring-color-primary sm:text-sm p-2.5 border"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-color-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-primary transition-colors disabled:opacity-70"
                    >
                        {isLoading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError('');
                        }}
                        className="text-color-primary hover:text-blue-700 font-medium"
                    >
                        {isRegistering
                            ? 'Already have an account? Sign in'
                            : "Don't have an account? Register"}
                    </button>
                </div>
            </div>
        </div>
    );
};
