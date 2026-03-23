import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Zap, Activity, TrendingUp, TrendingDown, Wifi, WifiOff, Menu, LogOut, Moon, Sun, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ConsumptionData, User } from '../App';
import { toast } from 'sonner';

interface DashboardProps {
  user: User;
  consumptionData: ConsumptionData[];
  threshold: number;
  onNavigate: (screen: 'dashboard' | 'statistics' | 'alerts' | 'recommendations' | 'environmental') => void;
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
  onToggleDarkMode
}: DashboardProps) {
  const currentConsumption = consumptionData.length > 0 
    ? consumptionData[consumptionData.length - 1].consumo_watts 
    : 0;

  const currentConsumptionKwh = (currentConsumption / 1000).toFixed(2);

  // Get last 24 hours data
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const last24Hours = consumptionData
    .filter(d => d.fecha > oneDayAgo)
    .slice(-24);

  const chartData = last24Hours.map((d, index) => ({
    time: new Date(d.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    consumo: (d.consumo_watts / 1000).toFixed(2),
    watts: d.consumo_watts
  }));

  // Calculate daily average
  const dailyAverage = consumptionData.length > 0
    ? consumptionData.reduce((sum, d) => sum + d.consumo_watts, 0) / consumptionData.length
    : 0;

  // Calculate monthly total (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const lastMonthData = consumptionData.filter(d => d.fecha > thirtyDaysAgo);
  const monthlyTotal = lastMonthData.reduce((sum, d) => sum + d.consumo_watts, 0) / 1000; // in kWh

  const isHighConsumption = currentConsumption > threshold;

  const handleExportData = () => {
    const csv = [
      ['Fecha', 'Consumo (W)', 'Voltaje (V)', 'Corriente (A)'].join(','),
      ...consumptionData.map(d => [
        d.fecha.toISOString(),
        d.consumo_watts,
        d.voltaje,
        d.corriente
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eco-luz-360-datos.csv';
    a.click();
    toast.success('Datos exportados exitosamente');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-10 h-10 text-[#32a852]" />
            </motion.div>
            <div>
              <h1 className="text-3xl text-gray-900 dark:text-white">ECO-LUZ 360</h1>
              <p className="text-gray-600 dark:text-gray-400">Bienvenido, {user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onToggleDarkMode}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => onNavigate('dashboard')} className="bg-[#32a852] hover:bg-[#2a8f46]">
            Panel Principal
          </Button>
          <Button onClick={() => onNavigate('statistics')} variant="outline">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Consumption Card */}
        <Card className="lg:col-span-1 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Consumo Actual</CardTitle>
            <CardDescription className="dark:text-gray-400">Tiempo real</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {/* Circular indicator */}
            <div className="relative w-48 h-48 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke={isHighConsumption ? "#ef4444" : "#32a852"}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(currentConsumption / 2000) * 553} 553`}
                  initial={{ strokeDasharray: "0 553" }}
                  animate={{ strokeDasharray: `${(currentConsumption / 2000) * 553} 553` }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.p 
                  className="text-4xl text-gray-900 dark:text-white"
                  key={currentConsumption}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentConsumption}
                </motion.p>
                <p className="text-gray-600 dark:text-gray-400">Watts</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{currentConsumptionKwh} kWh</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 mb-4">
              {isSimulationMode ? (
                <>
                  <Wifi className="w-5 h-5 text-[#32a852]" />
                  <Badge className="bg-[#32a852]">Conectado (Simulación)</Badge>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-gray-400" />
                  <Badge variant="secondary">Desconectado</Badge>
                </>
              )}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={onToggleSimulation}
              className="w-full"
            >
              {isSimulationMode ? 'Pausar Simulación' : 'Activar Simulación'}
            </Button>

            {isHighConsumption && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg w-full"
              >
                <p className="text-red-700 dark:text-red-400 text-sm text-center">
                  ⚠️ Consumo alto detectado
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Chart Card */}
        <Card className="lg:col-span-2 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Consumo - Últimas 24 Horas</CardTitle>
            <CardDescription className="dark:text-gray-400">Evolución del consumo eléctrico</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                  label={{ value: 'kWh', angle: -90, position: 'insideLeft', fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#ffffff' : '#000000'
                  }}
                  formatter={(value) => {
                    const num = Number(value ?? 0);
                    return [`${num.toLocaleString('es-CO')} kWh`, 'Consumo'];
                  }}

                />
                <Line 
                  type="monotone" 
                  dataKey="consumo" 
                  stroke="#32a852" 
                  strokeWidth={2}
                  dot={{ fill: '#32a852', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm dark:text-white">Promedio Diario</CardTitle>
            <Activity className="h-4 w-4 text-[#0077b6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900 dark:text-white">{(dailyAverage / 1000).toFixed(2)} kWh</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Consumo promedio por día
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm dark:text-white">Total Mensual</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#32a852]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900 dark:text-white">{monthlyTotal.toFixed(2)} kWh</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm dark:text-white">Tipo de Usuario</CardTitle>
            <Zap className="h-4 w-4 text-[#0077b6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900 dark:text-white capitalize">{user.type}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Perfil actual
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
