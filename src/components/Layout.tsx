import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const user = authContext?.user;

    useEffect(() => {
        // Redirect to dashboard if authenticated and accessing root
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

    // Check if current route is login page to adjust layout
    const isLoginPage = location.pathname === '/login';

    if (isLoginPage) {
        return <Outlet />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo/Brand */}
                        <div className="flex items-center">
                            <NavLink
                                to="/dashboard"
                                className="flex items-center space-x-2"
                            >
                                <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xl font-bold text-gray-800">StrokeDetect</span>
                            </NavLink>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-4">
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                    }`
                                }
                            >
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/patients"
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                    }`
                                }
                            >
                                Patients
                            </NavLink>
                            <NavLink
                                to="/consultations"
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                    }`
                                }
                            >
                                Consultations
                            </NavLink>
                            {user?.role === 'admin' && (
                                <NavLink
                                    to="/users"
                                    className={({ isActive }) =>
                                        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                        }`
                                    }
                                >
                                    User Management
                                </NavLink>
                            )}
                        </nav>

                        {/* User Profile and Logout */}
                        <div className="flex items-center space-x-4">
                            {user && (
                                <>
                                    <div className="hidden sm:flex items-center space-x-2">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                      {user.username}
                    </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} StrokeDetect. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Privacy Policy</span>
                                Privacy
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Terms</span>
                                Terms
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Contact</span>
                                Contact
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;