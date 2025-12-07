// src/components/ui/WorkerSelector.tsx
// Componente reutilizable para selección de trabajadores
// con búsqueda y agrupación por área

'use client';

import { useState, useMemo } from 'react';
import { Search, Users, Building2, X, Check } from 'lucide-react';

interface User {
  id_usuario: string;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  telefono?: string;
  area?: {
    id_area: string;
    nombre: string;
  };
  nombre_completo?: string;
}

interface WorkerSelectorProps {
  workers: User[];
  selectedWorkerId: string;
  onSelect: (workerId: string) => void;
  error?: string;
  required?: boolean;
}

const WorkerSelector: React.FC<WorkerSelectorProps> = ({
  workers,
  selectedWorkerId,
  onSelect,
  error,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Agrupar trabajadores por área
  const workersByArea = useMemo(() => {
    const grouped = workers.reduce(
      (acc, worker) => {
        const areaName = worker.area?.nombre || 'Sin área';
        if (!acc[areaName]) {
          acc[areaName] = [];
        }
        acc[areaName].push(worker);
        return acc;
      },
      {} as Record<string, User[]>,
    );

    // Ordenar áreas alfabéticamente
    return Object.keys(grouped)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = grouped[key];
          return acc;
        },
        {} as Record<string, User[]>,
      );
  }, [workers]);

  // Filtrar trabajadores por búsqueda
  const filteredWorkers = useMemo(() => {
    if (!searchTerm.trim()) return workersByArea;

    const term = searchTerm.toLowerCase();
    const filtered: Record<string, User[]> = {};

    Object.entries(workersByArea).forEach(([area, areaWorkers]) => {
      const matches = areaWorkers.filter(
        (w) =>
          w.nombres.toLowerCase().includes(term) ||
          w.apellidos.toLowerCase().includes(term) ||
          w.dni.includes(term) ||
          w.correo.toLowerCase().includes(term) ||
          area.toLowerCase().includes(term),
      );

      if (matches.length > 0) {
        filtered[area] = matches;
      }
    });

    return filtered;
  }, [workersByArea, searchTerm]);

  const selectedWorker = workers.find((w) => w.id_usuario === selectedWorkerId);

  const handleSelect = (workerId: string) => {
    onSelect(workerId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const totalResults = Object.values(filteredWorkers).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className='w-full'>
      {/* Label */}
      <label className='block text-sm font-medium text-gray-700 mb-2'>
        Destinatario (Trabajador)
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>

      {/* Selector Button */}
      <div className='relative'>
        <div
          role='button'
          onClick={() => setIsOpen(!isOpen)}
          className={`
                        w-full flex items-center justify-between px-4 py-3
                        border rounded-lg bg-white transition-colors
                        ${error ? 'border-red-300' : 'border-gray-300'}
                        ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''}
                        hover:border-blue-400
                    `}
        >
          {selectedWorker ? (
            <div className='flex items-center gap-3 flex-1 text-left'>
              <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <Users className='w-5 h-5 text-blue-600' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>
                  {selectedWorker.apellidos}, {selectedWorker.nombres}
                </p>
                <div className='flex items-center gap-2 text-xs text-gray-500'>
                  <Building2 className='w-3 h-3' />
                  <span className='truncate'>{selectedWorker.area?.nombre}</span>
                  <span>•</span>
                  <span>DNI: {selectedWorker.dni}</span>
                </div>
              </div>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect('');
                }}
                className='p-1 rounded hover:bg-gray-100'
              >
                <X className='w-4 h-4 text-gray-500' />
              </button>
            </div>
          ) : (
            <span className='text-gray-500'>Seleccione un trabajador...</span>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <>
            {/* Overlay */}
            <div className='fixed inset-0 z-10' onClick={() => setIsOpen(false)} />

            {/* Menu */}
            <div className='absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 flex flex-col'>
              {/* Search */}
              <div className='p-3 border-b border-gray-200'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Buscar por nombre, DNI, correo, área...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    autoFocus
                  />
                </div>
                <p className='text-xs text-gray-500 mt-2'>
                  {totalResults} trabajador{totalResults !== 1 ? 'es' : ''} encontrado
                  {totalResults !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Results */}
              <div className='overflow-y-auto flex-1'>
                {totalResults === 0 ? (
                  <div className='p-8 text-center text-gray-500'>
                    <Users className='w-12 h-12 mx-auto mb-3 text-gray-400' />
                    <p className='text-sm'>No se encontraron trabajadores</p>
                    <p className='text-xs mt-1'>Intente con otros términos de búsqueda</p>
                  </div>
                ) : (
                  <div className='py-2'>
                    {Object.entries(filteredWorkers).map(([area, areaWorkers]) => (
                      <div key={area}>
                        {/* Area Header */}
                        <div className='px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0'>
                          <div className='flex items-center gap-2 text-xs font-medium text-gray-700'>
                            <Building2 className='w-4 h-4' />
                            <span>{area}</span>
                            <span className='text-gray-500'>({areaWorkers.length})</span>
                          </div>
                        </div>

                        {/* Workers in Area */}
                        {areaWorkers.map((worker) => {
                          const isSelected = worker.id_usuario === selectedWorkerId;

                          return (
                            <button
                              key={worker.id_usuario}
                              type='button'
                              onClick={() => handleSelect(worker.id_usuario)}
                              className={`
                                                                w-full px-4 py-3 flex items-center gap-3
                                                                transition-colors hover:bg-blue-50
                                                                ${isSelected ? 'bg-blue-50' : ''}
                                                            `}
                            >
                              <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                                <Users className='w-5 h-5 text-blue-600' />
                              </div>
                              <div className='flex-1 text-left min-w-0'>
                                <p className='text-sm font-medium text-gray-900 truncate'>
                                  {worker.apellidos}, {worker.nombres}
                                </p>
                                <div className='flex items-center gap-2 text-xs text-gray-500'>
                                  <span>DNI: {worker.dni}</span>
                                  <span>•</span>
                                  <span className='truncate'>{worker.correo}</span>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className='w-5 h-5 text-blue-600 flex-shrink-0' />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className='mt-2 text-sm text-red-600 flex items-center gap-1'>
          <X className='w-4 h-4' />
          {error}
        </p>
      )}

      {/* Helper Text */}
      {!error && (
        <p className='mt-2 text-sm text-gray-500'>
          {workers.length} trabajador{workers.length !== 1 ? 'es' : ''} disponible
          {workers.length !== 1 ? 's' : ''} en todas las áreas
        </p>
      )}
    </div>
  );
};

export default WorkerSelector;
