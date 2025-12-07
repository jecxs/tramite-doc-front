/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { obtenerEstadisticasRespuestas } from '@/lib/api/respuesta-tramite';
import { EstadisticasRespuestas as Stats } from '@/types';

interface EstadisticasRespuestasProps {
  idRemitente?: string;
  idArea?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export default function EstadisticasRespuestas({
  idRemitente,
  idArea,
  fechaInicio,
  fechaFin,
}: EstadisticasRespuestasProps) {
  const [estadisticas, setEstadisticas] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarEstadisticas();
  }, [idRemitente, idArea, fechaInicio, fechaFin]);

  const cargarEstadisticas = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filtros: Record<string, string> = {};
      if (idRemitente) filtros.id_remitente = idRemitente;
      if (idArea) filtros.id_area = idArea;
      if (fechaInicio) filtros.fecha_inicio = fechaInicio;
      if (fechaFin) filtros.fecha_fin = fechaFin;

      const data = await obtenerEstadisticasRespuestas(filtros);
      setEstadisticas(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse'
          >
            <div className='h-4 bg-gray-200 rounded w-1/2 mb-4'></div>
            <div className='h-8 bg-gray-200 rounded w-3/4'></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
        <p className='text-sm text-red-800'>Error: {error}</p>
      </div>
    );
  }

  if (!estadisticas) {
    return null;
  }

  return (
    <div className='space-y-6'>
      {/* Cards de estadísticas principales */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Total de respuestas */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
              <Users className='w-6 h-6 text-blue-600' />
            </div>
          </div>
          <p className='text-sm text-gray-600 mb-1'>Total de Respuestas</p>
          <p className='text-3xl font-bold text-gray-900'>{estadisticas.total}</p>
        </div>

        {/* Respuestas conformes */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
              <CheckCircle className='w-6 h-6 text-green-600' />
            </div>
            <span className='text-sm font-medium text-green-600'>
              {estadisticas.porcentajeConformes.toFixed(1)}%
            </span>
          </div>
          <p className='text-sm text-gray-600 mb-1'>Conformes</p>
          <p className='text-3xl font-bold text-gray-900'>{estadisticas.conformes}</p>
        </div>

        {/* Respuestas con observaciones */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
              <AlertCircle className='w-6 h-6 text-orange-600' />
            </div>
            <span className='text-sm font-medium text-orange-600'>
              {estadisticas.porcentajeNoConformes.toFixed(1)}%
            </span>
          </div>
          <p className='text-sm text-gray-600 mb-1'>Con Observaciones</p>
          <p className='text-3xl font-bold text-gray-900'>{estadisticas.noConformes}</p>
        </div>
      </div>

      {/* Gráfico de barras visual */}
      {estadisticas.total > 0 && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Distribución de Respuestas</h3>
          <div className='space-y-4'>
            {/* Barra de conformes */}
            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium text-gray-700'>Conformes</span>
                <span className='text-sm text-gray-600'>
                  {estadisticas.conformes} ({estadisticas.porcentajeConformes.toFixed(1)}%)
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-3'>
                <div
                  className='bg-green-500 h-3 rounded-full transition-all duration-500'
                  style={{
                    width: `${estadisticas.porcentajeConformes}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Barra de no conformes */}
            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium text-gray-700'>Con Observaciones</span>
                <span className='text-sm text-gray-600'>
                  {estadisticas.noConformes} ({estadisticas.porcentajeNoConformes.toFixed(1)}%)
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-3'>
                <div
                  className='bg-orange-500 h-3 rounded-full transition-all duration-500'
                  style={{
                    width: `${estadisticas.porcentajeNoConformes}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje si no hay datos */}
      {estadisticas.total === 0 && (
        <div className='bg-gray-50 rounded-lg p-8 text-center'>
          <TrendingUp className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <p className='text-sm font-medium text-gray-700 mb-2'>No hay respuestas registradas</p>
          <p className='text-xs text-gray-500'>
            Las estadísticas aparecerán cuando los trabajadores respondan a los documentos
          </p>
        </div>
      )}
    </div>
  );
}
