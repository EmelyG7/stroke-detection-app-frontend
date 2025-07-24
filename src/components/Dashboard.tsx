import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import type { DashboardStats } from '../types';
import {
    UserIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    HeartIcon
} from '@heroicons/react/24/outline';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

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

    // Process data for charts
    const consultationTrendsData = {
        labels: stats?.monthlyStats.map(item => item.year_month) || [],
        datasets: [
            {
                label: 'Consultations',
                data: stats?.monthlyStats.map(item => item.stroke_count) || [],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
            },
        ],
    };

    const strokeProbabilityTrendData = {
        labels: stats?.monthlyStats.map(item => item.year_month) || [],
        datasets: [
            {
                label: 'Stroke Probability (%)',
                data: stats?.monthlyStats.map(item => item.avg_probability) || [],
                fill: false,
                backgroundColor: 'rgba(139, 92, 246, 0.5)',
                borderColor: 'rgba(139, 92, 246, 1)',
                tension: 0.1,
            },
        ],
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Patients</p>
                            <p className="text-3xl font-semibold text-gray-800">{stats.totalPatients}</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <UserIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">All registered patients</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Consultations</p>
                            <p className="text-3xl font-semibold text-gray-800">{stats.totalConsultations}</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <DocumentTextIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">All completed consultations</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Stroke Rate</p>
                            <p className="text-3xl font-semibold text-gray-800">{stats.strokeRate}%</p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                            <ExclamationTriangleIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Average probability: {stats.avgStrokeProbability}%</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">High Risk Age</p>
                            <p className="text-3xl font-semibold text-gray-800">{stats.riskAgeRange}</p>
                        </div>
                        <div className="p-3 rounded-full bg-red-100 text-red-600">
                            <HeartIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Average stroke age: {stats.avgStrokeAge}</p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Consultations</h2>
                    <div className="h-64">
                        <Bar
                            data={consultationTrendsData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                return `${context.dataset.label}: ${context.raw}`;
                                            }
                                        }
                                    }
                                },
                            }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Stroke Probability Trend</h2>
                    <div className="h-64">
                        <Line
                            data={strokeProbabilityTrendData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 100,
                                        ticks: {
                                            callback: function(value) {
                                                return value + '%';
                                            },
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Consultations */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Consultations</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {stats.recentConsultations.map((consultation) => (
                            <tr key={consultation._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            {consultation.patient_name?.charAt(0) || '?'}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {consultation.patient_name || 'Unknown Patient'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {consultation.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        consultation.diagnosis === 'Stroke'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                    }`}>
                      {consultation.diagnosis}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${
                                                    consultation.probability > 70
                                                        ? 'bg-red-600'
                                                        : consultation.probability > 30
                                                            ? 'bg-yellow-500'
                                                            : 'bg-green-500'
                                                }`}
                                                style={{ width: `${consultation.probability}%` }}
                                            ></div>
                                        </div>
                                        <span className="ml-2 text-sm font-medium text-gray-700">
                        {consultation.probability.toFixed(1)}%
                      </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;