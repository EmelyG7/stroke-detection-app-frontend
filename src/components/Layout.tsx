import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {useContext, useEffect, useState} from 'react';
import { AuthContext } from '../context/AuthContext';
import {Bars3Icon, LockClosedIcon, XMarkIcon, ChevronDownIcon} from '@heroicons/react/24/outline';

const Layout = () => {
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const user = authContext?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => {
        if (user && location.pathname === '/') {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate, location]);

    const handleLogout = async () => {
        try {
            await authContext?.logout();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const isLoginPage = location.pathname === '/login';

    if (isLoginPage) {
        return <Outlet />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header - Full width */}
            <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
                <div className="w-full px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20 mx-auto" style={{ maxWidth: '1920px' }}>
                        {/* Logo/Brand and Mobile Menu Button */}
                        <div className="flex items-center space-x-8">
                            <button
                                type="button"
                                className="md:hidden text-gray-500 hover:text-gray-600"
                                onClick={() => setMobileMenuOpen(true)}
                            >
                                <Bars3Icon className="h-7 w-7" />
                                <span className="sr-only">Open menu</span>
                            </button>
                            <NavLink
                                to="/dashboard"
                                className="flex items-center space-x-3 group"
                            >
                                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600 group-hover:bg-blue-700 transition-colors">
                                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-2xl font-bold text-gray-800 hidden sm:inline">StrokeDetect</span>
                            </NavLink>
                        </div>

                        {/* Desktop Navigation - Centered */}
                        <nav className="hidden md:flex items-center space-x-1">
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) =>
                                    `px-4 py-2.5 rounded-lg text-base font-medium transition-all ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                    }`
                                }
                            >
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/patients"
                                className={({ isActive }) =>
                                    `px-4 py-2.5 rounded-lg text-base font-medium transition-all ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                    }`
                                }
                            >
                                Patients
                            </NavLink>
                            <NavLink
                                to="/consultations"
                                className={({ isActive }) =>
                                    `px-4 py-2.5 rounded-lg text-base font-medium transition-all ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                    }`
                                }
                            >
                                Consultations
                            </NavLink>
                            {user?.role === 'admin' && (
                                <NavLink
                                    to="/users"
                                    className={({ isActive }) =>
                                        `px-4 py-2.5 rounded-lg text-base font-medium transition-all ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                        }`
                                    }
                                >
                                    User Management
                                </NavLink>
                            )}
                        </nav>

                        {/* User Profile and Logout */}
                        <div className="flex items-center space-x-6">
                            {user && (
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center space-x-2 focus:outline-none group"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                                            <span className="text-lg font-semibold text-white">
                                                {user.username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="hidden lg:flex flex-col items-start">
                                            <span className="text-sm font-medium text-gray-700">
                                                {user.username}
                                            </span>
                                            <span className="text-xs text-gray-500 capitalize">
                                                {user.role}
                                            </span>
                                        </div>
                                        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${userMenuOpen ? 'transform rotate-180' : ''}`} />
                                    </button>

                                    {/* User Dropdown Menu */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                                            <div className="py-1">
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm font-medium text-gray-900">Signed in as</p>
                                                    <p className="text-sm text-gray-500 truncate">{user.username}</p>
                                                </div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center"
                                                >
                                                    <LockClosedIcon className="h-5 w-5 mr-2" />
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 z-30 bg-gray-900 bg-opacity-50 transition-opacity duration-300 ease-in-out ${
                mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}>
                <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-all duration-300 ease-in-out ${
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-800">StrokeDetect</span>
                        </div>
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-600"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <XMarkIcon className="h-7 w-7" />
                            <span className="sr-only">Close menu</span>
                        </button>
                    </div>
                    <nav className="p-4 space-y-1">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                }`
                            }
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/patients"
                            className={({ isActive }) =>
                                `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                }`
                            }
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Patients
                        </NavLink>
                        <NavLink
                            to="/consultations"
                            className={({ isActive }) =>
                                `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                }`
                            }
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Consultations
                        </NavLink>
                        {user?.role === 'admin' && (
                            <NavLink
                                to="/users"
                                className={({ isActive }) =>
                                    `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                    }`
                                }
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                User Management
                            </NavLink>
                        )}
                    </nav>
                    <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                                <span className="text-lg font-semibold text-white">
                                    {user?.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <LockClosedIcon className="h-5 w-5 mr-2" />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content - Full width with max-width */}
            <main className="flex-grow w-full px-6 lg:px-8 py-8 mx-auto" style={{ maxWidth: '1920px' }}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[calc(100vh-11rem)] p-6 sm:p-8">
                    <Outlet />
                </div>
            </main>

            {/* Footer - Full width */}
            <footer className="bg-white border-t border-gray-200">
                <div className="w-full px-6 lg:px-8 py-6 mx-auto" style={{ maxWidth: '1920px' }}>
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-500 text-center md:text-left">
                            © {new Date().getFullYear()} StrokeDetect System. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                Terms of Service
                            </a>
                            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;