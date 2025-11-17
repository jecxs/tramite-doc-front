'use client';

import { useState } from 'react';
import { useAuth, useRole } from '@/contexts/AuthContext';
import { Bell, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const { user, logout } = useAuth();
    const { currentRole } = useRole();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const getFullName = () => {
        if (!user) return '';
        return `${user.nombres} ${user.apellidos}`;
    };

    const getRoleLabel = () => {
        if (!user || !user.roles || user.roles.length === 0) return '';

        const roleLabels: Record<string, string> = {
            ADMIN: 'Administrador',
            RESP: 'Responsable de Área',
            TRAB: 'Trabajador',
        };

        const primaryRole = user.roles[0];
        return roleLabels[primaryRole] || primaryRole;
    };

    return (
        <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side - Menu button & Logo */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                        >
                            <Menu className="w-6 h-6 text-gray-600" />
                        </button>

                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-white"
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
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-semibold text-gray-900">
                                    Sistema de Gestión Documental
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Notifications & User menu */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <Link
                            href="/notificaciones"
                            className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <Bell className="w-6 h-6 text-gray-600" />
                            {/* Badge de notificaciones no leídas */}
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </Link>

                        {/* User menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-900">
                                        {getFullName()}
                                    </p>
                                    <p className="text-xs text-gray-500">{getRoleLabel()}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                            </button>

                            {/* Dropdown menu */}
                            {showUserMenu && (
                                <>
                                    {/* Overlay para cerrar el menú */}
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowUserMenu(false)}
                                    ></div>

                                    {/* Menu */}
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                        <div className="p-3 border-b border-gray-200">
                                            <p className="text-sm font-medium text-gray-900">
                                                {getFullName()}
                                            </p>
                                            <p className="text-xs text-gray-500">{user?.correo}</p>
                                        </div>

                                        <div className="py-2">
                                            <Link
                                                href="/perfil"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                Mi Perfil
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                    logout();
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}