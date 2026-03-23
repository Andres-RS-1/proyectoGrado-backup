import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  TrendingDown, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  Clock, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Lightbulb
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
  ReferenceLine
} from 'recharts';
import type { ConsumptionData } from '../App';
import { motion } from 'motion/react';
import { format, subDays, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface StatisticsProps {
  consumptionData: ConsumptionData[];
  onNavigate: (screen: 'dashboard' | 'statistics' | 'alerts' | 'recommendations' | 'environmental') => void;
  isDarkMode: boolean;
}

export default function Statistics({ consumptionData, onNavigate, isDarkMode }: StatisticsProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const safeParseFloat = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (isNaN(num)) return 0;
    return parseFloat(num.toFixed(2));
};

  // Calculate KPI metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentMonthData = consumptionData.filter(d => d.fecha.getMonth() === currentMonth);
    
    // Monthly consumption in kWh
    const monthlyConsumption = currentMonthData.reduce((sum, d) => sum + d.consumo_watts, 0) / 1000;
    
    // Estimated cost (assuming $600 COP per kWh in Bogotá)
    const estimatedCost = monthlyConsumption * 600;
    
    // Calculate savings vs previous month
    const previousMonth = currentMonth - 1;
    const previousMonthData = consumptionData.filter(d => d.fecha.getMonth() === previousMonth);
    const previousConsumption = previousMonthData.reduce((sum, d) => sum + d.consumo_watts, 0) / 1000;
    const savingsPercentage = previousConsumption > 0 
      ? ((previousConsumption - monthlyConsumption) / previousConsumption) * 100 
      : 0;
    
    // Time in savings mode (hours below 1000W)
    const hoursInSavingsMode = currentMonthData.filter(d => d.consumo_watts < 1000).length;
    
    return {
      monthlyConsumption: monthlyConsumption.toFixed(1),
      estimatedCost: estimatedCost.toFixed(0),
      savingsPercentage: savingsPercentage.toFixed(1),
      hoursInSavingsMode
    };
  }, [consumptionData]);

  // Weekly comparison data
  const weeklyComparison = useMemo(() => {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { locale: es });
    const currentWeekEnd = endOfWeek(now, { locale: es });
    const previousWeekStart = subDays(currentWeekStart, 7);
    const previousWeekEnd = subDays(currentWeekEnd, 7);

    const currentWeekData = consumptionData.filter(
      d => d.fecha >= currentWeekStart && d.fecha <= currentWeekEnd
    );
    const previousWeekData = consumptionData.filter(
      d => d.fecha >= previousWeekStart && d.fecha <= previousWeekEnd
    );

  const getDayData = (data: ConsumptionData[], startDate: Date) => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return days.map((day, index) => {
      const dayDate = addDays(startDate, index);
      
      // Current week: consumo simplificado como en tu código actual
      const currentDayData = data.filter(d => 
        format(d.fecha, 'yyyy-MM-dd') === format(dayDate, 'yyyy-MM-dd')
      );
      const currentTotal = currentDayData.reduce((sum, d) => sum + d.consumo_watts, 0) / 1000 || 0;
      
      // Previous week: misma lógica simplificada y robusta
      const prevDayDate = subDays(dayDate, 7);
      const prevDayData = data.filter(d => 
        format(d.fecha, 'yyyy-MM-dd') === format(prevDayDate, 'yyyy-MM-dd')
      );
      const prevTotal = prevDayData.reduce((sum, d) => sum + d.consumo_watts, 0) / 1000 || 0;
      
      return {
        day,
        currentWeek: index <= new Date().getDay() ? safeParseFloat(currentTotal.toFixed(2)) : null,
        previousWeek: safeParseFloat(prevTotal.toFixed(2))
    };
  });
};


    return getDayData(currentWeekData, currentWeekStart);
  }, [consumptionData]);

  // Combined chart data (bars + lines)
  const combinedChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayData = consumptionData.filter(d => 
        format(d.fecha, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      const total = dayData.reduce((sum, d) => sum + d.consumo_watts, 0) / 1000;
      const average = dayData.length > 0 ? total / dayData.length : 0;
      
      return {
        date: format(date, 'dd/MM'),
        total: safeParseFloat(total.toFixed(2)),
        promedio: safeParseFloat(average.toFixed(2)),
        umbral: 1.0 // 1kWh threshold
      };
    });
    
    return last7Days;
  }, [consumptionData]);

  // Trend chart with projection
  const trendChartData = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      const dayData = consumptionData.filter(d => 
        format(d.fecha, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      const total = dayData.reduce((sum, d) => sum + d.consumo_watts, 0) / 1000;
      
      return {
        date: format(date, 'dd/MM'),
        consumo: safeParseFloat(total.toFixed(2)),
        tipo: 'real'
      };
    });

    // Calculate projection for next 3 days
    const recentData = last14Days.slice(-7).map(d => d.consumo);
    const avgRecent = recentData.reduce((a, b) => a + b, 0) / recentData.length;
    const trend = (recentData[recentData.length - 1] - recentData[0]) / recentData.length;

    const projection = Array.from({ length: 3 }, (_, i) => {
      const date = addDays(new Date(), i + 1);
      return {
        date: format(date, 'dd/MM'),
        consumo: null,
        proyeccion: safeParseFloat((avgRecent + trend * (i + 1)).toFixed(2)),
        tipo: 'proyectado'
      };
    });

    return [...last14Days, ...projection];
  }, [consumptionData]);

  // Dynamic insights
  const insights = useMemo(() => {
    const savingsNum = safeParseFloat(metrics.savingsPercentage);
    const consumption = safeParseFloat(metrics.monthlyConsumption);
    
    const messages = [];
    
    if (savingsNum > 5) {
      messages.push("¡Excelente! Has reducido tu consumo significativamente este mes.");
    } else if (savingsNum < -5) {
      messages.push("Tu consumo ha aumentado. Revisa las recomendaciones para optimizar.");
    } else {
      messages.push("Tu consumo se mantiene estable. Continúa con tus buenos hábitos.");
    }

    if (consumption > 300) {
      messages.push("Consumo elevado detectado. Considera desconectar aparatos en standby.");
    } else if (consumption < 150) {
      messages.push("¡Consumo muy eficiente! Estás por debajo del promedio nacional.");
    }

    const peakHour = consumptionData
      .reduce((acc, d) => {
        const hour = d.fecha.getHours();
        acc[hour] = (acc[hour] || 0) + d.consumo_watts;
        return acc;
      }, {} as Record<number, number>);
    
    const maxHour = Object.entries(peakHour).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    messages.push(`Tu hora pico de consumo es a las ${maxHour}:00. Planifica actividades de alto consumo fuera de este horario.`);

    return messages;
  }, [metrics, consumptionData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <div className="max-w-7xl mx-auto mb-8">
    <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        <h1 className="text-3xl text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-[#32a852]" />
          Estadísticas Avanzadas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Análisis profundo de tu consumo eléctrico</p>
      </div>
    </div>

    {/* Navigation */}
    <div className="flex gap-2 flex-wrap">
      <Button onClick={() => onNavigate('dashboard')} variant="outline">
        Panel Principal
      </Button>
      <Button onClick={() => onNavigate('statistics')} className="bg-[#32a852] hover:bg-[#2a8f46]">
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
  </div>

  {/* Skeleton si no hay datos - ANTES de Main Content */}
  {consumptionData.length === 0 && (
    <div className="max-w-7xl mx-auto text-center py-20">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-block"
      >
        <Sparkles className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6 animate-pulse" />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-500 dark:text-gray-400 mb-2">
          Sin datos de consumo
        </h2>
        <p className="text-lg text-gray-400 dark:text-gray-500 mb-6 max-w-md mx-auto">
          Activa el modo simulación en el Dashboard para ver estadísticas en tiempo real
        </p>
        <Button onClick={() => onNavigate('dashboard')} className="bg-[#32a852] hover:bg-[#2a8f46]">
          <Zap className="w-4 h-4 mr-2" />
          Ir al Dashboard
        </Button>
      </motion.div>
    </div>
  )}
</motion.div>
      </div>

      {/* Main Content */}
      <motion.div 
        className="max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* KPI Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Monthly Consumption */}
          <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-[#32a852]">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Consumo Mensual</p>
                  <p className="text-3xl text-gray-900 dark:text-white mb-1">
                    {metrics.monthlyConsumption}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">kWh</p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-[#32a852]/10 p-3 rounded-xl"
                >
                  <Zap className="w-6 h-6 text-[#32a852]" />
                </motion.div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Último mes
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Estimated Cost */}
          <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-[#0077b6]">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Costo Estimado</p>
                  <p className="text-3xl text-gray-900 dark:text-white mb-1">
                    ${parseInt(metrics.estimatedCost).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">COP</p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="bg-[#0077b6]/10 p-3 rounded-xl"
                >
                  <DollarSign className="w-6 h-6 text-[#0077b6]" />
                </motion.div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Tarifa promedio
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Energy Savings */}
          <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ahorro Energético</p>
                  <p className="text-3xl text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                    {safeParseFloat(metrics.savingsPercentage) >= 0 ? (
                      <ArrowDownRight className="w-6 h-6 text-green-500" />
                    ) : (
                      <ArrowUpRight className="w-6 h-6 text-red-500" />
                    )}
                    {Math.abs(safeParseFloat(metrics.savingsPercentage))}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">vs. mes anterior</p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-amber-500/10 p-3 rounded-xl"
                >
                  {safeParseFloat(metrics.savingsPercentage) >= 0 ? (
                    <TrendingDown className="w-6 h-6 text-green-500" />
                  ) : (
                    <TrendingUp className="w-6 h-6 text-red-500" />
                  )}
                </motion.div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${safeParseFloat(metrics.savingsPercentage) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                  {safeParseFloat(metrics.savingsPercentage) >= 0 ? 'Reducción' : 'Incremento'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Savings Mode Time */}
          <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Modo Ahorro</p>
                  <p className="text-3xl text-gray-900 dark:text-white mb-1">
                    {metrics.hoursInSavingsMode}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">horas activas</p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="bg-purple-500/10 p-3 rounded-xl"
                >
                  <Clock className="w-4 h-4 text-purple-500" />
                </motion.div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <TooltipProvider>
                  <TooltipUI>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="text-xs cursor-help">
                        <Info className="w-3 h-3 mr-1" />
                        {'<1000W'}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tiempo con consumo menor a 1000W</p>
                    </TooltipContent>
                  </TooltipUI>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Combined Chart (Bars + Lines) */}
        <motion.div variants={itemVariants}>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#32a852]" />
                    Análisis Combinado
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Consumo total, promedio y umbral máximo (últimos 7 días)
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
                        <strong>Verde:</strong> Consumo total diario<br/>
                        <strong>Azul:</strong> Promedio por hora<br/>
                        <strong>Rojo:</strong> Umbral recomendado
                      </p>
                    </TooltipContent>
                  </TooltipUI>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={combinedChartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#32a852" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#32a852" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="date" 
                    stroke={isDarkMode ? '#6b7280' : '#6b7280'}
                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                  />
                  <YAxis 
                    stroke={isDarkMode ? '#6b7280' : '#6b7280'}
                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                    label={{ 
                      value: 'kWh', 
                      angle: -90, 
                      position: 'insideLeft', 
                      fill: isDarkMode ? '#9ca3af' : '#6b7280' 
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      color: isDarkMode ? '#ffffff' : '#000000',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="total" 
                    fill="url(#colorTotal)" 
                    name="Consumo Total (kWh)" 
                    radius={[8, 8, 0, 0]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="promedio" 
                    stroke="#0077b6" 
                    strokeWidth={3}
                    dot={{ fill: '#0077b6', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Promedio (kWh)"
                  />
                  <ReferenceLine 
                    y={1.0} 
                    stroke="#ef4444" 
                    strokeDasharray="5 5" 
                    strokeWidth={2}
                    label={{ 
                      value: 'Umbral', 
                      position: 'right',
                      fill: '#ef4444'
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart with Projection */}
          <motion.div variants={itemVariants}>
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#32a852]" />
                  Tendencia y Proyección
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Historial de 14 días + proyección 3 días
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendChartData}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#32a852" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#32a852" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis 
                      dataKey="date" 
                      stroke={isDarkMode ? '#6b7280' : '#6b7280'}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke={isDarkMode ? '#6b7280' : '#6b7280'}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="consumo" 
                      stroke="#32a852" 
                      strokeWidth={3}
                      fill="url(#colorGradient)" 
                      name="Real"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="proyeccion" 
                      stroke="#0077b6" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#0077b6', r: 4 }}
                      name="Proyección"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#32a852] rounded-full"></div>
                    <span>Real</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-[#0077b6] border-dashed rounded-full"></div>
                    <span>Proyección</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Period Comparator */}
          <motion.div variants={itemVariants}>
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5 text-[#0077b6]" />
                  Comparador de Períodos
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Semana actual vs. semana anterior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis 
                      dataKey="day" 
                      stroke={isDarkMode ? '#6b7280' : '#6b7280'}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                    />
                    <YAxis 
                      stroke={isDarkMode ? '#6b7280' : '#6b7280'}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="previousWeek" 
                      fill="#94a3b8" 
                      name="Semana Anterior" 
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar 
                      dataKey="currentWeek" 
                      fill="#0077b6" 
                      name="Semana Actual" 
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    {weeklyComparison.reduce((sum, d) => sum + (d.currentWeek || 0), 0) < 
                     weeklyComparison.reduce((sum, d) => sum + d.previousWeek, 0) 
                      ? '📉 Consumo semanal reducido. ¡Excelente progreso!'
                      : '📈 Consumo semanal aumentado. Revisa tus hábitos energéticos.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Insights Section */}
        <motion.div variants={itemVariants}>
          <Card className="dark:bg-gray-800 dark:border-gray-700 border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Insights Inteligentes
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Análisis personalizado de tus patrones de consumo
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
                    className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                  >
                    <div className="text-2xl mt-0.5">💡</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                      {insight}
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-[#32a852]/10 rounded-lg border border-[#32a852]/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#32a852]" />
                  <p className="text-sm text-[#32a852]">Consejo del día</p>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Desconectar los cargadores cuando no estén en uso puede ahorrar hasta un 5% en tu factura mensual.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}