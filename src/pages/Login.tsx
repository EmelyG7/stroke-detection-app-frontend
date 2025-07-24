import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import logo from '../assets/logo.svg'; // Replace with your actual logo

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check for remembered credentials on component mount
    useEffect(() => {
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        if (rememberedUsername) {
            setUsername(rememberedUsername);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            toast.error('Please enter both username and password');
            return;
        }

        try {
            await login(username, password);

            // Store username if "Remember me" is checked
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            toast.success('Login successful');

            // Redirect to previous page or dashboard
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (error) {
            toast.error('Login failed: Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-blue-600 p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <img src={logo} alt="Stroke System Logo" className="h-16 w-auto" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Stroke Detection System</h1>
                        <p className="mt-2 text-blue-100">
                            Intelligent Stroke Risk Assessment Platform
                        </p>
                    </div>

                    {/* Login Form */}
                    <div className="p-8">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                    Username
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="username"
                                        required
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <button
                                            type="button"
                                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-5 w-5" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        disabled={loading}
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a
                                        href="#"
                                        className="font-medium text-blue-600 hover:text-blue-500"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toast('Please contact system administrator', {
                                                icon: 'ℹ️',
                                            });
                                        }}
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                                        loading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <LockClosedIcon className="h-5 w-5 mr-2" />
                                            Sign in
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Demo credentials */}
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Demo credentials
                  </span>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => {
                                        setUsername('admin');
                                        setPassword('admin123');
                                    }}
                                    className="text-xs text-center p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                >
                                    <p className="font-medium">Admin</p>
                                    <p className="text-gray-500">admin/admin123</p>
                                </button>
                                <button
                                    onClick={() => {
                                        setUsername('doctor');
                                        setPassword('doctor123');
                                    }}
                                    className="text-xs text-center p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                >
                                    <p className="font-medium">Doctor</p>
                                    <p className="text-gray-500">doctor/doctor123</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} Stroke Detection System. All rights reserved.</p>
                    <p className="mt-1">Version 1.0.0</p>
                </div>
            </div>
        </div>
    );
}