import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type {Consultation, Patient} from '../types';
import {
    DocumentTextIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ConsultationWithPatient extends Consultation {
    patient: Patient;
}

const Consultations = () => {
    const [consultations, setConsultations] = useState<ConsultationWithPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConsultations = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<ConsultationWithPatient[]>(
                    `${API_BASE_URL}/consultations/`
                );
                setConsultations(response.data);
            } catch (error) {
                const errorMessage = axios.isAxiosError(error)
                    ? error.response?.data?.message || error.message
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
            await axios.delete(`${API_BASE_URL}/consultations/${id}`);
            setConsultations(consultations.filter(c => c.id !== id));
            toast.success('Consultation deleted successfully');
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'Failed to delete consultation';
            toast.error(errorMessage);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-center">
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Consultations</h1>
                <Link
                    to="/consultations/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    New Consultation
                </Link>
            </div>

            {consultations.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">No consultations found</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Factors</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {consultations.map(consultation => (
                                <tr key={consultation.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                {consultation.patient.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <Link
                                                    to={`/patients/${consultation.patient.id}`}
                                                    className="text-blue-600 hover:underline font-medium"
                                                >
                                                    {consultation.patient.name}
                                                </Link>
                                                <div className="text-sm text-gray-500">
                                                    {consultation.patient.age} years · {consultation.patient.gender}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {consultation.patient.hypertension && (
                                                <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">HTN</span>
                                            )}
                                            {consultation.patient.diabetes && (
                                                <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">DM</span>
                                            )}
                                            {consultation.patient.heart_disease && (
                                                <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">CVD</span>
                                            )}
                                            {consultation.patient.smoker && (
                                                <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-800">Smoker</span>
                                            )}
                                            {consultation.patient.alcoholic && (
                                                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">Alcoholic</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Link
                                                to={`/consultations/${consultation.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                to={`/consultations/${consultation.id}/edit`}
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(consultation.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Consultations;