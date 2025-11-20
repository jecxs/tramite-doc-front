'use client';

import { useAuth, useRole } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
    LogOut,
    User,
    ChevronDown,
    Menu,
} from 'lucide-react';
import NotificationBadge from '@/components/notifications/NotificationBadge';

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const { user, logout } = useAuth();
    const { currentRole, getRoleName } = useRole();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
    };

    if (!user) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side */}
                    <div className="flex items-center gap-4">
                        {/* Mobile menu button */}
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                            aria-label="Abrir menú"
                        >
                            <Menu className="w-6 h-6 text-gray-600" />
                        </button>

                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-lg">
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
                        {/* Notifcaciones */}
                        <NotificationBadge />

                        {/* User menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user.nombres} {user.apellidos}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {getRoleName(currentRole || '')}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold">
                                        {user.nombres.charAt(0)}
                                        {user.apellidos.charAt(0)}
                                    </span>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-gray-600 transition-transform ${
                                        showUserMenu ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {/* Dropdown menu */}
                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                        <div className="p-4 border-b border-gray-200">
                                            <p className="text-sm font-medium text-gray-900">
                                                {user.nombres} {user.apellidos}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {user.correo}
                                            </p>
                                            <div className="mt-2">
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                                    {getRoleName(currentRole || '')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-2">
                                            <Link
                                                href="/perfil"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                                            >
                                                <User className="w-5 h-5 text-gray-600" />
                                                <span className="text-sm text-gray-700">
                                                    Mi Perfil
                                                </span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 transition-colors text-red-600"
                                            >
                                                <LogOut className="w-5 h-5" />
                                                <span className="text-sm font-medium">
                                                    Cerrar Sesión
                                                </span>
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