import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { TreePine, Globe, Car, Lightbulb, Zap, Leaf, Factory, Coins } from 'lucide-react';
import type { ConsumptionData } from '../App';
import { motion } from 'motion/react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { format, subDays } from 'date-fns';

interface EnvironmentalProps {
  consumptionData: ConsumptionData[];
  onNavigate: (
    screen: 'dashboard' | 'statistics' | 'alerts' | 'recommendations' | 'environmental'
  ) => void;
  isDarkMode: boolean;
}

export default function Environmental({
  consumptionData,
  onNavigate,
  isDarkMode,
}: EnvironmentalProps) {
  const baselineConsumption = 900;
  const co2Factor = 0.17;

  const environmentalMetrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthData = consumptionData.filter(
      (d) => d.fecha.getMonth() === currentMonth && d.fecha.getFullYear() === currentYear
    );

    const totalConsumption = currentMonthData.reduce((sum, d) => sum + d.consumo_kwh, 0);
    const totalCost = currentMonthData.reduce((sum, d) => sum + d.costo_cop, 0);

    const savedKwh = Math.max(0, baselineConsumption - totalConsumption);
    const co2Avoided = savedKwh * co2Factor;
    const treesEquivalent = co2Avoided / 1.75;
    const carKmEquivalent = co2Avoided / 0.12;

    return {
      totalConsumption: Number(totalConsumption.toFixed(2)),
      totalCost: Math.round(totalCost),
      baselineConsumption,
      savedKwh: Number(savedKwh.toFixed(2)),
      co2Avoided: Number(co2Avoided.toFixed(2)),
      treesEquivalent: Number(treesEquivalent.toFixed(1)),
      carKmEquivalent: Number(carKmEquivalent.toFixed(1)),
    };
  }, [consumptionData]);

  const monthlyTrend = useMemo(() => {
    return Array.from({ length: 10 }, (_, index) => {
      const date = subDays(new Date(), 9 - index);

      const dayData = consumptionData.filter(
        (d) => format(d.fecha, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );

      const total = dayData.reduce((sum, d) => sum + d.consumo_kwh, 0);

      return {
        date: format(date, 'dd/MM'),
        consumo: Number(total.toFixed(2)),
      };
    });
  }, [consumptionData]);

  const hasMonthlyTrendData = monthlyTrend.some((item) => item.consumo > 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => onNavigate('dashboard')} variant="outline">
            Dashboard
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
          <Button
            onClick={() => onNavigate('environmental')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Impacto Ambiental
          </Button>
        </div>
      </div>

      <motion.div
        className="max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">
            Impacto ambiental del consumo energético
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Visualización del efecto ambiental asociado al comportamiento energético registrado en ProyectoGrado
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white border-0 shadow-2xl overflow-hidden rounded-3xl">
            <CardContent className="pt-10 pb-10">
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.04, 1] }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                  className="inline-block mb-4"
                >
                  <Globe className="w-20 h-20 mx-auto" />
                </motion.div>
                <p className="text-xl opacity-90">
                  Indicadores ambientales estimados del periodo actual
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 280 }}
                >
                  <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                    <div className="text-5xl mb-3">🌿</div>
                    <p className="text-4xl font-bold mb-2">{environmentalMetrics.co2Avoided}</p>
                    <p className="text-lg">kg CO₂ evitados</p>
                  </div>
                </motion.div>

                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 280 }}
                >
                  <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                    <div className="text-5xl mb-3">🌳</div>
                    <p className="text-4xl font-bold mb-2">{environmentalMetrics.treesEquivalent}</p>
                    <p className="text-lg">árboles equivalentes</p>
                  </div>
                </motion.div>

                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 280 }}
                >
                  <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                    <div className="text-5xl mb-3">💰</div>
                    <p className="text-4xl font-bold mb-2">
                      ${environmentalMetrics.totalCost.toLocaleString('es-CO')}
                    </p>
                    <p className="text-lg">costo energético acumulado</p>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl dark:border-slate-700">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="bg-emerald-500/10 p-4 rounded-full inline-block mb-4">
                  <TreePine className="w-10 h-10 text-emerald-600" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Árboles equivalentes</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">
                  {environmentalMetrics.treesEquivalent}
                </p>
                <p className="text-xs text-slate-500">estimación mensual</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl dark:border-slate-700">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="bg-blue-500/10 p-4 rounded-full inline-block mb-4">
                  <Car className="w-10 h-10 text-blue-600" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Km equivalentes</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">
                  {environmentalMetrics.carKmEquivalent}
                </p>
                <p className="text-xs text-slate-500">emisiones evitadas</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl dark:border-slate-700">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="bg-amber-500/10 p-4 rounded-full inline-block mb-4">
                  <Zap className="w-10 h-10 text-amber-600" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Energía ahorrada</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">
                  {environmentalMetrics.savedKwh}
                </p>
                <p className="text-xs text-slate-500">kWh frente a referencia</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl dark:border-slate-700">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="bg-purple-500/10 p-4 rounded-full inline-block mb-4">
                  <Factory className="w-10 h-10 text-purple-600" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Consumo mensual</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">
                  {environmentalMetrics.totalConsumption}
                </p>
                <p className="text-xs text-slate-500">kWh registrados</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-white">
                Tendencia de consumo
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Evolución reciente del consumo energético diario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[340px] w-full">
                {hasMonthlyTrendData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDarkMode ? '#334155' : '#e5e7eb'}
                      />
                      <XAxis
                        dataKey="date"
                        stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                        tick={{ fill: isDarkMode ? '#cbd5e1' : '#334155', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                        tick={{ fill: isDarkMode ? '#cbd5e1' : '#334155', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        label={{
                          value: 'kWh',
                          angle: -90,
                          position: 'insideLeft',
                          style: { fill: isDarkMode ? '#cbd5e1' : '#334155' },
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                          borderRadius: '12px',
                          color: isDarkMode ? '#ffffff' : '#000000',
                        }}
                        formatter={(value) => [`${value} kWh`, 'Consumo']}
                      />
                      <Line
                        type="monotone"
                        dataKey="consumo"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Zap className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                      Aún no hay tendencia de consumo visible
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-md">
                      Registra más datos energéticos para visualizar la evolución diaria del consumo.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800 border border-emerald-200 dark:border-slate-700 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/20 p-3 rounded-full">
                  <Lightbulb className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Contexto del indicador
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 p-4 bg-white/80 dark:bg-slate-700/50 rounded-xl"
                >
                  <span className="text-3xl">🌍</span>
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      El cálculo de CO₂ evitado se presenta como una <strong>estimación referencial</strong> basada en un factor de emisión y una línea base operativa.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 p-4 bg-white/80 dark:bg-slate-700/50 rounded-xl"
                >
                  <span className="text-3xl">🏭</span>
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      La línea base usada en esta vista sirve para comparar el comportamiento del periodo, pero puede ajustarse más adelante según el tipo de PYME o proceso analizado.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 p-4 bg-white/80 dark:bg-slate-700/50 rounded-xl"
                >
                  <span className="text-3xl">⚡</span>
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      La fórmula base aplicada es: <strong>CO₂ evitado = kWh ahorrados × factor de emisión</strong>.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 p-4 bg-white/80 dark:bg-slate-700/50 rounded-xl"
                >
                  <span className="text-3xl">💸</span>
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      El análisis ambiental puede complementarse con el costo energético acumulado para mostrar impacto económico y sostenibilidad en una sola vista.
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-700/50 flex items-center gap-3">
                  <Leaf className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">CO₂ evitado</p>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {environmentalMetrics.co2Avoided} kg
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-700/50 flex items-center gap-3">
                  <Coins className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Costo acumulado</p>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      ${environmentalMetrics.totalCost.toLocaleString('es-CO')} COP
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-700/50 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Línea base</p>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {environmentalMetrics.baselineConsumption} kWh
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center py-8">
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            {[
              ...Array(
                Math.min(
                  12,
                  Math.max(1, Math.ceil(environmentalMetrics.treesEquivalent))
                )
              ),
            ].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.5,
                  type: 'spring',
                  stiffness: 180,
                }}
                whileHover={{
                  scale: 1.15,
                  rotate: [0, -8, 8, 0],
                  transition: { duration: 0.3 },
                }}
              >
                <TreePine className="w-10 h-10 text-emerald-600" />
              </motion.div>
            ))}
          </div>

          <p className="text-lg text-slate-600 dark:text-slate-400">
            El ahorro estimado del periodo equivale a{' '}
            <strong className="text-emerald-600">
              {environmentalMetrics.treesEquivalent} árboles
            </strong>{' '}
            en capacidad de absorción mensual.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}