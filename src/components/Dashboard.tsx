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
    RadialLinearScale,
} from 'chart.js';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import type { DashboardStats } from '../types';
import {
    UserIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    HeartIcon,
    ClockIcon,
    ShieldCheckIcon,
    EyeIcon,
    BellIcon,
    CalendarIcon,
    UserGroupIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    ChartBarIcon,
    FireIcon,
    ArrowTrendingUpIcon // This is the correct import name
} from '@heroicons/react/24/outline';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Alert {
    id: string;
    type: 'warning' | 'success' | 'info' | 'error';
    message: string;
    action: string;
    timestamp: string;
}

interface FilterState {
    dateRange: string;
    riskLevel: string;
    doctor: string;
    department: string;
}

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [filters, setFilters] = useState<FilterState>({
        dateRange: '30d',
        riskLevel: 'all',
        doctor: 'all',
        department: 'all'
    });

    // Alertas simuladas
    const [alerts] = useState<Alert[]>([
        {
            id: '1',
            type: 'warning',
            message: 'Incremento del 15% en casos de alto riesgo esta semana',
            action: 'Revisar protocolo de triaje',
            timestamp: '2025-07-25T10:30:00Z'
        },
        {
            id: '2',
            type: 'success',
            message: 'Precisión diagnóstica por encima del objetivo (87.5%)',
            action: 'Mantener estándares actuales',
            timestamp: '2025-07-25T09:15:00Z'
        },
        {
            id: '3',
            type: 'info',
            message: '3 pacientes pendientes de seguimiento',
            action: 'Contactar para cita de control',
            timestamp: '2025-07-25T08:45:00Z'
        },
        {
            id: '4',
            type: 'error',
            message: 'Sistema de imágenes con latencia elevada',
            action: 'Contactar soporte técnico',
            timestamp: '2025-07-25T07:20:00Z'
        }
    ]);

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
    }, [filters]);

    // KPIs avanzados calculados
    const calculateAdvancedKPIs = () => {
        if (!stats) return {};

        const highRiskConsultations = stats.recentConsultations.filter(c => c.probability > 70).length;
        const mediumRiskConsultations = stats.recentConsultations.filter(c => c.probability > 30 && c.probability <= 70).length;
        const lowRiskConsultations = stats.recentConsultations.filter(c => c.probability <= 30).length;
        const veryHighRiskConsultations = stats.recentConsultations.filter(c => c.probability > 90).length;

        return {
            highRiskConsultations,
            mediumRiskConsultations,
            lowRiskConsultations,
            veryHighRiskConsultations,
            accuracyRate: 87.5,
            earlyDetectionRate: 78.3,
            sensitivityRate: 94.2,
            specificityRate: 89.7,
            falsePositiveRate: 10.3,
            falseNegativeRate: 5.8,
            timeToTreatment: 45,
            patientSatisfaction: 4.6,
            followUpCompliance: 87.3
        };
    };

    const advancedKPIs = calculateAdvancedKPIs();

    // Heatmap temporal (simulado)
    const temporalHeatmapData = {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
            {
                label: '00-06h',
                data: [2, 1, 2, 3, 1, 4, 3],
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
            },
            {
                label: '06-12h',
                data: [15, 18, 20, 17, 19, 12, 8],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
            },
            {
                label: '12-18h',
                data: [25, 28, 30, 26, 27, 18, 14],
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
            },
            {
                label: '18-24h',
                data: [12, 15, 18, 14, 16, 20, 18],
                backgroundColor: 'rgba(59, 130, 246, 0.9)',
            }
        ]
    };

    // Análisis demográfico
    const demographicData = {
        labels: ['18-30', '31-45', '46-60', '61-75', '75+'],
        datasets: [
            {
                label: 'Hombres',
                data: [5, 12, 25, 35, 45],
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
            },
            {
                label: 'Mujeres',
                data: [3, 8, 18, 28, 38],
                backgroundColor: 'rgba(236, 72, 153, 0.7)',
            }
        ]
    };

    // Funciones de exportación
    const exportToPDF = () => {
        alert('Generando reporte PDF...');
    };

    const exportToExcel = () => {
        alert('Exportando a Excel...');
    };

    const scheduleReport = () => {
        alert('Configurando reporte automático...');
    };

    // Función para obtener el color del alert
    const getAlertColor = (type: string) => {
        switch (type) {
            case 'warning': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
            case 'success': return 'border-green-500 bg-green-50 text-green-800';
            case 'info': return 'border-blue-500 bg-blue-50 text-blue-800';
            case 'error': return 'border-red-500 bg-red-50 text-red-800';
            default: return 'border-gray-500 bg-gray-50 text-gray-800';
        }
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'warning': return <ExclamationTriangleIcon className="w-5 h-5" />;
            case 'success': return <ShieldCheckIcon className="w-5 h-5" />;
            case 'info': return <BellIcon className="w-5 h-5" />;
            case 'error': return <FireIcon className="w-5 h-5" />;
            default: return <BellIcon className="w-5 h-5" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
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

    if (!stats) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header con navegación y controles */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Diagnóstico de Stroke</h1>
                            <p className="text-gray-600 mt-1">Análisis integral y monitoreo en tiempo real</p>
                        </div>

                        {/* Controles del header */}
                        <div className="flex items-center space-x-4">
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
                                            <h3 className="font-semibold text-gray-800 mb-3">Filtros de Datos</h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rango de Fechas</label>
                                                    <select
                                                        value={filters.dateRange}
                                                        onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                    >
                                                        <option value="7d">Últimos 7 días</option>
                                                        <option value="30d">Últimos 30 días</option>
                                                        <option value="90d">Últimos 90 días</option>
                                                        <option value="1y">Último año</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de Riesgo</label>
                                                    <select
                                                        value={filters.riskLevel}
                                                        onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                    >
                                                        <option value="all">Todos los niveles</option>
                                                        <option value="high">Alto riesgo (70%)</option>
                                                        <option value="medium">Riesgo medio (30-70%)</option>
                                                        <option value="low">Bajo riesgo (30%)</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                                                    <select
                                                        value={filters.department}
                                                        onChange={(e) => setFilters({...filters, department: e.target.value})}
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                    >
                                                        <option value="all">Todos los departamentos</option>
                                                        <option value="emergency">Emergencias</option>
                                                        <option value="neurology">Neurología</option>
                                                        <option value="internal">Medicina Interna</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex justify-end mt-4 pt-3 border-t">
                                                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                                                    Aplicar Filtros
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
                                            <button onClick={exportToPDF} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                                Exportar a PDF
                                            </button>
                                            <button onClick={exportToExcel} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                                Exportar a Excel
                                            </button>
                                            <button onClick={scheduleReport} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                                Programar Reporte
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Navegación por pestañas */}
                    <div className="flex space-x-8 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'overview'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Vista General
                        </button>
                        <button
                            onClick={() => setActiveTab('clinical')}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'clinical'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Análisis Clínico
                        </button>
                        <button
                            onClick={() => setActiveTab('operational')}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'operational'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Métricas Operacionales
                        </button>
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm relative ${
                                activeTab === 'alerts'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Alertas
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {alerts.length}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Panel de Alertas */}
                {activeTab === 'alerts' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            {alerts.map((alert) => (
                                <div key={alert.id} className={`rounded-lg border-l-4 p-4 ${getAlertColor(alert.type)}`}>
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            {getAlertIcon(alert.type)}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="font-medium">{alert.message}</p>
                                            <p className="text-sm mt-1 opacity-80">Acción recomendada: {alert.action}</p>
                                            <p className="text-xs mt-2 opacity-60">{new Date(alert.timestamp).toLocaleString()}</p>
                                        </div>
                                        <button className="ml-4 text-sm underline hover:no-underline">
                                            Resolver
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Vista General */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* KPIs Principales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium">Total Pacientes</p>
                                        <p className="text-3xl font-bold">{stats.totalPatients}</p>
                                        <p className="text-blue-100 text-xs mt-1">+12% vs mes anterior</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-white bg-opacity-20">
                                        <UserIcon className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">Consultas Totales</p>
                                        <p className="text-3xl font-bold">{stats.totalConsultations}</p>
                                        <p className="text-green-100 text-xs mt-1">+8% vs mes anterior</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-white bg-opacity-20">
                                        <DocumentTextIcon className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm font-medium">Precisión del Modelo</p>
                                        <p className="text-3xl font-bold">{advancedKPIs.accuracyRate}%</p>
                                        <p className="text-purple-100 text-xs mt-1">Confiabilidad diagnóstica</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-white bg-opacity-20">
                                        <ShieldCheckIcon className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-red-100 text-sm font-medium">Detección Temprana</p>
                                        <p className="text-3xl font-bold">{advancedKPIs.earlyDetectionRate}%</p>
                                        <p className="text-red-100 text-xs mt-1">Casos identificados a tiempo</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-white bg-opacity-20">
                                        <ClockIcon className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* KPIs Secundarios */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                                <div className="text-center">
                                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mx-auto mb-1" />
                                    <p className="text-sm text-gray-600">Alto Riesgo</p>
                                    <p className="text-2xl font-semibold text-gray-900">{advancedKPIs.highRiskConsultations}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                                <div className="text-center">
                                    <EyeIcon className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                                    <p className="text-sm text-gray-600">Riesgo Medio</p>
                                    <p className="text-2xl font-semibold text-gray-900">{advancedKPIs.mediumRiskConsultations}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                                <div className="text-center">
                                    <ShieldCheckIcon className="w-6 h-6 text-green-500 mx-auto mb-1" />
                                    <p className="text-sm text-gray-600">Bajo Riesgo</p>
                                    <p className="text-2xl font-semibold text-gray-900">{advancedKPIs.lowRiskConsultations}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                                <div className="text-center">
                                    <ArrowTrendingUpIcon className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                                    <p className="text-sm text-gray-600">Sensibilidad</p>
                                    <p className="text-2xl font-semibold text-gray-900">{advancedKPIs.sensitivityRate}%</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
                                <div className="text-center">
                                    <ChartBarIcon className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
                                    <p className="text-sm text-gray-600">Especificidad</p>
                                    <p className="text-2xl font-semibold text-gray-900">{advancedKPIs.specificityRate}%</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-pink-500">
                                <div className="text-center">
                                    <ClockIcon className="w-6 h-6 text-pink-500 mx-auto mb-1" />
                                    <p className="text-sm text-gray-600">Tiempo Tto.</p>
                                    <p className="text-2xl font-semibold text-gray-900">{advancedKPIs.timeToTreatment}m</p>
                                </div>
                            </div>
                        </div>

                        {/* Gráficas principales */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Distribución de Riesgo */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <div className="w-2 h-6 bg-gradient-to-b from-red-500 to-green-500 rounded mr-3"></div>
                                    Distribución de Niveles de Riesgo
                                </h2>
                                <div className="h-80 flex items-center justify-center">
                                    <Doughnut
                                        data={{
                                            labels: ['Alto Riesgo (>70%)', 'Riesgo Medio (30-70%)', 'Bajo Riesgo (<30%)'],
                                            datasets: [
                                                {
                                                    data: [
                                                        advancedKPIs.highRiskConsultations || 0,
                                                        advancedKPIs.mediumRiskConsultations || 0,
                                                        advancedKPIs.lowRiskConsultations || 0
                                                    ],
                                                    backgroundColor: [
                                                        'rgba(239, 68, 68, 0.8)',
                                                        'rgba(245, 158, 11, 1)',
                                                        'rgba(34, 197, 94, 1)'
                                                    ],
                                                    borderWidth: 2,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                    labels: {
                                                        padding: 20,
                                                        font: {
                                                            size: 12
                                                        }
                                                    }
                                                },
                                                tooltip: {
                                                    callbacks: {
                                                        label: function(context) {
                                                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                                            const percentage = ((context.raw as number / total) * 100).toFixed(1);
                                                            return `${context.label}: ${context.raw} (${percentage}%)`;
                                                        }
                                                    }
                                                }
                                            },
                                            cutout: '60%',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Heatmap Temporal */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-700 rounded mr-3"></div>
                                    Patrón Temporal de Consultas
                                </h2>
                                <div className="h-80">
                                    <Bar
                                        data={temporalHeatmapData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                            },
                                            scales: {
                                                x: {
                                                    stacked: true,
                                                },
                                                y: {
                                                    stacked: true,
                                                    title: {
                                                        display: true,
                                                        text: 'Número de Consultas'
                                                    }
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Análisis Clínico */}
                {activeTab === 'clinical' && (
                    <div className="space-y-8">
                        {/* Métricas Clínicas Avanzadas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
                                <div className="text-center">
                                    <HeartIcon className="w-10 h-10 mx-auto mb-2" />
                                    <p className="text-teal-100 text-sm font-medium">Satisfacción del Paciente</p>
                                    <p className="text-4xl font-bold">{advancedKPIs.patientSatisfaction}/5</p>
                                    <p className="text-teal-100 text-xs mt-1">Promedio de calificaciones</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                                <div className="text-center">
                                    <CalendarIcon className="w-10 h-10 mx-auto mb-2" />
                                    <p className="text-orange-100 text-sm font-medium">Cumplimiento de Seguimiento</p>
                                    <p className="text-4xl font-bold">{advancedKPIs.followUpCompliance}%</p>
                                    <p className="text-orange-100 text-xs mt-1">Pacientes con seguimiento</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
                                <div className="text-center">
                                    <ClockIcon className="w-10 h-10 mx-auto mb-2" />
                                    <p className="text-cyan-100 text-sm font-medium">Falsos Negativos</p>
                                    <p className="text-4xl font-bold">{advancedKPIs.falseNegativeRate}%</p>
                                    <p className="text-cyan-100 text-xs mt-1">Casos no detectados</p>
                                </div>
                            </div>
                        </div>

                        {/* Gráficas clínicas */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Análisis Demográfico */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <div className="w-2 h-6 bg-gradient-to-b from-pink-500 to-blue-500 rounded mr-3"></div>
                                    Distribución Demográfica por Edad y Género
                                </h2>
                                <div className="h-80">
                                    <Bar
                                        data={demographicData}
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
                                                    title: {
                                                        display: true,
                                                        text: 'Número de Casos (%)'
                                                    }
                                                },
                                                x: {
                                                    title: {
                                                        display: true,
                                                        text: 'Grupo de Edad'
                                                    }
                                                }
                                            },
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Matriz de Confusión Simplificada */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-red-500 rounded mr-3"></div>
                                    Precisión Diagnóstica (Matriz de Confusión)
                                </h2>
                                <div className="grid grid-cols-2 gap-4 h-64">
                                    <div className="bg-green-100 rounded-lg p-4 flex flex-col justify-center items-center border-2 border-green-300">
                                        <p className="text-green-800 font-semibold text-sm mb-2">Verdaderos Negativos</p>
                                        <p className="text-3xl font-bold text-green-700">85</p>
                                        <p className="text-green-600 text-xs">Correctamente No-Stroke</p>
                                    </div>
                                    <div className="bg-red-100 rounded-lg p-4 flex flex-col justify-center items-center border-2 border-red-300">
                                        <p className="text-red-800 font-semibold text-sm mb-2">Falsos Positivos</p>
                                        <p className="text-3xl font-bold text-red-700">12</p>
                                        <p className="text-red-600 text-xs">Incorrectamente Stroke</p>
                                    </div>
                                    <div className="bg-red-100 rounded-lg p-4 flex flex-col justify-center items-center border-2 border-red-300">
                                        <p className="text-red-800 font-semibold text-sm mb-2">Falsos Negativos</p>
                                        <p className="text-3xl font-bold text-red-700">8</p>
                                        <p className="text-red-600 text-xs">Incorrectamente No-Stroke</p>
                                    </div>
                                    <div className="bg-green-100 rounded-lg p-4 flex flex-col justify-center items-center border-2 border-green-300">
                                        <p className="text-green-800 font-semibold text-sm mb-2">Verdaderos Positivos</p>
                                        <p className="text-3xl font-bold text-green-700">95</p>
                                        <p className="text-green-600 text-xs">Correctamente Stroke</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Análisis de Factores de Riesgo */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-purple-700 rounded mr-3"></div>
                                Prevalencia de Factores de Riesgo
                            </h2>
                            <div className="h-96">
                                <Radar
                                    data={{
                                        labels: ['Hipertensión', 'Diabetes', 'Tabaquismo', 'Alcoholismo', 'Enfermedad Cardíaca', 'Edad Avanzada'],
                                        datasets: [
                                            {
                                                label: 'Prevalencia de Factores (%)',
                                                data: [65, 45, 38, 28, 52, 75],
                                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                                borderColor: 'rgba(59, 130, 246, 1)',
                                                borderWidth: 2,
                                                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                                                pointBorderColor: '#fff',
                                                pointHoverBackgroundColor: '#fff',
                                                pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: false
                                            }
                                        },
                                        scales: {
                                            r: {
                                                beginAtZero: true,
                                                max: 100,
                                                ticks: {
                                                    callback: function(value) {
                                                        return value + '%';
                                                    },
                                                    stepSize: 20
                                                },
                                                grid: {
                                                    color: 'rgba(0,0,0,0.1)'
                                                },
                                                angleLines: {
                                                    color: 'rgba(0,0,0,0.1)'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Métricas Operacionales */}
                {activeTab === 'operational' && (
                    <div className="space-y-8">
                        {/* Embudo de Proceso */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <div className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-indigo-700 rounded mr-3"></div>
                                Embudo de Proceso Clínico
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { label: 'Consulta Inicial', value: 100, color: 'bg-green-500' },
                                    { label: 'Evaluación Completa', value: 95, color: 'bg-blue-500' },
                                    { label: 'Diagnóstico', value: 88, color: 'bg-yellow-500' },
                                    { label: 'Tratamiento', value: 82, color: 'bg-orange-500' },
                                    { label: 'Seguimiento', value: 75, color: 'bg-red-500' }
                                ].map((step, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="w-32 text-sm font-medium text-gray-700">{step.label}</div>
                                        <div className="flex-1 mx-4">
                                            <div className="bg-gray-200 rounded-full h-6 relative">
                                                <div
                                                    className={`${step.color} h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-300`}
                                                    style={{ width: `${step.value}%` }}
                                                >
                                                    <span className="text-white text-xs font-semibold">{step.value}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-16 text-right text-sm text-gray-600">
                                            {Math.round((step.value / 100) * stats.totalConsultations)} pacientes
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Volumen vs Efectividad */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-red-500 rounded mr-3"></div>
                                Volumen de Consultas vs Precisión Diagnóstica
                            </h2>
                            <div className="h-80">
                                <Bar
                                    data={{
                                        labels: stats?.monthlyStats.map(item => {
                                            const [month] = item.year_month.split('-');
                                            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                                                'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                                            return `${monthNames[parseInt(month) - 1]}`;
                                        }) || [],
                                        datasets: [
                                            {
                                                label: 'Consultas',
                                                data: stats?.monthlyStats.map(item => item.stroke_count) || [],
                                                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                                                borderColor: 'rgba(34, 197, 94, 1)',
                                                borderWidth: 1,
                                                yAxisID: 'y',
                                            },
                                        ],
                                    }}
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
                                                type: 'linear',
                                                display: true,
                                                position: 'left',
                                                title: {
                                                    display: true,
                                                    text: 'Número de Consultas'
                                                }
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>

                        {/* Métricas de Rendimiento */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                <UserGroupIcon className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Eficiencia del Personal</h3>
                                <p className="text-3xl font-bold text-blue-600">92%</p>
                                <p className="text-sm text-gray-600 mt-1">Utilización de recursos</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                <ClockIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Tiempo de Respuesta</h3>
                                <p className="text-3xl font-bold text-green-600">3.2min</p>
                                <p className="text-sm text-gray-600 mt-1">Promedio de diagnóstico</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                <ArrowTrendingUpIcon className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Tendencia de Calidad</h3>
                                <p className="text-3xl font-bold text-purple-600">↗ 2.1%</p>
                                <p className="text-sm text-gray-600 mt-1">Mejora mensual</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla de Consultas Recientes (visible en todas las pestañas) */}
                {activeTab !== 'alerts' && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <DocumentTextIcon className="w-6 h-6 mr-2 text-blue-600" />
                                Consultas Recientes
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">Últimas evaluaciones realizadas</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnóstico</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Riesgo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probabilidad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {stats.recentConsultations.map((consultation) => (
                                    <tr key={consultation._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                                    consultation.probability > 70 ? 'bg-red-500' :
                                                        consultation.probability > 30 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}>
                                                    {consultation.patient_name?.charAt(0) || '?'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {consultation.patient_name || 'Paciente Desconocido'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {consultation.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    consultation.diagnosis === 'Stroke'
                                                        ? 'bg-red-100 text-red-800 border border-red-200'
                                                        : 'bg-green-100 text-green-800 border border-green-200'
                                                }`}>
                                                    {consultation.diagnosis}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                                    consultation.probability > 70 ? 'bg-red-100 text-red-800' :
                                                        consultation.probability > 30 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                }`}>
                                                    {consultation.probability > 70 ? 'Alto' :
                                                        consultation.probability > 30 ? 'Medio' : 'Bajo'}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${
                                                            consultation.probability > 70 ? 'bg-red-500' :
                                                                consultation.probability > 30 ? 'bg-yellow-500' : 'bg-green-500'
                                                        }`}
                                                        style={{ width: `${consultation.probability}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700 min-w-[50px]">
                                                        {consultation.probability.toFixed(1)}%
                                                    </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button className="text-blue-600 hover:text-blue-900 mr-3">Ver</button>
                                            <button className="text-green-600 hover:text-green-900">Seguimiento</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;