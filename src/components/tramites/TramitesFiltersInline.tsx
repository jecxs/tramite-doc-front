'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ProcedureFilters } from '@/types';
import { PROCEDURE_STATE_LABELS } from '@/lib/constants';

interface TramitesFiltersInlineProps {
    onApplyFilters: (filters: ProcedureFilters) => void;
    onClearFilters?: () => void;
    currentFilters?: ProcedureFilters;
    showAdvanced: boolean;
    onToggleAdvanced: () => void;
}

export default function TramitesFiltersInline({
                                                  onApplyFilters,
                                                  onClearFilters,
                                                  currentFilters = {},
                                                  showAdvanced,
                                                  onToggleAdvanced,
                                              }: TramitesFiltersInlineProps) {
    const [search, setSearch] = useState(currentFilters.search || '');
    const [selectedEstado, setSelectedEstado] = useState<string>(currentFilters.estado || '');
    const [requiereFirma, setRequiereFirma] = useState<boolean | undefined>(currentFilters.requiere_firma);

    const handleApply = () => {
        const filters: ProcedureFilters = {};

        if (search.trim()) filters.search = search.trim();
        if (selectedEstado) filters.estado = selectedEstado as any;
        if (requiereFirma !== undefined) filters.requiere_firma = requiereFirma;

        onApplyFilters(filters);
    };

    const handleClear = () => {
        setSearch('');
        setSelectedEstado('');
        setRequiereFirma(undefined);

        if (onClearFilters) {
            onClearFilters();
        } else {
            onApplyFilters({});
        }
    };

    const hasActiveFilters = search || selectedEstado || requiereFirma !== undefined;

    return (
        <div className="space-y-4">
            {/* Filtros Básicos - Siempre visibles */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Búsqueda */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Buscar
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Código o asunto del trámite..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Estado */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado
                        </label>
                        <select
                            value={selectedEstado}
                            onChange={(e) => setSelectedEstado(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Todos</option>
                            {Object.entries(PROCEDURE_STATE_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Requiere Firma */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Firma
                        </label>
                        <select
                            value={requiereFirma === undefined ? '' : String(requiereFirma)}
                            onChange={(e) => setRequiereFirma(e.target.value === '' ? undefined : e.target.value === 'true')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Todos</option>
                            <option value="true">Requiere firma</option>
                            <option value="false">Sin firma</option>
                        </select>
                    </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onToggleAdvanced}
                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        {showAdvanced ? (
                            <>
                                <ChevronUp className="w-4 h-4" />
                                Ocultar filtros avanzados
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4" />
                                Mostrar filtros avanzados
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-3">
                        {hasActiveFilters && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                            >
                                <X className="w-4 h-4" />
                                Limpiar
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={handleApply}
                            size="sm"
                        >
                            Aplicar filtros
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mensaje de filtros activos */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Filtros activos:</span>
                    {search && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            Búsqueda: "{search}"
                            <button onClick={() => { setSearch(''); handleApply(); }} className="hover:text-blue-900">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {selectedEstado && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            Estado: {PROCEDURE_STATE_LABELS[selectedEstado as keyof typeof PROCEDURE_STATE_LABELS]}
                            <button onClick={() => { setSelectedEstado(''); handleApply(); }} className="hover:text-blue-900">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {requiereFirma !== undefined && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            {requiereFirma ? 'Con firma' : 'Sin firma'}
                            <button onClick={() => { setRequiereFirma(undefined); handleApply(); }} className="hover:text-blue-900">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}