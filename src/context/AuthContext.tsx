import { createContext, useState, type ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: { id: string; username: string; fullName: string; role: string } | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<{
        id: string;
        username: string;
        fullName: string;
        role: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const login = async (username: string, password: string) => {
        setLoading(true);
        try {
            // Mock credentials check
            if (
                (username === 'admin' && password === 'admin123') ||
                (username === 'doctor' && password === 'doctor123')
            ) {
                const mockUser = {
                    id: username === 'admin' ? 'mock-admin-id' : 'mock-doctor-id',
                    username,
                    fullName: username === 'admin' ? 'Administrador Sistema' : 'Doctor Sistema',
                    role: username === 'admin' ? 'admin' : 'doctor',
                };
                setUser(mockUser);
                navigate('/dashboard');
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            throw new Error('Login failed: Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};