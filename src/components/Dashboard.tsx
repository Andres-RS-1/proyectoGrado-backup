import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  BarChart3,
  Activity,
  TrendingUp,
  Wifi,
  WifiOff,
  Database,
  LogOut,
  Moon,
  Sun,
  Download,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ConsumptionData, User } from '../App';
import { toast } from 'sonner';

interface DashboardProps {
  user: User;
  consumptionData: ConsumptionData[];
  threshold: number;
  onNavigate: (
    screen: 'dashboard' | 'statistics' | 'alerts' | 'recommendations' | 'environmental'
  ) => void;
  onLogout: () => void;
  isSimulationMode: boolean;
  onToggleSimulation: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Dashboard({
  user,
  consumptionData,
  threshold,
  onNavigate,
  onLogout,
  isSimulationMode,
  onToggleSimulation,
  isDarkMode,
  onToggleDarkMode,
}: DashboardProps) {
  const currentData =
    consumptionData.length > 0 ? consumptionData[consumptionData.length - 1] : null;

  const currentConsumptionKwh = currentData ? currentData.consumo_kwh.toFixed(2) : '0.00';
  const currentCostCop = currentData ? currentData.costo_cop.toFixed(0) : '0';

  const monthlyChartMap = new Map<
    string,
    { month: string; consumo: number; costo: number; order: number }
  >();

  consumptionData.forEach((d) => {
    const date = new Date(d.fecha);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const monthLabel = date.toLocaleDateString('es-CO', { month: 'short' });
    const order = date.getFullYear() * 12 + date.getMonth();

    if (!monthlyChartMap.has(key)) {
      monthlyChartMap.set(key, {
        month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        consumo: 0,
        costo: 0,
        order,
      });
    }

    const currentMonth = monthlyChartMap.get(key)!;
    currentMonth.consumo += d.consumo_kwh;
    currentMonth.costo += d.costo_cop;
  });

  const chartData = Array.from(monthlyChartMap.values())
    .sort((a, b) => a.order - b.order)
    .slice(-6)
    .map(({ month, consumo, costo }) => ({
      month,
      consumo: Number(consumo.toFixed(2)),
      costo: Number(costo.toFixed(0)),
    }));

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const last7DaysData = consumptionData.filter((d) => d.fecha > sevenDaysAgo);

  const dailyAverage =
    last7DaysData.length > 0
      ? last7DaysData.reduce((sum, d) => sum + d.consumo_kwh, 0) / last7DaysData.length
      : 0;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const lastMonthData = consumptionData.filter((d) => d.fecha > thirtyDaysAgo);
  const monthlyTotalKwh = lastMonthData.reduce((sum, d) => sum + d.consumo_kwh, 0);
  const monthlyTotalCop = lastMonthData.reduce((sum, d) => sum + d.costo_cop, 0);

  const isHighConsumption = currentData ? currentData.consumo_kwh > threshold : false;

  const thresholdProgress = currentData
    ? Math.min((currentData.consumo_kwh / threshold) * 100, 100)
    : 0;

  const handleExportData = () => {
    const csv = [
      ['Fecha', 'Consumo (kWh)', 'Costo (COP)', 'Voltaje (V)', 'Corriente (A)'].join(','),
      ...consumptionData.map((d) =>
        [
          d.fecha.toISOString(),
          d.consumo_kwh.toFixed(2),
          d.costo_cop.toFixed(0),
          d.voltaje.toFixed(1),
          d.corriente.toFixed(1),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proyecto-grado-datos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Datos exportados correctamente');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <BarChart3 className="w-12 h-12 text-blue-600" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent dark:from-slate-100 dark:to-blue-400">
                ProyectoGrado
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Dashboard | {user.name} ({user.type.toUpperCase()})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="icon" onClick={onToggleDarkMode}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-center md:justify-start">
          <Button
            onClick={() => onNavigate('dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            size="lg"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard Principal
          </Button>
          <Button onClick={() => onNavigate('statistics')} variant="outline" size="lg">
            Estadísticas
          </Button>
          <Button onClick={() => onNavigate('alerts')} variant="outline" size="lg">
            Alertas
          </Button>
          <Button onClick={() => onNavigate('recommendations')} variant="outline" size="lg">
            Recomendaciones
          </Button>
          <Button onClick={() => onNavigate('environmental')} variant="outline" size="lg">
            Impacto Ambiental
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <Card className="h-full dark:bg-slate-800 dark:border-slate-700 shadow-2xl border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl dark:text-white">
                <Zap className="w-8 h-8 text-blue-600" />
                Consumo Actual
              </CardTitle>
              <CardDescription className="dark:text-slate-400"></CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center space-y-6">
              <div className="relative w-64 h-64">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="115"
                    stroke={isDarkMode ? 'hsl(215 25% 22%)' : 'hsl(210 20% 90%)'}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="0 724"
                  />
                  <motion.circle
                    cx="128"
                    cy="128"
                    r="115"
                    stroke={isHighConsumption ? '#ef4444' : '#3b82f6'}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${
                      Math.min(((currentData?.consumo_kwh || 0) / 100) * 724, 724)
                    } 724`}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '0 724' }}
                    animate={{
                      strokeDasharray: `${
                        Math.min(((currentData?.consumo_kwh || 0) / 100) * 724, 724)
                      } 724`,
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <motion.div
                    className="text-5xl font-bold text-slate-900 dark:text-white mb-2"
                    key={currentConsumptionKwh}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {currentConsumptionKwh}
                  </motion.div>
                  <div className="text-2xl font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    kWh
                  </div>
                  <div className="text-xl text-slate-500 dark:text-slate-400">
                    ${Number(currentCostCop).toLocaleString('es-CO')} COP
                  </div>
                </div>
              </div>

              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Uso frente al umbral</span>
                  <span>{thresholdProgress.toFixed(0)}%</span>
                </div>
                <Progress value={thresholdProgress} className="h-3" />
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  {isSimulationMode ? (
                    <>
                      <Wifi className="w-6 h-6 text-emerald-500" />
                      <Badge className="bg-emerald-500 text-white font-medium">
                        Datos simulados
                      </Badge>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-6 h-6 text-slate-400" />
                      <Badge variant="secondary">Sin simulación</Badge>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleSimulation}
                  className="ml-auto"
                >
                  {isSimulationMode ? 'Pausar datos' : 'Iniciar datos'}
                </Button>
              </div>

              {isHighConsumption && currentData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full p-6 bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-200 dark:border-rose-800 rounded-2xl backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-rose-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-rose-800 dark:text-rose-300">
                        Consumo elevado detectado
                      </h3>
                      <p className="text-sm text-rose-700 dark:text-rose-400">
                        {currentData.consumo_kwh.toFixed(2)} kWh supera el umbral de {threshold} kWh
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="h-[420px] dark:bg-slate-800 dark:border-slate-700 shadow-xl">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center gap-2">
                Evolución 4 meses | {monthlyTotalKwh.toFixed(1)} kWh total
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Consumo reciente en kWh
              </CardDescription>
            </CardHeader>

            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? 'hsl(215 25% 22%)' : 'hsl(210 20% 90%)'}
                  />
                  <XAxis
                    dataKey="month"
                    stroke={isDarkMode ? 'hsl(210 40% 60%)' : 'hsl(210 40% 40%)'}
                    tick={{
                      fill: isDarkMode ? 'hsl(210 40% 60%)' : 'hsl(210 40% 40%)',
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    stroke={isDarkMode ? 'hsl(210 40% 60%)' : 'hsl(210 40% 40%)'}
                    tick={{
                      fill: isDarkMode ? 'hsl(210 40% 60%)' : 'hsl(210 40% 40%)',
                      fontSize: 12,
                    }}
                    label={{
                      value: 'kWh',
                      angle: -90,
                      position: 'insideLeft',
                      fill: isDarkMode ? 'hsl(210 40% 60%)' : 'hsl(210 40% 40%)',
                      fontSize: 12,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                      border: '1px solid hsl(210 40% 80%)',
                      borderRadius: '12px',
                      color: isDarkMode ? '#f1f5f9' : '#0f172a',
                    }}
                    labelFormatter={(label) => `Mes: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="consumo"
                    name="Consumo"
                    unit=" kWh"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    strokeLinecap="round"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    activeDot={{
                      r: 10,
                      strokeWidth: 3,
                      stroke: '#3b82f6',
                      fill: '#dbeafe',
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:col-span-3"
        >
          <Card className="dark:bg-slate-800 dark:border-slate-700 group hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Promedio reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {dailyAverage.toFixed(2)} kWh
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Últimos 7 días</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700 group hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Mensual total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {monthlyTotalKwh.toFixed(1)} kWh
              </div>
              <p className="text-sm text-emerald-600">
                ${monthlyTotalCop.toLocaleString('es-CO')} COP
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Últimos 30 días
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700 group hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm dark:text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                Establecimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white capitalize">
                {user.type}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Perfil registrado
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}