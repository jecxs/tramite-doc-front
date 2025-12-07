// src/components/ui/MultiWorkerSelector.tsx
'use client';

import { useState, useMemo } from 'react';
import { Search, Users, Building2, X, Check, UserPlus } from 'lucide-react';

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

interface MultiWorkerSelectorProps {
  workers: User[];
  selectedWorkerIds: string[];
  onSelect: (workerIds: string[]) => void;
  error?: string;
  required?: boolean;
}

const MultiWorkerSelector: React.FC<MultiWorkerSelectorProps> = ({
  workers,
  selectedWorkerIds,
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

  const selectedWorkers = workers.filter((w) => selectedWorkerIds.includes(w.id_usuario));

  const handleToggleWorker = (workerId: string) => {
    const isSelected = selectedWorkerIds.includes(workerId);
    if (isSelected) {
      onSelect(selectedWorkerIds.filter((id) => id !== workerId));
    } else {
      onSelect([...selectedWorkerIds, workerId]);
    }
  };

  const handleSelectArea = (areaWorkers: User[]) => {
    const areaWorkerIds = areaWorkers.map((w) => w.id_usuario);
    const allSelected = areaWorkerIds.every((id) => selectedWorkerIds.includes(id));

    if (allSelected) {
      // Deseleccionar todos del área
      onSelect(selectedWorkerIds.filter((id) => !areaWorkerIds.includes(id)));
    } else {
      // Seleccionar todos del área
      const newSelected = [...selectedWorkerIds];
      areaWorkerIds.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      onSelect(newSelected);
    }
  };

  const handleSelectAll = () => {
    const allWorkerIds = Object.values(filteredWorkers)
      .flat()
      .map((w) => w.id_usuario);

    if (selectedWorkerIds.length === workers.length) {
      onSelect([]);
    } else {
      onSelect(allWorkerIds);
    }
  };

  const handleRemoveWorker = (workerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(selectedWorkerIds.filter((id) => id !== workerId));
  };

  const totalResults = Object.values(filteredWorkers).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className='w-full'>
      {/* Label */}
      <label className='block text-sm font-medium text-gray-700 mb-2'>
        Destinatarios (Trabajadores)
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>

      {/* Selector Button */}
      <div className='relative'>
        <button
          type='button'
          onClick={() => setIsOpen(!isOpen)}
          className={`
                        w-full flex items-center justify-between px-4 py-3
                        border rounded-lg bg-white transition-colors min-h-[50px]
                        ${error ? 'border-red-300' : 'border-gray-300'}
                        ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''}
                        hover:border-blue-400
                    `}
        >
          {selectedWorkers.length === 0 ? (
            <span className='text-gray-500'>Seleccione trabajadores...</span>
          ) : (
            <div className='flex items-center gap-2 flex-wrap flex-1'>
              {selectedWorkers.slice(0, 3).map((worker) => (
                <span
                  key={worker.id_usuario}
                  className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm'
                >
                  {worker.apellidos}, {worker.nombres}
                  <button
                    type='button'
                    onClick={(e) => handleRemoveWorker(worker.id_usuario, e)}
                    className='hover:bg-blue-200 rounded'
                  >
                    <X className='w-3 h-3' />
                  </button>
                </span>
              ))}
              {selectedWorkers.length > 3 && (
                <span className='text-sm text-gray-600'>+{selectedWorkers.length - 3} más</span>
              )}
            </div>
          )}
          <UserPlus className='w-5 h-5 text-gray-400 ml-2' />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            {/* Overlay */}
            <div className='fixed inset-0 z-10' onClick={() => setIsOpen(false)} />

            {/* Menu */}
            <div className='absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 flex flex-col'>
              {/* Search & Actions */}
              <div className='p-3 border-b border-gray-200 space-y-2'>
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
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-gray-500'>
                    {selectedWorkerIds.length} de {totalResults} seleccionados
                  </span>
                  <button
                    type='button'
                    onClick={handleSelectAll}
                    className='text-blue-600 hover:text-blue-700 font-medium'
                  >
                    {selectedWorkerIds.length === workers.length
                      ? 'Deseleccionar todos'
                      : 'Seleccionar todos'}
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className='overflow-y-auto flex-1'>
                {totalResults === 0 ? (
                  <div className='p-8 text-center text-gray-500'>
                    <Users className='w-12 h-12 mx-auto mb-3 text-gray-400' />
                    <p className='text-sm'>No se encontraron trabajadores</p>
                  </div>
                ) : (
                  <div className='py-2'>
                    {Object.entries(filteredWorkers).map(([area, areaWorkers]) => {
                      const allAreaSelected = areaWorkers.every((w) =>
                        selectedWorkerIds.includes(w.id_usuario),
                      );

                      return (
                        <div key={area}>
                          {/* Area Header */}
                          <div className='px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-2 text-xs font-medium text-gray-700'>
                                <Building2 className='w-4 h-4' />
                                <span>{area}</span>
                                <span className='text-gray-500'>({areaWorkers.length})</span>
                              </div>
                              <button
                                type='button'
                                onClick={() => handleSelectArea(areaWorkers)}
                                className='text-xs text-blue-600 hover:text-blue-700'
                              >
                                {allAreaSelected ? 'Deseleccionar' : 'Seleccionar'} área
                              </button>
                            </div>
                          </div>

                          {/* Workers in Area */}
                          {areaWorkers.map((worker) => {
                            const isSelected = selectedWorkerIds.includes(worker.id_usuario);

                            return (
                              <button
                                key={worker.id_usuario}
                                type='button'
                                onClick={() => handleToggleWorker(worker.id_usuario)}
                                className={`
                                                                    w-full px-4 py-3 flex items-center gap-3
                                                                    transition-colors hover:bg-blue-50
                                                                    ${isSelected ? 'bg-blue-50' : ''}
                                                                `}
                              >
                                <div
                                  className={`
                                                                        w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                                                                        ${
                                                                          isSelected
                                                                            ? 'bg-blue-600 border-blue-600'
                                                                            : 'border-gray-300'
                                                                        }
                                                                    `}
                                >
                                  {isSelected && <Check className='w-3 h-3 text-white' />}
                                </div>
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
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
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
          {selectedWorkerIds.length > 0
            ? `${selectedWorkerIds.length} trabajador${selectedWorkerIds.length !== 1 ? 'es' : ''} seleccionado${selectedWorkerIds.length !== 1 ? 's' : ''}`
            : `${workers.length} trabajador${workers.length !== 1 ? 'es' : ''} disponible${workers.length !== 1 ? 's' : ''}`}
        </p>
      )}
    </div>
  );
};

export default MultiWorkerSelector;
