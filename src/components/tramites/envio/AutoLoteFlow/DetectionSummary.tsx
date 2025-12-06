import { CheckCircle, FileCheck, FileX, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface DetectionSummaryProps {
    exitososCount: number;
    fallidosCount: number;
    listosCount: number;
}

export default function DetectionSummary({
                                             exitososCount,
                                             fallidosCount,
                                             listosCount,
                                         }: DetectionSummaryProps) {
    const stats = [
        {
            label: 'Detectados',
            value: exitososCount,
            icon: FileCheck,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
        },
        {
            label: 'Fallidos',
            value: fallidosCount,
            icon: FileX,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
        },
        {
            label: 'Listos',
            value: listosCount,
            icon: Send,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
        },
    ];

    return (
        <Card className="border-2 border-emerald-200 shadow-md overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="font-semibold text-gray-900">
                            Detección Completa
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                    <div className="grid grid-cols-3 gap-4">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={stat.label}
                                    className={`
                                        relative group
                                        p-5 rounded-xl
                                        bg-white border-2 ${stat.borderColor}
                                        shadow-sm hover:shadow-md
                                        transition-all duration-300
                                        hover:scale-[1.02]
                                    `}
                                >
                                    {/* Icono decorativo */}
                                    <div className={`
                                        absolute top-3 right-3
                                        w-8 h-8 rounded-lg ${stat.bgColor}
                                        flex items-center justify-center
                                        opacity-60 group-hover:opacity-100
                                        transition-opacity duration-300
                                    `}>
                                        <Icon className={`w-4 h-4 ${stat.color}`} />
                                    </div>

                                    {/* Valor */}
                                    <p className={`
                                        text-4xl font-bold tracking-tight ${stat.color}
                                        mb-2
                                    `}>
                                        {stat.value}
                                    </p>

                                    {/* Label */}
                                    <p className="text-sm font-medium text-gray-600">
                                        {stat.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}