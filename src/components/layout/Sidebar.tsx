'use client';

import { useRole } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    Home,
    FileText,
    Send,
    Users,
    Building2,
    FileType,
    BarChart3,
    MessageSquare,
    X,
    ChevronRight,
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles: string[];
    badge?: string;
}

const navItems: NavItem[] = [
    // Admin navigation
    {
        label: 'Dashboard',
        href: '/admin',
        icon: <Home className="w-5 h-5" />,
        roles: ['ADMIN'],
    },
    {
        label: 'Usuarios',
        href: '/admin/usuarios',
        icon: <Users className="w-5 h-5" />,
        roles: ['ADMIN'],
    },
    {
        label: 'Áreas',
        href: '/admin/areas',
        icon: <Building2 className="w-5 h-5" />,
        roles: ['ADMIN'],
    },
    {
        label: 'Tipos de Documento',
        href: '/admin/tipo-documentos',
        icon: <FileType className="w-5 h-5" />,
        roles: ['ADMIN'],
    },
    {
        label: 'Estadísticas',
        href: '/admin/estadisticas',
        icon: <BarChart3 className="w-5 h-5" />,
        roles: ['ADMIN'],
    },

    // Responsable navigation
    {
        label: 'Dashboard',
        href: '/responsable',
        icon: <Home className="w-5 h-5" />,
        roles: ['RESP'],
    },
    {
        label: 'Enviar Documento',
        href: '/responsable/tramites/nuevo',
        icon: <Send className="w-5 h-5" />,
        roles: ['RESP'],
    },
    {
        label: 'Mis Trámites',
        href: '/responsable/tramites',
        icon: <FileText className="w-5 h-5" />,
        roles: ['RESP'],
    },
    {
        label: 'Observaciones',
        href: '/responsable/observaciones',
        icon: <MessageSquare className="w-5 h-5" />,
        roles: ['RESP'],
    },
    {
        label: 'Estadísticas',
        href: '/responsable/estadisticas',
        icon: <BarChart3 className="w-5 h-5" />,
        roles: ['RESP'],
    },

    // Trabajador navigation
    {
        label: 'Dashboard',
        href: '/trabajador',
        icon: <Home className="w-5 h-5" />,
        roles: ['TRAB'],
    },
    {
        label: 'Mis Documentos',
        href: '/trabajador/tramites',
        icon: <FileText className="w-5 h-5" />,
        roles: ['TRAB'],
    },
    {
        label: 'Mis Observaciones',
        href: '/trabajador/observaciones',
        icon: <MessageSquare className="w-5 h-5" />,
        roles: ['TRAB'],
    },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { currentRole, getRoleName } = useRole();

    const filteredNavItems = navItems.filter((item) =>
        item.roles.includes(currentRole || '')
    );

    const isActive = (href: string) => {
        if (href === '/admin' || href === '/responsable' || href === '/trabajador') {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    return (
        <>
            {/* Overlay para mobile con blur */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 z-30
                    h-screen w-72 bg-white border-r border-gray-200/50
                    transition-all duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Header mobile mejorado */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">Menú</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/80 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* User info card - solo desktop */}
                <div className="hidden lg:block p-4 mt-10 mb-2">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                <span className="text-white font-semibold text-sm">
                                    {currentRole?.charAt(0)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-600 mb-0.5">
                                    Perfil actual
                                </p>
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {getRoleName(currentRole || '')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation mejorada */}
                <nav className="p-4 space-y-1.5 overflow-y-auto h-[calc(100vh-180px)] lg:h-[calc(100vh-240px)]">
                    {/* Label de sección */}
                    <div className="px-3 mb-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Navegación
                        </p>
                    </div>

                    {filteredNavItems.map((item) => {
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`
                                    group relative flex items-center gap-3 px-4 py-3 rounded-xl
                                    transition-all duration-200
                                    ${
                                    active
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200'
                                        : 'text-gray-700 hover:bg-gray-50 hover:translate-x-1'
                                }
                                `}
                            >
                                {/* Icon container */}
                                <div className={`
                                    flex-shrink-0 transition-transform duration-200
                                    ${active ? '' : 'group-hover:scale-110'}
                                `}>
                                    {item.icon}
                                </div>

                                {/* Label */}
                                <span className={`
                                    flex-1 text-sm font-medium
                                    ${active ? 'font-semibold' : ''}
                                `}>
                                    {item.label}
                                </span>

                                {/* Arrow indicator for active */}
                                {active && (
                                    <ChevronRight className="w-4 h-4 animate-pulse" />
                                )}

                                {/* Badge opcional */}
                                {item.badge && (
                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                                        {item.badge}
                                    </span>
                                )}

                                {/* Hover effect line */}
                                {!active && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-500 rounded-r-full transition-all duration-200 group-hover:h-8" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer con versión */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>© 2025 Sistema SGD</span>
                        <span className="font-mono">v1.0.0</span>
                    </div>
                </div>
            </aside>
        </>
    );
}