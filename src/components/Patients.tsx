import { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
    UserGroupIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
    UserIcon,
    ExclamationTriangleIcon,
    HeartIcon,
    FireIcon,
    ShieldCheckIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
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
    hypertension?: boolean;
    diabetes?: boolean;
    heart_disease?: boolean;
    smoker?: boolean;
    alcoholic?: boolean;
};

interface FilterState {
    search: string;
    ageRange: string;
    gender: string;
    riskFactors: string;
}

const Patients = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const { user } = useAuth();

    const [filters, setFilters] = useState<FilterState>({
        search: '',
        ageRange: 'all',
        gender: 'all',
        riskFactors: 'all'
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<PatientFormData>();

    // Estadísticas calculadas
    const calculateStats = () => {
        const total = patients.length;
        const maleCount = patients.filter(p => p.gender === 'Male').length;
        const femaleCount = patients.filter(p => p.gender === 'Female').length;
        const withRiskFactors = patients.filter(p =>
            p.hypertension || p.diabetes || p.heart_disease || p.smoker || p.alcoholic
        ).length;
        const avgAge = patients.reduce((sum, p) => sum + p.age, 0) / total || 0;
        const highRisk = patients.filter(p => {
            const riskCount = [p.hypertension, p.diabetes, p.heart_disease, p.smoker, p.alcoholic]
                .filter(Boolean).length;
            return riskCount >= 3;
        }).length;

        return {
            total,
            maleCount,
            femaleCount,
            withRiskFactors,
            avgAge,
            highRisk
        };
    };

    const stats = calculateStats();

    // Fetch patients on component mount
    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get<ApiResponse<Patient[]>>(`${API_BASE_URL}/patients/`);
                if (response.data.success) {
                    setPatients(response.data.data);
                    setFilteredPatients(response.data.data);
                } else {
                    const errorMessage = response.data.message || 'Failed to fetch patients';
                    setError(errorMessage);
                    toast.error(errorMessage);
                }
            } catch (err) {
                const errorMessage = axios.isAxiosError(err)
                    ? err.response?.data?.error || err.message
                    : 'Unknown error occurred';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    // Filtrado de pacientes
    useEffect(() => {
        let filtered = [...patients];

        // Filtro de búsqueda
        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase().trim();
            filtered = filtered.filter(p =>
                p.name?.toLowerCase().includes(searchTerm) ||
                p.id?.toLowerCase().includes(searchTerm)
            );
        }

        // Filtro de género
        if (filters.gender !== 'all') {
            filtered = filtered.filter(p => p.gender === filters.gender);
        }

        // Filtro de edad
        if (filters.ageRange !== 'all') {
            filtered = filtered.filter(p => {
                switch (filters.ageRange) {
                    case 'young': return p.age < 30;
                    case 'adult': return p.age >= 30 && p.age < 60;
                    case 'senior': return p.age >= 60;
                    default: return true;
                }
            });
        }

        // Filtro de factores de riesgo
        if (filters.riskFactors !== 'all') {
            filtered = filtered.filter(p => {
                const hasRiskFactors = p.hypertension || p.diabetes || p.heart_disease || p.smoker || p.alcoholic;
                return filters.riskFactors === 'with' ? hasRiskFactors : !hasRiskFactors;
            });
        }

        setFilteredPatients(filtered);
    }, [filters, patients]);

    // Handle form submission
    const onSubmit = async (formData: PatientFormData) => {
        setLoading(true);
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
                    ));
                    resetForm();
                    toast.success('Paciente actualizado exitosamente');
                } else {
                    const errorMessage = response.data.message || 'Failed to update patient';
                    setError(errorMessage);
                    toast.error(errorMessage);
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
                    toast.success('Paciente creado exitosamente');
                } else {
                    const errorMessage = response.data.message || 'Failed to create patient';
                    setError(errorMessage);
                    toast.error(errorMessage);
                }
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.error || err.message
                : 'Unknown error occurred';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Handle patient edit
    const handleEdit = (patient: Patient) => {
        setEditingPatient(patient);
        setValue('name', patient.name);
        setValue('age', patient.age);
        setValue('gender', patient.gender);
        setValue('hypertension', patient.hypertension || false);
        setValue('diabetes', patient.diabetes || false);
        setValue('heart_disease', patient.heart_disease || false);
        setValue('smoker', patient.smoker || false);
        setValue('alcoholic', patient.alcoholic || false);
        setShowForm(true);
    };

    // Handle patient deletion
    const handleDelete = async (id: string) => {
        if (!id || !window.confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.delete<ApiResponse<null>>(
                `${API_BASE_URL}/patients/${id}/`
            );

            if (response.data.success) {
                setPatients(patients.filter(p => p.id !== id));
                toast.success('Paciente eliminado exitosamente');
            } else {
                const errorMessage = response.data.message || 'Failed to delete patient';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.error || err.message
                : 'Unknown error occurred';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Reset form and editing state
    const resetForm = () => {
        reset();
        setEditingPatient(null);
        setShowForm(false);
    };

// Reemplaza las funciones exportToPDF y exportToExcel existentes en tu componente Patients

    const exportToPDF = async () => {
        try {
            const htmlContent = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <title>Reporte de Pacientes - Stroke Diagnosis System</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        color: #333;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 30px; 
                        border-bottom: 2px solid #4F46E5;
                        padding-bottom: 20px;
                    }
                    .logo {
                        color: #4F46E5;
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .stats-grid { 
                        display: grid; 
                        grid-template-columns: repeat(5, 1fr); 
                        gap: 15px; 
                        margin-bottom: 30px; 
                    }
                    .stat-card { 
                        border: 1px solid #E5E7EB; 
                        padding: 15px; 
                        border-radius: 8px; 
                        text-align: center;
                        background-color: #F9FAFB;
                    }
                    .stat-title {
                        font-size: 12px;
                        color: #6B7280;
                        margin-bottom: 5px;
                        font-weight: 500;
                    }
                    .stat-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1F2937;
                    }
                    .table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px; 
                        font-size: 12px;
                    }
                    .table th, .table td { 
                        border: 1px solid #E5E7EB; 
                        padding: 8px; 
                        text-align: left; 
                    }
                    .table th { 
                        background-color: #F3F4F6; 
                        font-weight: 600;
                        color: #374151;
                    }
                    .table tbody tr:nth-child(even) {
                        background-color: #F9FAFB;
                    }
                    .risk-badge {
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 600;
                        text-align: center;
                        display: inline-block;
                        min-width: 60px;
                    }
                    .risk-high { background-color: #FEE2E2; color: #DC2626; }
                    .risk-medium { background-color: #FEF3C7; color: #D97706; }
                    .risk-low { background-color: #D1FAE5; color: #059669; }
                    .gender-badge {
                        padding: 2px 6px;
                        border-radius: 8px;
                        font-size: 10px;
                        font-weight: 500;
                    }
                    .gender-male { background-color: #DBEAFE; color: #1D4ED8; }
                    .gender-female { background-color: #FCE7F3; color: #BE185D; }
                    .gender-other { background-color: #F3F4F6; color: #374151; }
                    .risk-factors {
                        font-size: 10px;
                    }
                    .risk-factor {
                        display: inline-block;
                        padding: 2px 4px;
                        margin: 1px;
                        border-radius: 4px;
                        background-color: #E5E7EB;
                        color: #374151;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #E5E7EB;
                        text-align: center;
                        font-size: 12px;
                        color: #6B7280;
                    }
                    .filters-applied {
                        background-color: #EEF2FF;
                        padding: 10px;
                        border-radius: 6px;
                        margin-bottom: 20px;
                        font-size: 12px;
                    }
                    @media print {
                        body { margin: 0; }
                        .header { page-break-after: avoid; }
                        .table { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">🏥 Sistema de Diagnóstico de Stroke</div>
                    <h1>Reporte de Gestión de Pacientes</h1>
                    <p>Generado el ${new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
                </div>

                ${(filters.search || filters.ageRange !== 'all' || filters.gender !== 'all' || filters.riskFactors !== 'all') ? `
                <div class="filters-applied">
                    <strong>Filtros Aplicados:</strong>
                    ${filters.search ? `Búsqueda: "${filters.search}" | ` : ''}
                    ${filters.ageRange !== 'all' ? `Edad: ${
                filters.ageRange === 'young' ? 'Jóvenes (<30)' :
                    filters.ageRange === 'adult' ? 'Adultos (30-59)' :
                        filters.ageRange === 'senior' ? 'Mayores (≥60)' : filters.ageRange
            } | ` : ''}
                    ${filters.gender !== 'all' ? `Género: ${filters.gender} | ` : ''}
                    ${filters.riskFactors !== 'all' ? `Factores de Riesgo: ${
                filters.riskFactors === 'with' ? 'Con factores' : 'Sin factores'
            }` : ''}
                </div>
                ` : ''}
                
                <h2>Estadísticas Generales</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-title">Total Pacientes</div>
                        <div class="stat-value">${stats.total}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">Con Factores de Riesgo</div>
                        <div class="stat-value">${stats.withRiskFactors}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">Alto Riesgo</div>
                        <div class="stat-value">${stats.highRisk}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">Distribución M/F</div>
                        <div class="stat-value">${stats.maleCount}/${stats.femaleCount}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">Edad Promedio</div>
                        <div class="stat-value">${stats.avgAge.toFixed(0)} años</div>
                    </div>
                </div>

                <h2>Listado de Pacientes (${filteredPatients.length} registros)</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Edad</th>
                            <th>Género</th>
                            <th>Factores de Riesgo</th>
                            <th>Nivel de Riesgo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredPatients.map(patient => {
                const riskCount = getRiskFactorCount(patient);
                const riskFactors = [];
                if (patient.hypertension) riskFactors.push('HTN');
                if (patient.diabetes) riskFactors.push('DM');
                if (patient.heart_disease) riskFactors.push('CVD');
                if (patient.smoker) riskFactors.push('Fumador');
                if (patient.alcoholic) riskFactors.push('Alcohólico');

                return `
                                <tr>
                                    <td>${patient.id}</td>
                                    <td>${patient.name || 'N/A'}</td>
                                    <td>${patient.age} años</td>
                                    <td>
                                        <span class="gender-badge ${
                    patient.gender === 'Male' ? 'gender-male' :
                        patient.gender === 'Female' ? 'gender-female' : 'gender-other'
                }">
                                            ${patient.gender === 'Male' ? 'Masculino' :
                    patient.gender === 'Female' ? 'Femenino' :
                        patient.gender === 'Other' ? 'Otro' : 'No especificado'}
                                        </span>
                                    </td>
                                    <td class="risk-factors">
                                        ${riskFactors.length > 0 ?
                    riskFactors.map(factor => `<span class="risk-factor">${factor}</span>`).join(' ') :
                    '<span class="risk-factor">Sin factores</span>'
                }
                                    </td>
                                    <td>
                                        <span class="risk-badge ${
                    riskCount >= 3 ? 'risk-high' :
                        riskCount >= 1 ? 'risk-medium' : 'risk-low'
                }">
                                            ${riskCount >= 3 ? 'Alto Riesgo' :
                    riskCount >= 1 ? 'Riesgo Moderado' : 'Bajo Riesgo'}
                                        </span>
                                    </td>
                                </tr>
                            `;
            }).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p><strong>Sistema de Diagnóstico de Stroke</strong></p>
                    <p>Reporte generado automáticamente | Confidencial - Solo para uso médico</p>
                </div>
            </body>
            </html>
        `;

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.open();
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }

            setShowExportMenu(false);
            toast.success('Reporte PDF generado exitosamente');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Error al generar el PDF. Por favor, intenta nuevamente.');
        }
    };

    const exportToExcel = () => {
        try {
            const csvData = [
                ['REPORTE DE GESTIÓN DE PACIENTES - SISTEMA DE DIAGNÓSTICO DE STROKE'],
                ['Generado el:', new Date().toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })],
                [''],
                ['FILTROS APLICADOS:'],
                ...(filters.search || filters.ageRange !== 'all' || filters.gender !== 'all' || filters.riskFactors !== 'all' ? [
                    ['Búsqueda:', filters.search || 'N/A'],
                    ['Rango de Edad:', filters.ageRange === 'all' ? 'Todas las edades' :
                        filters.ageRange === 'young' ? 'Jóvenes (<30)' :
                            filters.ageRange === 'adult' ? 'Adultos (30-59)' :
                                filters.ageRange === 'senior' ? 'Mayores (≥60)' : filters.ageRange],
                    ['Género:', filters.gender === 'all' ? 'Todos los géneros' : filters.gender],
                    ['Factores de Riesgo:', filters.riskFactors === 'all' ? 'Todos' :
                        filters.riskFactors === 'with' ? 'Con factores de riesgo' : 'Sin factores de riesgo'],
                ] : [
                    ['No se aplicaron filtros']
                ]),
                [''],
                ['ESTADÍSTICAS GENERALES'],
                ['Métrica', 'Valor'],
                ['Total de Pacientes', stats.total],
                ['Pacientes con Factores de Riesgo', stats.withRiskFactors],
                ['Pacientes de Alto Riesgo', stats.highRisk],
                ['Pacientes Masculinos', stats.maleCount],
                ['Pacientes Femeninos', stats.femaleCount],
                ['Edad Promedio', `${stats.avgAge.toFixed(1)} años`],
                ['Porcentaje con Factores de Riesgo', `${stats.total > 0 ? ((stats.withRiskFactors / stats.total) * 100).toFixed(1) : 0}%`],
                [''],
                ['LISTADO DETALLADO DE PACIENTES'],
                ['ID', 'Nombre', 'Edad', 'Género', 'Hipertensión', 'Diabetes', 'Enfermedad Cardíaca', 'Fumador', 'Alcohólico', 'Factores de Riesgo (Total)', 'Nivel de Riesgo'],
                ...filteredPatients.map(patient => {
                    const riskCount = getRiskFactorCount(patient);
                    return [
                        patient.id,
                        patient.name || 'N/A',
                        patient.age,
                        patient.gender === 'Male' ? 'Masculino' :
                            patient.gender === 'Female' ? 'Femenino' :
                                patient.gender === 'Other' ? 'Otro' : 'No especificado',
                        patient.hypertension ? 'Sí' : 'No',
                        patient.diabetes ? 'Sí' : 'No',
                        patient.heart_disease ? 'Sí' : 'No',
                        patient.smoker ? 'Sí' : 'No',
                        patient.alcoholic ? 'Sí' : 'No',
                        riskCount,
                        riskCount >= 3 ? 'Alto Riesgo' :
                            riskCount >= 1 ? 'Riesgo Moderado' : 'Bajo Riesgo'
                    ];
                }),
                [''],
                ['RESUMEN POR CATEGORÍAS'],
                ['Categoría', 'Cantidad', 'Porcentaje'],
                ['Pacientes sin factores de riesgo', stats.total - stats.withRiskFactors, `${stats.total > 0 ? (((stats.total - stats.withRiskFactors) / stats.total) * 100).toFixed(1) : 0}%`],
                ['Pacientes con 1-2 factores de riesgo', stats.withRiskFactors - stats.highRisk, `${stats.total > 0 ? (((stats.withRiskFactors - stats.highRisk) / stats.total) * 100).toFixed(1) : 0}%`],
                ['Pacientes con 3+ factores de riesgo (Alto Riesgo)', stats.highRisk, `${stats.total > 0 ? ((stats.highRisk / stats.total) * 100).toFixed(1) : 0}%`],
                [''],
                ['DISTRIBUCIÓN POR EDAD'],
                ['Grupo de Edad', 'Cantidad', 'Porcentaje'],
                ['Jóvenes (<30 años)', patients.filter(p => p.age < 30).length, `${stats.total > 0 ? ((patients.filter(p => p.age < 30).length / stats.total) * 100).toFixed(1) : 0}%`],
                ['Adultos (30-59 años)', patients.filter(p => p.age >= 30 && p.age < 60).length, `${stats.total > 0 ? ((patients.filter(p => p.age >= 30 && p.age < 60).length / stats.total) * 100).toFixed(1) : 0}%`],
                ['Mayores (≥60 años)', patients.filter(p => p.age >= 60).length, `${stats.total > 0 ? ((patients.filter(p => p.age >= 60).length / stats.total) * 100).toFixed(1) : 0}%`],
                [''],
                ['NOTAS:'],
                ['- Alto Riesgo: 3 o más factores de riesgo'],
                ['- Riesgo Moderado: 1-2 factores de riesgo'],
                ['- Bajo Riesgo: Sin factores de riesgo'],
                ['- HTN: Hipertensión, DM: Diabetes, CVD: Enfermedad Cardiovascular'],
                [''],
                ['Reporte generado automáticamente por el Sistema de Diagnóstico de Stroke'],
                ['Confidencial - Solo para uso médico autorizado']
            ];

            const csvContent = csvData.map(row =>
                row.map(cell => {
                    // Escapar comillas dobles y envolver en comillas si contiene comas, saltos de línea o comillas
                    const cellStr = String(cell);
                    if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
                        return `"${cellStr.replace(/"/g, '""')}"`;
                    }
                    return cellStr;
                }).join(',')
            ).join('\n');

            // Crear y descargar el archivo
            const blob = new Blob(['\ufeff' + csvContent], {
                type: 'text/csv;charset=utf-8;'
            });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `pacientes_reporte_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setShowExportMenu(false);
            toast.success('Archivo Excel exportado exitosamente');
        } catch (error) {
            console.error('Error generating Excel:', error);
            toast.error('Error al generar el archivo Excel. Por favor, intenta nuevamente.');
        }
    };

    const getRiskFactorCount = (patient: Patient) => {
        return [patient.hypertension, patient.diabetes, patient.heart_disease, patient.smoker, patient.alcoholic]
            .filter(Boolean).length;
    };

    const getRiskColor = (count: number) => {
        if (count >= 3) return 'text-red-600 bg-red-50 border border-red-200';
        if (count >= 1) return 'text-yellow-600 bg-yellow-50 border border-yellow-200';
        return 'text-green-600 bg-green-50 border border-green-200';
    };

    if (loading && patients.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Cargando pacientes...</p>
                </div>
            </div>
        );
    }

    if (error && patients.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                    <div className="flex items-center mb-4">
                        <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">Error de Conexión</h3>
                    </div>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
                            <p className="text-gray-600 mt-1">Administra la información de todos los pacientes</p>
                        </div>

                        {/* Controles del header */}
                        <div className="flex items-center space-x-4">
                            {/* Búsqueda */}
                            <div className="relative">
                                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar paciente..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                                    className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64 text-gray-900 placeholder-gray-500"
                                />
                            </div>

                            {/* Filtros */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <FunnelIcon className="w-5 h-5 mr-2" />
                                    Filtros
                                </button>

                                {showFilters && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-800 mb-3">Filtros Avanzados</h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rango de Edad</label>
                                                    <select
                                                        value={filters.ageRange}
                                                        onChange={(e) => setFilters({...filters, ageRange: e.target.value})}
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                                                    >
                                                        <option value="all">Todas las edades</option>
                                                        <option value="young">Jóvenes (30)</option>
                                                        <option value="adult">Adultos (30-59)</option>
                                                        <option value="senior">Mayores (60)</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                                                    <select
                                                        value={filters.gender}
                                                        onChange={(e) => setFilters({...filters, gender: e.target.value})}
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                                                    >
                                                        <option value="all">Todos los géneros</option>
                                                        <option value="Male">Masculino</option>
                                                        <option value="Female">Femenino</option>
                                                        <option value="Other">Otro</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Factores de Riesgo</label>
                                                    <select
                                                        value={filters.riskFactors}
                                                        onChange={(e) => setFilters({...filters, riskFactors: e.target.value})}
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                                                    >
                                                        <option value="all">Todos</option>
                                                        <option value="with">Con factores de riesgo</option>
                                                        <option value="without">Sin factores de riesgo</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex justify-between mt-4 pt-3 border-t">
                                                <button
                                                    onClick={() => {
                                                        setFilters({
                                                            search: '',
                                                            ageRange: 'all',
                                                            gender: 'all',
                                                            riskFactors: 'all'
                                                        });
                                                        setShowFilters(false);
                                                    }}
                                                    className="px-3 py-2 bg-white text-gray-600 hover:text-gray-800 transition-colors"
                                                >
                                                    Limpiar
                                                </button>
                                                <button
                                                    onClick={() => setShowFilters(false)}
                                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                                >
                                                    Aplicar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Exportación */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                                    Exportar
                                </button>

                                {showExportMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                        <div className="py-2">
                                            <button
                                                onClick={exportToPDF}
                                                className="block w-full text-left bg-white px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                Exportar a PDF
                                            </button>
                                            <button
                                                onClick={exportToExcel}
                                                className="block w-full text-left bg-white px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                Exportar a Excel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Botón Nuevo Paciente */}
                            {(user?.role === 'doctor' || user?.role === 'admin') && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                                >
                                    <PlusIcon className="w-5 h-5 mr-2" />
                                    Nuevo Paciente
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Estadísticas de resumen */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Pacientes</p>
                                <p className="text-3xl font-bold">{stats.total}</p>
                            </div>
                            <UserGroupIcon className="w-8 h-8 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Con Factores de Riesgo</p>
                                <p className="text-3xl font-bold">{stats.withRiskFactors}</p>
                            </div>
                            <ExclamationTriangleIcon className="w-8 h-8 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm font-medium">Alto Riesgo</p>
                                <p className="text-3xl font-bold">{stats.highRisk}</p>
                            </div>
                            <FireIcon className="w-8 h-8 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Hombres / Mujeres</p>
                                <p className="text-3xl font-bold">{stats.maleCount} / {stats.femaleCount}</p>
                            </div>
                            <HeartIcon className="w-8 h-8 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Edad Promedio</p>
                                <p className="text-3xl font-bold">{stats.avgAge.toFixed(0)}</p>
                            </div>
                            <ChartBarIcon className="w-8 h-8 opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Formulario Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
                                </h2>
                                <button
                                    onClick={resetForm}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Información básica */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Básica</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                            <input
                                                {...register('name', {
                                                    required: 'El nombre es requerido',
                                                    minLength: {
                                                        value: 2,
                                                        message: 'El nombre debe tener al menos 2 caracteres'
                                                    }
                                                })}
                                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                                                disabled={loading}
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Edad *</label>
                                            <input
                                                type="number"
                                                {...register('age', {
                                                    required: 'La edad es requerida',
                                                    min: {
                                                        value: 0,
                                                        message: 'La edad debe ser positiva'
                                                    },
                                                    max: {
                                                        value: 120,
                                                        message: 'La edad debe ser menor a 120'
                                                    }
                                                })}
                                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                                                disabled={loading}
                                            />
                                            {errors.age && (
                                                <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Género *</label>
                                            <select
                                                {...register('gender', { required: 'El género es requerido' })}
                                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                                                disabled={loading}
                                            >
                                                <option value="">Seleccionar Género</option>
                                                <option value="Male">Masculino</option>
                                                <option value="Female">Femenino</option>
                                                <option value="Other">Otro</option>
                                                <option value="Unknown">Prefiero no decir</option>
                                            </select>
                                            {errors.gender && (
                                                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Factores de riesgo */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Factores de Riesgo</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                {...register('hypertension')}
                                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                disabled={loading}
                                            />
                                            <span className="text-sm font-medium text-gray-700">Hipertensión</span>
                                        </label>

                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                {...register('diabetes')}
                                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                disabled={loading}
                                            />
                                            <span className="text-sm font-medium text-gray-700">Diabetes</span>
                                        </label>

                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                {...register('heart_disease')}
                                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                disabled={loading}
                                            />
                                            <span className="text-sm font-medium text-gray-700">Enfermedad Cardíaca</span>
                                        </label>

                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                {...register('smoker')}
                                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                disabled={loading}
                                            />
                                            <span className="text-sm font-medium text-gray-700">Fumador</span>
                                        </label>

                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                {...register('alcoholic')}
                                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                disabled={loading}
                                            />
                                            <span className="text-sm font-medium text-gray-700">Alcohólico</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                                        disabled={loading}
                                    >
                                        {loading ? 'Procesando...' : editingPatient ? 'Actualizar Paciente' : 'Crear Paciente'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Tabla de pacientes */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <UserGroupIcon className="w-6 h-6 mr-2 text-blue-600" />
                                    Registro de Pacientes
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Mostrando {filteredPatients.length} de {patients.length} pacientes
                                </p>
                            </div>
                        </div>
                    </div>

                    {filteredPatients.length === 0 ? (
                        <div className="text-center py-16">
                            <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pacientes</h3>
                            <p className="text-gray-500 mb-6">
                                {patients.length === 0
                                    ? 'Aún no hay pacientes registrados en el sistema.'
                                    : 'Prueba ajustando los filtros para encontrar lo que buscas.'
                                }
                            </p>
                            {(user?.role === 'doctor' || user?.role === 'admin') && patients.length === 0 && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <PlusIcon className="w-5 h-5 mr-2" />
                                    Crear Primer Paciente
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Género</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factores de Riesgo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel de Riesgo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPatients.map(patient => {
                                    const riskCount = getRiskFactorCount(patient);
                                    return (
                                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                                        riskCount >= 3 ? 'bg-red-500' :
                                                            riskCount >= 1 ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}>
                                                        {patient.name?.charAt(0) || 'P'}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {patient.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {patient.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{patient.age} años</div>
                                                <div className="text-xs text-gray-500">
                                                    {patient.age < 30 ? 'Joven' : patient.age < 60 ? 'Adulto' : 'Mayor'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    patient.gender === 'Male' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                        patient.gender === 'Female' ? 'bg-pink-100 text-pink-800 border border-pink-200' :
                                                            'bg-gray-100 text-gray-800 border border-gray-200'
                                                }`}>
                                                    {patient.gender === 'Male' ? 'Masculino' :
                                                        patient.gender === 'Female' ? 'Femenino' :
                                                            patient.gender === 'Other' ? 'Otro' : 'No especificado'
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {patient.hypertension && (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 border border-purple-200">HTN</span>
                                                    )}
                                                    {patient.diabetes && (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">DM</span>
                                                    )}
                                                    {patient.heart_disease && (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 border border-red-200">CVD</span>
                                                    )}
                                                    {patient.smoker && (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 border border-orange-200">Fumador</span>
                                                    )}
                                                    {patient.alcoholic && (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200">Alcohólico</span>
                                                    )}
                                                    {riskCount === 0 && (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">Sin factores</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(riskCount)}`}>
                                                    {riskCount >= 3 ? (
                                                        <>
                                                            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                                                            Alto Riesgo
                                                        </>
                                                    ) : riskCount >= 1 ? (
                                                        <>
                                                            <FireIcon className="w-4 h-4 mr-1" />
                                                            Riesgo Moderado
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShieldCheckIcon className="w-4 h-4 mr-1" />
                                                            Bajo Riesgo
                                                        </>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {riskCount} factor{riskCount !== 1 ? 'es' : ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-3">
                                                    {(user?.role === 'doctor' || user?.role === 'admin') && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEdit(patient)}
                                                                className="bg-white text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 p-2 rounded-lg border border-gray-200 transition-colors shadow-sm"
                                                                title="Editar"
                                                                disabled={loading}
                                                            >
                                                                <PencilIcon className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(patient.id)}
                                                                className="bg-white text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg border border-gray-200 transition-colors shadow-sm"
                                                                title="Eliminar"
                                                                disabled={loading}
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Paginación (opcional) */}
                {filteredPatients.length > 20 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Anterior
                            </button>
                            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Siguiente
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando <span className="font-medium">1</span> a <span className="font-medium">{Math.min(20, filteredPatients.length)}</span> de{' '}
                                    <span className="font-medium">{filteredPatients.length}</span> resultados
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                        Anterior
                                    </button>
                                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        1
                                    </button>
                                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                        Siguiente
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Patients;