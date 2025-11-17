'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginDto } from '@/types';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const { login, isLoading: authLoading } = useAuth();

    const [formData, setFormData] = useState<LoginDto>({
        correo: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        // Limpiar error al escribir
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            console.log('📝 Iniciando login...');
            await login(formData);
            console.log('✅ Login completado, esperando redirección...');
            // La redirección se maneja automáticamente en el AuthContext
        } catch (err) {
            console.error('❌ Error en handleSubmit:', err);
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    const loading = isLoading || authLoading;

    return (
        <div className="w-full max-w-md">
            {/* Card container */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <svg
                            className="w-8 h-8 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Sistema de Gestión de Documentos
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Ingrese sus credenciales para continuar
                    </p>
                </div>

                {/* Error alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email field */}
                    <div>
                        <label
                            htmlFor="correo"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Correo electrónico
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="correo"
                                name="correo"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.correo}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="usuario@universidad.edu"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password field */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Contraseña
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="••••••••"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                disabled={loading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                <span>Iniciando sesión...</span>
                            </>
                        ) : (
                            <span>Iniciar Sesión</span>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>¿Problemas para acceder?</p>
                    <p className="mt-1">
                        Contacte al administrador del sistema
                    </p>
                </div>
            </div>

            {/* Info adicional */}
            <div className="mt-6 text-center text-sm text-gray-600">
                <p>
                    Sistema Universitario de Gestión de Documentos
                </p>
                <p className="mt-1">
                    © {new Date().getFullYear()} Todos los derechos reservados
                </p>
            </div>
        </div>
    );
}
