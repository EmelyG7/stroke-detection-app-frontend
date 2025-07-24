import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Consultation {
    id: string;
    patient_id: string;
    patient_name: string;
    date: string;
    diagnosis: string;
    probability: number;
    images: {
        id: string;
        filename: string;
        diagnosis: string;
        confidence: number;
        probability: number;
        url: string;
    }[];
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Consultations = () => {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConsultations = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<ApiResponse<Consultation[]>>(`${API_BASE_URL}/consultations/`);

                if (response.data.success) {
                    setConsultations(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch consultations');
                    toast.error(response.data.message || 'Error loading consultations');
                }
            } catch (error) {
                const errorMessage = axios.isAxiosError(error)
                    ? error.response?.data?.message || error.response?.data?.error || error.message
                    : 'Failed to fetch consultations';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchConsultations();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this consultation?')) return;

        try {
            const response = await axios.delete<ApiResponse<null>>(`${API_BASE_URL}/consultations/${id}`);

            if (response.data.success) {
                setConsultations(consultations.filter(c => c.id !== id));
                toast.success('Consultation deleted successfully');
            } else {
                toast.error(response.data.message || 'Failed to delete consultation');
            }
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || error.response?.data?.error || error.message
                : 'Failed to delete consultation';
            toast.error(errorMessage);
        }
    };

    if (loading) return <div className="text-center py-4">Loading consultations...</div>;
    if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Consultations</h2>
                <Link
                    to="/consultations/new"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                >
                    New Consultation
                </Link>
            </div>

            {consultations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No consultations found
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Probability</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {consultations.map(consultation => (
                            <tr key={consultation.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link
                                        to={`/patients/${consultation.patient_id}`}
                                        className="text-blue-500 hover:underline"
                                    >
                                        {consultation.patient_name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(consultation.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            consultation.diagnosis === 'Stroke'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {consultation.diagnosis}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {(consultation.probability * 100).toFixed(2)}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                    <Link
                                        to={`/consultations/${consultation.id}`}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        View
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(consultation.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Consultations;