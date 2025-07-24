import { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import type { Patient } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

type PatientFormData = {
    name: string;
    age: number;
    gender: string;
};

const Patients = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<PatientFormData>();

    // Fetch patients on component mount
    useEffect(() => {
        const fetchPatients = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get<ApiResponse<Patient[]>>(`${API_BASE_URL}/patients/`);
                if (response.data.success) {
                    setPatients(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch patients');
                }
            } catch (err) {
                setError(axios.isAxiosError(err)
                    ? err.response?.data?.error || err.message
                    : 'Unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatients();
    }, []);

    // Handle form submission
    const onSubmit = async (formData: PatientFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            if (editingPatient) {
                // Update existing patient
                const response = await axios.put<ApiResponse<Patient>>(
                    `${API_BASE_URL}/patients/${editingPatient.id}/`,
                    formData
                );

                if (response.data.success) {
                    setPatients(patients.map(p =>
                        p.id === editingPatient.id ? response.data.data : p
                    ))
                    resetForm();
                } else {
                    setError(response.data.message || 'Failed to update patient');
                }
            } else {
                // Create new patient
                const response = await axios.post<ApiResponse<Patient>>(
                    `${API_BASE_URL}/patients/`,
                    formData
                );

                if (response.data.success) {
                    setPatients([...patients, response.data.data]);
                    resetForm();
                } else {
                    setError(response.data.message || 'Failed to create patient');
                }
            }
        } catch (err) {
            setError(axios.isAxiosError(err)
                ? err.response?.data?.error || err.message
                : 'Unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle patient edit
    const handleEdit = (patient: Patient) => {
        setEditingPatient(patient);
        setValue('name', patient.name);
        setValue('age', patient.age);
        setValue('gender', patient.gender);
    };

    // Handle patient deletion
    const handleDelete = async (id: string) => {
        if (!id || !window.confirm('Are you sure you want to delete this patient?')) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.delete<ApiResponse<null>>(
                `${API_BASE_URL}/patients/${id}/`
            );

            if (response.data.success) {
                setPatients(patients.filter(p => p.id !== id));
            } else {
                setError(response.data.message || 'Failed to delete patient');
            }
        } catch (err) {
            setError(axios.isAxiosError(err)
                ? err.response?.data?.error || err.message
                : 'Unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form and editing state
    const resetForm = () => {
        reset();
        setEditingPatient(null);
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">
                {editingPatient ? 'Edit Patient' : 'Add New Patient'}
            </h2>

            {/* Error message */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Patient Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mb-8 bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            {...register('name', {
                                required: 'Name is required',
                                minLength: {
                                    value: 2,
                                    message: 'Name must be at least 2 characters'
                                }
                            })}
                            className="w-full p-2 border rounded"
                            disabled={isLoading}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Age</label>
                        <input
                            type="number"
                            {...register('age', {
                                required: 'Age is required',
                                min: {
                                    value: 0,
                                    message: 'Age must be positive'
                                },
                                max: {
                                    value: 120,
                                    message: 'Age must be less than 120'
                                }
                            })}
                            className="w-full p-2 border rounded"
                            disabled={isLoading}
                        />
                        {errors.age && (
                            <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Gender</label>
                        <select
                            {...register('gender', { required: 'Gender is required' })}
                            className="w-full p-2 border rounded"
                            disabled={isLoading}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Unknown">Prefer not to say</option>
                        </select>
                        {errors.gender && (
                            <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : editingPatient ? 'Update Patient' : 'Add Patient'}
                    </button>

                    {editingPatient && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Patients List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Patient List</h3>

                {isLoading && !patients.length ? (
                    <p>Loading patients...</p>
                ) : patients.length === 0 ? (
                    <p>No patients found</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {patients.map(patient => (
                                <tr key={patient.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{patient.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{patient.age}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{patient.gender}</td>
                                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                        <button
                                            onClick={() => handleEdit(patient)}
                                            className="text-blue-600 hover:text-blue-900"
                                            disabled={isLoading}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(patient.id)}
                                            className="text-red-600 hover:text-red-900"
                                            disabled={isLoading}
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
        </div>
    );
};

export default Patients;