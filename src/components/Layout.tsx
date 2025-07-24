import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();
    const user = authContext?.user;

    useEffect(() => {
        // Redirigir al dashboard si el usuario está autenticado y accede a la raíz
        if (user && window.location.pathname === '/') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        authContext?.logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-blue-600 text-white p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">
                        <NavLink to="/dashboard">Stroke Detection</NavLink>
                    </h1>
                    <div className="space-x-4 flex items-center">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `px-3 py-1 rounded transition ${isActive ? "bg-blue-700" : "hover:bg-blue-500"}`
                            }
                        >
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/patients"
                            className={({ isActive }) =>
                                `px-3 py-1 rounded transition ${isActive ? "bg-blue-700" : "hover:bg-blue-500"}`
                            }
                        >
                            Patients
                        </NavLink>
                        <NavLink
                            to="/consultations"
                            className={({ isActive }) =>
                                `px-3 py-1 rounded transition ${isActive ? "bg-blue-700" : "hover:bg-blue-500"}`
                            }
                        >
                            Consultations
                        </NavLink>
                        {user?.role === 'admin' && (
                            <NavLink
                                to="/users"
                                className={({ isActive }) =>
                                    `px-3 py-1 rounded transition ${isActive ? "bg-blue-700" : "hover:bg-blue-500"}`
                                }
                            >
                                Users
                            </NavLink>
                        )}
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
            <div className="container mx-auto p-4">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;