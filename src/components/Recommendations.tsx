import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Lightbulb, Check, Leaf, Zap, Home, Sun, Wind, Droplet } from 'lucide-react';
import { motion } from 'motion/react';

interface RecommendationsProps {
  onNavigate: (screen: 'dashboard' | 'statistics' | 'alerts' | 'recommendations' | 'environmental') => void;
  isDarkMode: boolean;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'iluminacion' | 'climatizacion' | 'electrodomesticos' | 'general';
  impact: 'alto' | 'medio' | 'bajo';
  icon: React.ReactNode;
  completed: boolean;
}

export default function Recommendations({ onNavigate, isDarkMode }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: '1',
      title: 'Usa bombillos LED',
      description: 'Los bombillos LED consumen hasta 80% menos energía que los incandescentes y duran mucho más tiempo. Reemplaza gradualmente todos los bombillos de tu hogar.',
      category: 'iluminacion',
      impact: 'alto',
      icon: <Lightbulb className="w-5 h-5" />,
      completed: false
    },
    {
      id: '2',
      title: 'Desconecta cargadores innecesarios',
      description: 'Los cargadores conectados sin usar consumen energía "fantasma". Desconéctalos cuando no los estés utilizando para ahorrar energía.',
      category: 'electrodomesticos',
      impact: 'medio',
      icon: <Zap className="w-5 h-5" />,
      completed: false
    },
    {
      id: '3',
      title: 'Optimiza la temperatura del aire acondicionado',
      description: 'Mantén el aire acondicionado entre 24-26°C. Cada grado menos aumenta el consumo en 8%. Usa ventiladores para complementar.',
      category: 'climatizacion',
      impact: 'alto',
      icon: <Wind className="w-5 h-5" />,
      completed: false
    },
    {
      id: '4',
      title: 'Aprovecha la luz natural',
      description: 'Abre cortinas y persianas durante el día. La luz natural reduce la necesidad de iluminación artificial y ahorra energía.',
      category: 'iluminacion',
      impact: 'medio',
      icon: <Sun className="w-5 h-5" />,
      completed: false
    },
    {
      id: '5',
      title: 'Usa electrodomésticos eficientes',
      description: 'Al comprar nuevos electrodomésticos, busca etiquetas de eficiencia energética A+ o superior. El ahorro a largo plazo es significativo.',
      category: 'electrodomesticos',
      impact: 'alto',
      icon: <Home className="w-5 h-5" />,
      completed: false
    },
    {
      id: '6',
      title: 'Lava con agua fría',
      description: 'El 90% de la energía que usa la lavadora es para calentar el agua. Lavar con agua fría ahorra energía y cuida mejor tu ropa.',
      category: 'electrodomesticos',
      impact: 'medio',
      icon: <Droplet className="w-5 h-5" />,
      completed: false
    },
    {
      id: '7',
      title: 'Limpia los filtros del aire acondicionado',
      description: 'Los filtros sucios hacen que el aire acondicionado trabaje más y consuma más energía. Límpialos cada 2 semanas.',
      category: 'climatizacion',
      impact: 'medio',
      icon: <Wind className="w-5 h-5" />,
      completed: false
    },
    {
      id: '8',
      title: 'Apaga luces en habitaciones vacías',
      description: 'Crea el hábito de apagar las luces al salir de una habitación. Instala sensores de movimiento en áreas de paso.',
      category: 'iluminacion',
      impact: 'medio',
      icon: <Lightbulb className="w-5 h-5" />,
      completed: false
    },
    {
      id: '9',
      title: 'Desconecta el modo standby',
      description: 'Los aparatos en modo standby consumen energía. Usa regletas con interruptor para desconectar varios dispositivos fácilmente.',
      category: 'electrodomesticos',
      impact: 'medio',
      icon: <Zap className="w-5 h-5" />,
      completed: false
    },
    {
      id: '10',
      title: 'Sella puertas y ventanas',
      description: 'Las fugas de aire hacen que el aire acondicionado trabaje más. Sella grietas y rendijas para mantener la temperatura.',
      category: 'climatizacion',
      impact: 'alto',
      icon: <Home className="w-5 h-5" />,
      completed: false
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'iluminacion' | 'climatizacion' | 'electrodomesticos' | 'general'>('all');

  const toggleRecommendation = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === id ? { ...rec, completed: !rec.completed } : rec
      )
    );
  };

  const filteredRecommendations = filter === 'all'
    ? recommendations
    : recommendations.filter(rec => rec.category === filter);

  const completedCount = recommendations.filter(rec => rec.completed).length;
  const completionPercentage = (completedCount / recommendations.length) * 100;

  const getImpactColor = (impact: Recommendation['impact']) => {
    switch (impact) {
      case 'alto':
        return 'bg-[#32a852] text-white';
      case 'medio':
        return 'bg-[#0077b6] text-white';
      case 'bajo':
        return 'bg-gray-500 text-white';
    }
  };

  const getImpactLabel = (impact: Recommendation['impact']) => {
    switch (impact) {
      case 'alto':
        return 'Alto impacto';
      case 'medio':
        return 'Medio impacto';
      case 'bajo':
        return 'Bajo impacto';
    }
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
          <h1 className="text-3xl text-gray-900 dark:text-white mb-2">Recomendaciones Sostenibles</h1>
          <p className="text-gray-600 dark:text-gray-400">Tips prácticos para reducir tu consumo eléctrico</p>
        </motion.div>

        {/* Navigation */}
        <div className="flex gap-2 flex-wrap mt-6">
          <Button onClick={() => onNavigate('dashboard')} variant="outline">
            Panel Principal
          </Button>
          <Button onClick={() => onNavigate('statistics')} variant="outline">
            Estadísticas
          </Button>
          <Button onClick={() => onNavigate('alerts')} variant="outline">
            Alertas
          </Button>
          <Button onClick={() => onNavigate('recommendations')} className="bg-[#32a852] hover:bg-[#2a8f46]">
            Recomendaciones
          </Button>
          <Button onClick={() => onNavigate('environmental')} variant="outline">
            Impacto Ambiental
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Progress Card */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Leaf className="w-5 h-5 text-[#32a852]" />
              Tu Progreso
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Has completado {completedCount} de {recommendations.length} recomendaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                <span className="text-gray-900 dark:text-white">{completionPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#32a852] to-[#0077b6]"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Buttons */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Categorías</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-[#0077b6] hover:bg-[#005f93]' : ''}
            >
              Todas ({recommendations.length})
            </Button>
            <Button
              variant={filter === 'iluminacion' ? 'default' : 'outline'}
              onClick={() => setFilter('iluminacion')}
              className={filter === 'iluminacion' ? 'bg-[#0077b6] hover:bg-[#005f93]' : ''}
            >
              Iluminación ({recommendations.filter(r => r.category === 'iluminacion').length})
            </Button>
            <Button
              variant={filter === 'climatizacion' ? 'default' : 'outline'}
              onClick={() => setFilter('climatizacion')}
              className={filter === 'climatizacion' ? 'bg-[#0077b6] hover:bg-[#005f93]' : ''}
            >
              Climatización ({recommendations.filter(r => r.category === 'climatizacion').length})
            </Button>
            <Button
              variant={filter === 'electrodomesticos' ? 'default' : 'outline'}
              onClick={() => setFilter('electrodomesticos')}
              className={filter === 'electrodomesticos' ? 'bg-[#0077b6] hover:bg-[#005f93]' : ''}
            >
              Electrodomésticos ({recommendations.filter(r => r.category === 'electrodomesticos').length})
            </Button>
          </CardContent>
        </Card>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg dark:bg-gray-800 dark:border-gray-700 ${
                  rec.completed ? 'opacity-75 border-[#32a852] dark:border-[#32a852]' : ''
                }`}
                onClick={() => toggleRecommendation(rec.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${rec.completed ? 'bg-[#32a852] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        {rec.icon}
                      </div>
                      <div>
                        <CardTitle className={`text-lg ${rec.completed ? 'line-through' : ''} dark:text-white`}>
                          {rec.title}
                        </CardTitle>
                        <Badge className={`mt-1 ${getImpactColor(rec.impact)}`}>
                          {getImpactLabel(rec.impact)}
                        </Badge>
                      </div>
                    </div>
                    {rec.completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-[#32a852] text-white rounded-full p-1"
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={`text-sm text-gray-600 dark:text-gray-400 ${rec.completed ? 'line-through' : ''}`}>
                    {rec.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
