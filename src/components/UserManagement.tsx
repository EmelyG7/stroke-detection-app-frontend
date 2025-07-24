import { useEffect, useState } from 'react';
import axios from 'axios';
import type {User} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [newUser, setNewUser] = useState({ username: '', full_name: '', role: '' });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users`);
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/users`, newUser);
            setUsers([...users, response.data]);
            setNewUser({ username: '', full_name: '', role: '' });
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <form onSubmit={handleSubmit} className="mb-4">
                <input
                    type="text"
                    value={newUser.username}
                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="Username"
                    className="border p-2 mr-2"
                />
                <input
                    type="text"
                    value={newUser.full_name}
                    onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                    placeholder="Full Name"
                    className="border p-2 mr-2"
                />
                <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    className="border p-2 mr-2"
                >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                </select>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add User</button>
            </form>
            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.username} - {user.full_name} ({user.role})</li>
                ))}
            </ul>
        </div>
    );
};

export default UserManagement;