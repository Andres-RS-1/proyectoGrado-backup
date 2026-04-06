import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  TrendingDown,
  TrendingUp,
  BarChart3,
  DollarSign,
  Clock,
  ArrowDownRight,
  Info,
  Lightbulb,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from 'recharts';
import type { ConsumptionData } from '../App';
import { motion } from 'motion/react';
import { format, subDays, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface StatisticsProps {
  consumptionData: ConsumptionData[];
  onNavigate: (
    screen: 'dashboard' | 'statistics' | 'alerts' | 'recommendations' | 'environmental'
  ) => void;
  isDarkMode: boolean;
}

export default function Statistics({
  consumptionData,
  onNavigate,
  isDarkMode,
}: StatisticsProps) {
  const safeNumber = (value: unknown): number => {
    if (value === null || value === undefined) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return Number.isNaN(num) ? 0 : Number(num.toFixed(2));
  };

  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthData = consumptionData.filter(
      (d) => d.fecha.getMonth() === currentMonth && d.fecha.getFullYear() === currentYear
    );

    const monthlyConsumption = currentMonthData.reduce((sum, d) => sum + d.consumo_kwh, 0);
    const estimatedCost = currentMonthData.reduce((sum, d) => sum + d.costo_cop, 0);

    const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const previousMonth = previousMonthDate.getMonth();
    const previousMonthYear = previousMonthDate.getFullYear();

    const previousMonthData = consumptionData.filter(
      (d) =>
        d.fecha.getMonth() === previousMonth && d.fecha.getFullYear() === previousMonthYear
    );

    const previousConsumption = previousMonthData.reduce((sum, d) => sum + d.consumo_kwh, 0);

    const savingsPercentage =
      previousConsumption > 0
        ? ((previousConsumption - monthlyConsumption) / previousConsumption) * 100
        : 0;

    const lowConsumptionThreshold = 2;
    const hoursInSavingsMode = currentMonthData.filter(
      (d) => d.consumo_kwh < lowConsumptionThreshold
    ).length;

    return {
      monthlyConsumption: safeNumber(monthlyConsumption),
      estimatedCost: Math.round(estimatedCost),
      savingsPercentage: safeNumber(savingsPercentage),
      hoursInSavingsMode,
    };
  }, [consumptionData]);

  const weeklyComparison = useMemo(() => {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { locale: es, weekStartsOn: 1 });
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return days.map((day, index) => {
      const currentDate = addDays(currentWeekStart, index);
      const previousDate = subDays(currentDate, 7);

      const isCurrentDay =
        format(currentDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

      const currentDayData = consumptionData.filter((d) => {
        const sameDay =
          format(d.fecha, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');

        if (!sameDay) return false;

        if (isCurrentDay) {
          return d.fecha <= now;
        }

        return true;
      });

      const previousDayData = consumptionData.filter((d) => {
        const sameDay =
          format(d.fecha, 'yyyy-MM-dd') === format(previousDate, 'yyyy-MM-dd');

        if (!sameDay) return false;

        if (isCurrentDay) {
          const limitHour = now.getHours();
          const limitMinute = now.getMinutes();

          return (
            d.fecha.getHours() < limitHour ||
            (d.fecha.getHours() === limitHour && d.fecha.getMinutes() <= limitMinute)
          );
        }

        return true;
      });

      const currentTotal = currentDayData.reduce((sum, d) => sum + d.consumo_kwh, 0);
      const previousTotal = previousDayData.reduce((sum, d) => sum + d.consumo_kwh, 0);

      return {
        day,
        currentWeek: safeNumber(currentTotal),
        previousWeek: safeNumber(previousTotal),
      };
    });
  }, [consumptionData]);

  const combinedChartData = useMemo(() => {
    const now = new Date();

    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      const dayData = consumptionData.filter(
        (d) => format(d.fecha, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );

      const total = dayData.reduce((sum, d) => sum + d.consumo_kwh, 0);
      const promedio = dayData.length > 0 ? total / dayData.length : 0;
      const umbral = promedio > 0 ? promedio * 1.15 : 25;

      return {
        date: format(date, 'dd/MM'),
        total: safeNumber(total),
        promedio: safeNumber(promedio),
        umbral: safeNumber(umbral),
      };
    });
  }, [consumptionData]);

  const trendChartData = useMemo(() => {
    const historical = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      const dayData = consumptionData.filter(
        (d) => format(d.fecha, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );

      const total = dayData.reduce((sum, d) => sum + d.consumo_kwh, 0);

      return {
        date: format(date, 'dd/MM'),
        consumo: safeNumber(total),
        proyeccion: null as number | null,
      };
    });

    const recentRecords = consumptionData.slice(-24);
    const recentAverage =
      recentRecords.length > 0
        ? recentRecords.reduce((sum, d) => sum + d.consumo_kwh, 0) / recentRecords.length
        : 0;

    const recentTrend =
      recentRecords.length > 1
        ? (recentRecords[recentRecords.length - 1].consumo_kwh -
            recentRecords[0].consumo_kwh) /
          recentRecords.length
        : 0;

    const lastHistoricalValue = historical[historical.length - 1]?.consumo ?? 0;

    const projection = Array.from({ length: 3 }, (_, i) => {
      const date = addDays(new Date(), i + 1);

      const projectedValue = Math.max(
        0,
        lastHistoricalValue + recentAverage * 0.2 + recentTrend * (i + 1) * 4
      );

      return {
        date: format(date, 'dd/MM'),
        consumo: null as number | null,
        proyeccion: safeNumber(projectedValue),
      };
    });

    return [...historical, ...projection];
  }, [consumptionData]);

  const insights = useMemo(() => {
    const messages: string[] = [];

    if (metrics.savingsPercentage > 5) {
      messages.push('Excelente reducción de consumo frente al mes anterior.');
    } else if (metrics.savingsPercentage < -5) {
      messages.push('Se detecta un aumento del consumo; conviene revisar cargas críticas y horarios pico.');
    } else {
      messages.push('El consumo se mantiene relativamente estable durante el periodo analizado.');
    }

    if (metrics.monthlyConsumption > 800) {
      messages.push('El consumo mensual es alto para una PYME y puede requerir medidas de optimización.');
    } else if (metrics.monthlyConsumption < 400) {
      messages.push('El nivel de consumo es eficiente para la escala operativa actual.');
    }

    if (consumptionData.length > 0) {
      const peakHourMap = consumptionData.reduce((acc, d) => {
        const hour = d.fecha.getHours();
        acc[hour] = (acc[hour] || 0) + d.consumo_kwh;
        return acc;
      }, {} as Record<number, number>);

      const peakHourEntry = Object.entries(peakHourMap).reduce(
        (max, curr) => (curr[1] > max[1] ? curr : max),
        ['0', 0]
      );

      messages.push(
        `La hora con mayor demanda registrada es alrededor de las ${peakHourEntry[0]}:00.`
      );
    }

    messages.push('Conviene cruzar estos datos con procesos operativos, turnos y uso de equipos principales.');

    return messages;
  }, [metrics, consumptionData]);

  const currentWeekTotal = weeklyComparison.reduce((sum, d) => sum + (d.currentWeek || 0), 0);
  const previousWeekTotal = weeklyComparison.reduce((sum, d) => sum + d.previousWeek, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Estadísticas de Consumo
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Análisis energético de ProyectoGrado para seguimiento de consumo, costos y tendencias.
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => onNavigate('dashboard')} variant="outline">
            Dashboard
          </Button>
          <Button onClick={() => onNavigate('statistics')} className="bg-blue-600 hover:bg-blue-700">
            Estadísticas
          </Button>
          <Button onClick={() => onNavigate('alerts')} variant="outline">
            Alertas
          </Button>
          <Button onClick={() => onNavigate('recommendations')} variant="outline">
            Recomendaciones
          </Button>
          <Button onClick={() => onNavigate('environmental')} variant="outline">
            Impacto Ambiental
          </Button>
        </div>
      </motion.div>

      {consumptionData.length === 0 ? (
        <div className="max-w-7xl mx-auto text-center py-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block"
          >
            <BarChart3 className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-6 animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-bold text-slate-500 dark:text-slate-400 mb-2">
              Sin datos de consumo
            </h2>
            <p className="text-lg text-slate-400 dark:text-slate-500 mb-6 max-w-md mx-auto">
              Activa el modo de desarrollo o la conexión de datos desde el dashboard para visualizar estadísticas.
            </p>
            <Button onClick={() => onNavigate('dashboard')} className="bg-blue-600 hover:bg-blue-700">
              <Zap className="w-4 h-4 mr-2" />
              Ir al Dashboard
            </Button>
          </motion.div>
        </div>
      ) : (
        <motion.div
          className="max-w-7xl mx-auto space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="dark:bg-slate-800 dark:border-slate-700 border-l-4 border-l-blue-600">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Consumo mensual</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {metrics.monthlyConsumption}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">kWh</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Badge variant="secondary" className="text-xs">
                    Mes actual
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 dark:border-slate-700 border-l-4 border-l-emerald-600">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Costo estimado</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      ${metrics.estimatedCost.toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">COP</p>
                  </div>
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Badge variant="secondary" className="text-xs">
                    Acumulado mensual
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 dark:border-slate-700 border-l-4 border-l-amber-500">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Variación mensual</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {metrics.savingsPercentage >= 0 ? (
                        <ArrowDownRight className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <TrendingUp className="w-6 h-6 text-rose-500" />
                      )}
                      {Math.abs(metrics.savingsPercentage)}%
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">vs mes anterior</p>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl">
                    {metrics.savingsPercentage >= 0 ? (
                      <TrendingDown className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <TrendingUp className="w-6 h-6 text-rose-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 dark:border-slate-700 border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Horas eficientes</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {metrics.hoursInSavingsMode}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">&lt; 2 kWh</p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <TooltipProvider>
                    <TooltipUI>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="text-xs cursor-help">
                          <Info className="w-3 h-3 mr-1" />
                          Eficiencia
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Periodos con bajo nivel de consumo relativo.</p>
                      </TooltipContent>
                    </TooltipUI>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="dark:text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Análisis combinado
                  </CardTitle>
                  <CardDescription className="dark:text-slate-400">
                    Total diario, promedio y umbral recomendado en los últimos 7 días
                  </CardDescription>
                </div>
                <TooltipProvider>
                  <TooltipUI>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Azul: consumo total diario, verde: promedio, rojo: umbral de referencia.
                      </p>
                    </TooltipContent>
                  </TooltipUI>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={combinedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                    stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                  />
                  <YAxis
                    tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                    stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                    label={{
                      value: 'kWh',
                      angle: -90,
                      position: 'insideLeft',
                      fill: isDarkMode ? '#94a3b8' : '#64748b',
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                      borderRadius: '12px',
                      color: isDarkMode ? '#ffffff' : '#000000',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="total"
                    fill="#3b82f6"
                    name="Consumo total"
                    radius={[8, 8, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="promedio"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                    name="Promedio"
                  />
                  <Line
                    type="monotone"
                    dataKey="umbral"
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', r: 3 }}
                    name="Umbral"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Tendencia y proyección
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Histórico de 14 días y proyección de 3 días
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendChartData}>
                    <defs>
                      <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                      stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                    />
                    <YAxis
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                      stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="consumo"
                      stroke="#10b981"
                      fill="url(#trendArea)"
                      strokeWidth={3}
                      name="Histórico"
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="proyeccion"
                      stroke="#f59e0b"
                      strokeDasharray="5 5"
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', r: 4 }}
                      name="Proyección"
                      connectNulls={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5 text-blue-600" />
                  Comparación semanal
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Semana actual frente a semana anterior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                      stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                    />
                    <YAxis
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                      stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '12px',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="previousWeek"
                      fill="#94a3b8"
                      name="Semana anterior"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="currentWeek"
                      fill="#3b82f6"
                      name="Semana actual"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {currentWeekTotal < previousWeekTotal
                      ? 'Consumo semanal reducido frente a la semana anterior.'
                      : 'Consumo semanal superior al de la semana anterior.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="dark:bg-slate-800 dark:border-slate-700 border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Insights inteligentes
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Interpretación automática de los patrones de consumo registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                  >
                    <div className="text-xl mt-0.5">💡</div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                      {insight}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Sugerencia operativa
                  </p>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Prioriza la revisión de equipos de mayor carga durante la hora pico para identificar oportunidades de reducción en consumo y costo.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}