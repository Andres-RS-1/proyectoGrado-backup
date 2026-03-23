import { useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { TreePine, Globe, Car, Lightbulb, Zap } from 'lucide-react';
import type { ConsumptionData } from '../App';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface EnvironmentalProps {
  consumptionData: ConsumptionData[];
  onNavigate: (screen: 'dashboard' | 'statistics' | 'alerts' | 'recommendations' | 'environmental') => void;
  isDarkMode: boolean;
}

export default function Environmental({ consumptionData, onNavigate, isDarkMode }: EnvironmentalProps) {
  // Calculate environmental impact
  const environmentalMetrics = useMemo(() => {
    // Get data from current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentMonthData = consumptionData.filter(d => d.fecha.getMonth() === currentMonth);
    
    // Calculate total consumption in kWh
    const totalConsumption = currentMonthData.reduce((sum, d) => sum + d.consumo_watts, 0) / 1000;
    
    // Average monthly consumption for a home in Bogotá (kWh)
    const averageConsumption = 150;
    
    // Calculate savings
    const savedKwh = Math.max(0, averageConsumption - totalConsumption);
    
    // CO2 emission factor for Colombia (kg CO2 per kWh)
    const co2Factor = 0.42;
    
    // Calculate CO2 avoided
    const co2Avoided = savedKwh * co2Factor;
    
    // Trees equivalent (one tree absorbs ~21 kg CO2 per year = 1.75 kg/month)
    const treesEquivalent = co2Avoided / 1.75;
    
    // Calculate money saved (600 COP per kWh)
    const moneySaved = savedKwh * 600;

    // Car kilometers equivalent (1 km = ~0.12 kg CO2)
    const carKmEquivalent = co2Avoided / 0.12;
    
    return {
      totalConsumption: totalConsumption.toFixed(2),
      savedKwh: savedKwh.toFixed(2),
      co2Avoided: co2Avoided.toFixed(2),
      treesEquivalent: treesEquivalent.toFixed(1),
      moneySaved: Math.round(moneySaved),
      carKmEquivalent: carKmEquivalent.toFixed(1)
    };
  }, [consumptionData]);

  // Weekly CO2 chart data
  const weeklyChartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayData = consumptionData.filter(d => 
        format(d.fecha, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      const dayConsumption = dayData.reduce((sum, d) => sum + d.consumo_watts, 0) / 1000;
      const averageDay = 5; // 5 kWh average per day
      const saved = Math.max(0, averageDay - dayConsumption);
      const co2 = saved * 0.42;
      
      data.push({
        day: format(date, 'EEE', { locale: es }),
        co2: parseFloat(co2.toFixed(2)),
        date: format(date, 'dd/MM')
      });
    }
    return data;
  }, [consumptionData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 p-4 md:p-8">
      {/* Navigation */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => onNavigate('dashboard')} variant="outline">
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
          <Button onClick={() => onNavigate('environmental')} className="bg-[#4CAF50] hover:bg-[#45a049] text-white">
            Impacto Ambiental
          </Button>
        </div>
      </div>

      {/* SECCIÓN 2 — IMPACTO AMBIENTAL */}
      <motion.div 
        className="max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl text-[#374151] dark:text-white mb-2">
            🌎 Tu contribución al planeta este mes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Cada kilovatio que ahorras cuenta para un futuro más sostenible.
          </p>
        </motion.div>

        {/* Hero Card */}
        <motion.div variants={itemVariants}>
          <Card 
            className="bg-gradient-to-r from-[#4CAF50] to-[#2196F3] text-white border-0 shadow-2xl overflow-hidden"
            style={{ borderRadius: '24px' }}
          >
            <CardContent className="pt-12 pb-12">
              <div className="text-center mb-8">
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="inline-block mb-4"
                >
                  <Globe className="w-20 h-20 mx-auto" />
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {/* CO2 Avoided */}
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                    <div className="text-6xl mb-2">🌿</div>
                    <p className="text-5xl mb-2">{environmentalMetrics.co2Avoided}</p>
                    <p className="text-xl">kg CO₂ evitado</p>
                  </div>
                </motion.div>

                {/* Trees Equivalent */}
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                    <div className="text-6xl mb-2">🌳</div>
                    <p className="text-5xl mb-2">{environmentalMetrics.treesEquivalent}</p>
                    <p className="text-xl">árboles equivalentes</p>
                  </div>
                </motion.div>

                {/* Money Saved */}
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                    <div className="text-6xl mb-2">💵</div>
                    <p className="text-5xl mb-2">${environmentalMetrics.moneySaved.toLocaleString()}</p>
                    <p className="text-xl">COP ahorrados</p>
                  </div>
                </motion.div>
              </div>

              <div className="text-center mt-8">
                <p className="text-xl opacity-90">¡Gracias por tu compromiso ambiental!</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Environmental Equivalences */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Trees Planted */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ borderRadius: '16px' }}>
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <div className="bg-[#4CAF50]/10 p-4 rounded-full inline-block mb-4">
                    <TreePine className="w-10 h-10 text-[#4CAF50]" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">🌲 Árboles plantados</p>
                  <p className="text-3xl text-[#374151] dark:text-white mb-1">
                    {environmentalMetrics.treesEquivalent}
                  </p>
                  <p className="text-xs text-gray-500">equivalentes/mes</p>
                </div>
              </CardContent>
            </Card>

            {/* Kilometers not driven */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ borderRadius: '16px' }}>
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <div className="bg-[#2196F3]/10 p-4 rounded-full inline-block mb-4">
                    <Car className="w-10 h-10 text-[#2196F3]" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">🚗 Kilómetros no recorridos</p>
                  <p className="text-3xl text-[#374151] dark:text-white mb-1">
                    {environmentalMetrics.carKmEquivalent}
                  </p>
                  <p className="text-xs text-gray-500">km en emisiones</p>
                </div>
              </CardContent>
            </Card>

            {/* Energy Saved */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ borderRadius: '16px' }}>
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <div className="bg-amber-500/10 p-4 rounded-full inline-block mb-4">
                    <Zap className="w-10 h-10 text-amber-600" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">💡 Energía ahorrada</p>
                  <p className="text-3xl text-[#374151] dark:text-white mb-1">
                    {environmentalMetrics.savedKwh}
                  </p>
                  <p className="text-xs text-gray-500">kWh este mes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Weekly CO2 Chart */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-gray-800 shadow-lg" style={{ borderRadius: '16px' }}>
            <CardContent className="pt-6">
              <h3 className="text-xl text-[#374151] dark:text-white mb-2">
                Reducción de CO₂ durante los últimos 7 días
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Cada barra representa el CO₂ evitado ese día
              </p>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6b7280"
                    tick={{ fill: '#374151' }}
                    style={{ fontSize: '14px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#374151' }}
                    label={{ 
                      value: 'kg CO₂', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: '#374151' }
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value, name) => [`${value ?? 0} kg CO₂`, 'Evitado']}
                    labelFormatter={(label) => {
                      const item = weeklyChartData.find(d => d.day === label);
                      return item ? `${label} (${item.date})` : label;
                    }}
                  />
                  <Bar 
                    dataKey="co2" 
                    fill="#4CAF50" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Educational Section */}
        <motion.div variants={itemVariants}>
          <Card 
            className="bg-gradient-to-br from-green-50 via-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-800 border-2 border-[#4CAF50]/30 shadow-lg overflow-hidden"
            style={{ borderRadius: '16px' }}
          >
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#4CAF50]/20 p-3 rounded-full">
                  <Lightbulb className="w-8 h-8 text-[#4CAF50]" />
                </div>
                <h3 className="text-2xl text-[#374151] dark:text-white">
                  ¿Sabías que…?
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl"
                >
                  <span className="text-3xl">🌍</span>
                  <div>
                    <p className="text-sm text-[#374151] dark:text-gray-200">
                      En Colombia, cada kWh de electricidad genera aproximadamente <strong>0.42 kg de CO₂</strong>.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl"
                >
                  <span className="text-3xl">🌳</span>
                  <div>
                    <p className="text-sm text-[#374151] dark:text-gray-200">
                      Un árbol adulto absorbe aproximadamente <strong>21 kg de CO₂ al año</strong> (1.75 kg/mes).
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl"
                >
                  <span className="text-3xl">💡</span>
                  <div>
                    <p className="text-sm text-[#374151] dark:text-gray-200">
                      En Bogotá, el consumo promedio de un hogar es de <strong>150 kWh al mes</strong>.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl"
                >
                  <span className="text-3xl">♻️</span>
                  <div>
                    <p className="text-sm text-[#374151] dark:text-gray-200">
                      Tu ahorro energético no solo reduce costos, también <strong>combate el cambio climático</strong>.
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-[#4CAF50]/20 to-[#2196F3]/20 rounded-xl border border-[#4CAF50]/30">
                <p className="text-center text-[#374151] dark:text-white">
                  <strong>Fórmula de impacto:</strong> kgCO₂ evitados = kWh ahorrados × 0.42
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Visual Tree Representation */}
        <motion.div
          variants={itemVariants}
          className="text-center py-8"
        >
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            {[...Array(Math.min(12, Math.max(1, Math.ceil(parseFloat(environmentalMetrics.treesEquivalent)))))].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ 
                  delay: i * 0.1, 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.2,
                  rotate: [0, -10, 10, 0],
                  transition: { duration: 0.3 }
                }}
              >
                <TreePine className="w-10 h-10 text-[#4CAF50]" />
              </motion.div>
            ))}
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Tu ahorro equivale a plantar <strong className="text-[#4CAF50]">{environmentalMetrics.treesEquivalent} árboles</strong> este mes 🌱
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
