import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    UserIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    HeartIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import logo from '../assets/logo.svg';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface User {
    id: string;
    username: string;
    full_name: string;
    role: string;
}

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [, setUsers] = useState<User[]>([]);
    const [, setLoadingUsers] = useState(false);
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        if (rememberedUsername) {
            setUsername(rememberedUsername);
            setRememberMe(true);
        }

        // Cargar usuarios disponibles para mostrar opciones
        loadAvailableUsers();
    }, []);

    // Función loadAvailableUsers actualizada
    const loadAvailableUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/users`);
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.log('No se pudieron cargar los usuarios (esto es normal si no hay conexión)');
            // Puedes agregar usuarios mock aquí si falla la conexión
            setUsers([
                {
                    id: 'mock-admin-id',
                    username: 'admin',
                    full_name: 'Administrador Sistema',
                    role: 'admin'
                },
                {
                    id: 'mock-doctor-id',
                    username: 'doctor',
                    full_name: 'Doctor Sistema',
                    role: 'doctor'
                }
            ]);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            toast.error('Please enter both username and password');
            return;
        }

        try {
            await login(username, password);

            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            toast.success('Login successful');
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Login failed: Invalid credentials');
        }
    };
    return (
        <div className="fixed inset-0 flex bg-gradient-to-br from-blue-50 to-indigo-50 overflow-auto">
            {/* Panel izquierdo - Información */}
            <div className="hidden lg:flex lg:w-1/2 h-full bg-gradient-to-br from-blue-600 to-indigo-700 overflow-auto">
                <div className="flex flex-col justify-center px-8 py-12 w-full h-full min-h-[600px]">
                    <div className="max-w-lg mx-auto w-full space-y-8 h-full flex flex-col justify-center">
                        <div className="flex justify-center">
                            <img src={logo} alt="Stroke System Logo" className="h-28 w-auto" />
                        </div>

                        <div className="text-center space-y-4">
                            <h1 className="text-4xl font-bold text-white leading-tight">
                                Stroke Detection <span className="text-blue-200">System</span>
                            </h1>
                            <p className="text-blue-100 text-xl leading-relaxed">
                                Advanced AI-powered platform for stroke risk assessment
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-start space-x-4 p-4 bg-blue-500/20 rounded-xl backdrop-blur-sm">
                                <ShieldCheckIcon className="h-8 w-8 text-blue-200 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Secure Platform</h3>
                                    <p className="text-blue-100">HIPAA compliant data protection</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4 p-4 bg-blue-500/20 rounded-xl backdrop-blur-sm">
                                <ChartBarIcon className="h-8 w-8 text-blue-200 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Real-time Analytics</h3>
                                    <p className="text-blue-100">Instant risk assessment results</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4 p-4 bg-blue-500/20 rounded-xl backdrop-blur-sm">
                                <HeartIcon className="h-8 w-8 text-blue-200 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Patient Focused</h3>
                                    <p className="text-blue-100">Personalized care plans</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel derecho - Formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 h-full overflow-auto">
                <div className="w-full max-w-md mx-auto my-auto">
                    <div className="text-center lg:hidden mb-8">
                        <img src={logo} alt="Logo" className="h-20 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-gray-800">Stroke Detection</h2>
                        <p className="mt-2 text-gray-600">Sign in to your account</p>
                    </div>

                    <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl border border-gray-100">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                            <p className="mt-3 text-gray-600 text-lg">Please enter your credentials</p>
                        </div>

                        <form className="space-y-7" onSubmit={handleSubmit}>
                            {/* Campo de Usuario */}
                            <div className="space-y-3">
                                <label htmlFor="username" className="block text-base font-medium text-gray-700">
                                    Username
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <UserIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="username"
                                        required
                                        className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 text-lg placeholder-gray-400"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Campo de Contraseña */}
                            <div className="space-y-3">
                                <label htmlFor="password" className="block text-base font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 text-lg placeholder-gray-400"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                        <button
                                            type="button"
                                            className="text-gray-400 hover:text-gray-500 focus:outline-none p-2 rounded-full hover:bg-gray-100"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-6 w-6" />
                                            ) : (
                                                <EyeIcon className="h-6 w-6" />
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
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        disabled={loading}
                                    />
                                    <label htmlFor="remember-me" className="ml-3 block text-base text-gray-700">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-base">
                                    <a
                                        href="#"
                                        className="font-medium text-blue-600 hover:text-blue-500"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toast('Please contact your system administrator', {
                                                icon: 'ℹ️',
                                            });
                                        }}
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                            </div>

                            {/* Botón de Login */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                                        loading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
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
                                            <LockClosedIcon className="h-6 w-6 mr-3" />
                                            Sign in
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                    </div>

                    <div className="text-center text-sm text-gray-400 mt-8">
                        <p>© {new Date().getFullYear()} Stroke Detection System. v1.0.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
}