'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface GraficoLineasProps {
    data: Array<{ fecha: string; cantidad: number }>;
    titulo?: string;
    altura?: number;
}

export default function GraficoLineas({ data, titulo, altura = 300 }: GraficoLineasProps) {
    const formatearFecha = (fecha: string) => {
        try {
            return format(new Date(fecha), 'dd MMM', { locale: es });
        } catch {
            return fecha;
        }
    };

    return (
        <div>
            {titulo && <h3 className="text-sm font-medium text-gray-700 mb-4">{titulo}</h3>}
            <ResponsiveContainer width="100%" height={altura}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="fecha"
                        tickFormatter={formatearFecha}
                        stroke="#6b7280"
                        fontSize={12}
                    />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                        }}
                        labelFormatter={formatearFecha}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="cantidad"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Trámites"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}