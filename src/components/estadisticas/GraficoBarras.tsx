'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface GraficoBarrasProps {
  data: Array<{ nombre: string; valor: number }>;
  titulo?: string;
  altura?: number;
  color?: string;
}

export default function GraficoBarras({
  data,
  titulo,
  altura = 300,
  color = '#3b82f6',
}: GraficoBarrasProps) {
  return (
    <div>
      {titulo && <h3 className='text-sm font-medium text-gray-700 mb-4'>{titulo}</h3>}
      <ResponsiveContainer width='100%' height={altura}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
          <XAxis dataKey='nombre' stroke='#6b7280' fontSize={12} />
          <YAxis stroke='#6b7280' fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey='valor' fill={color} radius={[8, 8, 0, 0]} name='Cantidad' />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
