'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface GraficoPastelProps {
    data: Array<{ name: string; value: number }>;
    titulo?: string;
    altura?: number;
}

const COLORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function GraficoPastel({ data, titulo, altura = 300 }: GraficoPastelProps) {
    return (
        <div>
            {titulo && <h3 className="text-sm font-medium text-gray-700 mb-4">{titulo}</h3>}
            <ResponsiveContainer width="100%" height={altura}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        // ✨ SOLUCIÓN: Aseguramos que 'percent' no es undefined antes de usarlo.
                        label={({ name, percent }) =>
                            typeof percent === 'number'
                                ? `${name}: ${(percent * 100).toFixed(0)}%`
                                : name // Puedes devolver solo el nombre o null si el porcentaje no está disponible
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}