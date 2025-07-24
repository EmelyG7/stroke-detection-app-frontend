import { useEffect, useState } from 'react';
import axios from 'axios';
import type {DashboardStats} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
                setStats(response.data);
            } catch (error) {
                setError('Failed to load dashboard stats. Please try again.');
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center py-4">Loading...</div>;
    if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-bold">Total Patients</h2>
                <p>{stats.totalPatients}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-bold">Total Consultations</h2>
                <p>{stats.totalConsultations}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-bold">Stroke Rate</h2>
                <p>{stats.strokeRate}%</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-bold">Recent Consultations</h2>
                <ul>
                    {stats.recentConsultations.map(consult => (
                        <li key={consult._id}>
                            {consult.patient_name} - {consult.diagnosis} ({consult.probability.toFixed(2)})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;