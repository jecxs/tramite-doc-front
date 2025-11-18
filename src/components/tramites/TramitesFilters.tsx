// src/components/tramites/TramitesFilters.tsx
'use client';

import { useState } from 'react';
import { Search, Filter, X, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ProcedureFilters } from '@/types';
import { PROCEDURE_STATE_LABELS, PROCEDURE_STATES } from '@/lib/constants';

interface TramitesFiltersProps {
    onApplyFilters: (filters: ProcedureFilters) => void;
    showSenderFilter?: boolean;
    showReceiverFilter?: boolean;
}

export default function TramitesFilters({
                                            onApplyFilters,
                                            showSenderFilter = false,
                                            showReceiverFilter = false,
                                        }: TramitesFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedEstado, setSelectedEstado] = useState<string>('');
    const [requiereFirma, setRequiereFirma] = useState<boolean | undefined>(undefined);
    const [esReenvio, setEsReenvio] = useState<boolean | undefined>(undefined);

    const handleApply = () => {
        const filters: ProcedureFilters = {};

        if (search.trim()) {
            filters.search = search.trim();
        }

        if (selectedEstado) {
            filters.estado = selectedEstado as any;
        }

        if (requiereFirma !== undefined) {
            filters.requiere_firma = requiereFirma;
        }

        if (esReenvio !== undefined) {
            filters.es_reenvio = esReenvio;
        }

        onApplyFilters(filters);
        setIsOpen(false);
    };

    const handleClear = () => {
        setSearch('');
        setSelectedEstado('');
        setRequiereFirma(undefined);
        setEsReenvio(undefined);
        onApplyFilters({});
        setIsOpen(false);
    };

    const hasActiveFilters = search || selectedEstado || requiereFirma !== undefined || esReenvio !== undefined;

    return (
        <div className="relative">
            {/* Search Bar */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por código o asunto..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <Button
                    type="button"
                    variant={hasActiveFilters ? 'primary' : 'outline'}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Filter className="w-4 h-4" />
                    Filtros
                    {hasActiveFilters && (
                        <span className="ml-1 bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                            !
                        </span>
                    )}
                </Button>
            </div>

            {/* Filters Panel */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Filtros Avanzados</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded hover:bg-gray-100"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                            {/* Estado */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado
                                </label>
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedEstado('')}
                                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                                            selectedEstado === ''
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        Todos los estados
                                    </button>
                                    {Object.entries(PROCEDURE_STATE_LABELS).map(([key, label]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setSelectedEstado(key)}
                                            className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                                                selectedEstado === key
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">{label}</span>
                                                {selectedEstado === key && (
                                                    <Check className="w-4 h-4 text-blue-600" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Requiere Firma */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Requiere Firma
                                </label>
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => setRequiereFirma(undefined)}
                                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                                            requiereFirma === undefined
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        Todos
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRequiereFirma(true)}
                                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                                            requiereFirma === true
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        Sí requiere firma
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRequiereFirma(false)}
                                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                                            requiereFirma === false
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        No requiere firma
                                    </button>
                                </div>
                            </div>

                            {/* Es Reenvío */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Envío
                                </label>
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => setEsReenvio(undefined)}
                                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                                            esReenvio === undefined
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        Todos
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEsReenvio(true)}
                                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                                            esReenvio === true
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        Solo reenvíos
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEsReenvio(false)}
                                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                                            esReenvio === false
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        Solo envíos originales
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClear}
                                className="flex-1"
                            >
                                Limpiar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleApply}
                                className="flex-1"
                            >
                                Aplicar
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}