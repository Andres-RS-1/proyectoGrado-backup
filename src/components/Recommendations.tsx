import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Lightbulb,
  Check,
  Leaf,
  Zap,
  Sun,
  Wind,
  Settings,
  Factory,
  BarChart3,
  Gauge,
} from 'lucide-react';
import { motion } from 'motion/react';

interface RecommendationsProps {
  onNavigate: (
    screen: 'dashboard' | 'statistics' | 'alerts' | 'recommendations' | 'environmental'
  ) => void;
  isDarkMode: boolean;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'iluminacion' | 'climatizacion' | 'equipos' | 'gestion' | 'general';
  impact: 'alto' | 'medio' | 'bajo';
  icon: React.ReactNode;
  completed: boolean;
}

export default function Recommendations({ onNavigate }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: '1',
      title: 'Migrar progresivamente a iluminación LED',
      description:
        'Sustituye luminarias antiguas por tecnología LED en oficinas, zonas de producción y áreas comunes. Esto reduce consumo, mantenimiento y mejora la eficiencia del sistema de iluminación.',
      category: 'iluminacion',
      impact: 'alto',
      icon: <Lightbulb className="w-5 h-5" />,
      completed: false,
    },
    {
      id: '2',
      title: 'Implementar apagado operativo al final de la jornada',
      description:
        'Define un protocolo de cierre para apagar equipos no esenciales, pantallas, impresoras, extractores y sistemas auxiliares cuando no estén en uso.',
      category: 'gestion',
      impact: 'alto',
      icon: <Zap className="w-5 h-5" />,
      completed: false,
    },
    {
      id: '3',
      title: 'Optimizar parámetros de climatización',
      description:
        'Mantén la climatización en rangos adecuados para confort y operación, evitando sobreenfriamiento. Un ajuste eficiente reduce picos de demanda y mejora el desempeño energético.',
      category: 'climatizacion',
      impact: 'alto',
      icon: <Wind className="w-5 h-5" />,
      completed: false,
    },
    {
      id: '4',
      title: 'Aprovechar iluminación natural en horario diurno',
      description:
        'Coordina apertura de persianas, redistribución de puestos y uso de sectores iluminados naturalmente para disminuir la dependencia de luz artificial durante el día.',
      category: 'iluminacion',
      impact: 'medio',
      icon: <Sun className="w-5 h-5" />,
      completed: false,
    },
    {
      id: '5',
      title: 'Renovar equipos con criterios de eficiencia energética',
      description:
        'Al reemplazar equipos, prioriza referencias con mejor desempeño energético y menor consumo específico. Evalúa el costo de operación, no solo el costo de compra.',
      category: 'equipos',
      impact: 'alto',
      icon: <Factory className="w-5 h-5" />,
      completed: false,
    },
    {
      id: '6',
      title: 'Programar mantenimiento preventivo de equipos críticos',
      description:
        'Motores, compresores, ventiladores y sistemas de climatización con mantenimiento deficiente consumen más energía. Un plan preventivo mejora rendimiento y estabilidad operativa.',
      category: 'equipos',
      impact: 'alto',
      icon: <Settings className="w-5 h-5" />,
      completed: false,
    },
    {
      id: '7',
      title: 'Monitorear y analizar consumos por franjas horarias',
      description:
        'Identifica horas pico de demanda para redistribuir cargas, programar procesos y evitar sobreconsumos concentrados en periodos específicos.',
      category: 'gestion',
      impact: 'alto',
      icon: <BarChart3 className="w-5 h-5" />,
      completed: false,
    },
    {
      id: '8',
      title: 'Instalar controles de encendido por zonas',
      description:
        'Sectoriza iluminación y equipos auxiliares para que operen solo donde realmente se requieren. Esto evita consumos innecesarios en áreas desocupadas.',
      category: 'iluminacion',
      impact: 'medio',
      icon: <Lightbulb className="w-5 h-5" />,
      completed: false,
    },
    {
      id: '9',
      title: 'Eliminar consumos en standby de equipos administrativos',
      description:
        'Computadores, monitores, routers, impresoras y periféricos pueden seguir consumiendo energía fuera del horario laboral. Usa regletas, temporizadores o políticas de apagado.',
      category: 'equipos',
      impact: 'medio',
      icon: <Zap className="w-5 h-5" />,
      completed: false,
    },
    {
      id: '10',
      title: 'Definir indicadores energéticos para seguimiento continuo',
      description:
        'Establece indicadores como consumo diario, costo energético, picos de demanda o consumo por proceso para tomar decisiones con base en datos.',
      category: 'gestion',
      impact: 'alto',
      icon: <Gauge className="w-5 h-5" />,
      completed: false,
    },
    {
      id: '11',
      title: 'Mejorar sellado térmico en puertas y ventanas',
      description:
        'Reducir infiltraciones de aire ayuda a que los sistemas de climatización trabajen con menor esfuerzo y más estabilidad en ambientes cerrados.',
      category: 'climatizacion',
      impact: 'medio',
      icon: <Wind className="w-5 h-5" />,
      completed: false,
    },
    {
      id: '12',
      title: 'Capacitar al personal en hábitos de uso eficiente',
      description:
        'Las mejoras tecnológicas funcionan mejor cuando el personal adopta rutinas de ahorro, uso racional de equipos y respuesta oportuna ante alertas del sistema.',
      category: 'general',
      impact: 'medio',
      icon: <Leaf className="w-5 h-5" />,
      completed: false,
    },
  ]);

  const [filter, setFilter] = useState<
    'all' | 'iluminacion' | 'climatizacion' | 'equipos' | 'gestion' | 'general'
  >('all');

  const toggleRecommendation = (id: string) => {
    setRecommendations((prev) =>
      prev.map((rec) =>
        rec.id === id ? { ...rec, completed: !rec.completed } : rec
      )
    );
  };

  const filteredRecommendations =
    filter === 'all'
      ? recommendations
      : recommendations.filter((rec) => rec.category === filter);

  const completedCount = recommendations.filter((rec) => rec.completed).length;
  const completionPercentage = (completedCount / recommendations.length) * 100;

  const getImpactColor = (impact: Recommendation['impact']) => {
    switch (impact) {
      case 'alto':
        return 'bg-emerald-600 text-white';
      case 'medio':
        return 'bg-blue-600 text-white';
      case 'bajo':
        return 'bg-slate-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const getImpactLabel = (impact: Recommendation['impact']) => {
    switch (impact) {
      case 'alto':
        return 'Alto impacto';
      case 'medio':
        return 'Impacto medio';
      case 'bajo':
        return 'Bajo impacto';
      default:
        return 'Impacto';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Recomendaciones Energéticas
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Acciones sugeridas para optimizar el consumo energético en ProyectoGrado
          </p>
        </motion.div>

        {/* Navigation */}
        <div className="flex gap-2 flex-wrap mt-6">
          <Button onClick={() => onNavigate('dashboard')} variant="outline">
            Dashboard
          </Button>
          <Button onClick={() => onNavigate('statistics')} variant="outline">
            Estadísticas
          </Button>
          <Button onClick={() => onNavigate('alerts')} variant="outline">
            Alertas
          </Button>
          <Button
            onClick={() => onNavigate('recommendations')}
            className="bg-blue-600 hover:bg-blue-700"
          >
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
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Leaf className="w-5 h-5 text-emerald-600" />
              Avance de implementación
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Has marcado {completedCount} de {recommendations.length} acciones recomendadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Progreso</span>
                <span className="text-slate-900 dark:text-white">
                  {completionPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-600 to-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Buttons */}
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Categorías</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Todas ({recommendations.length})
            </Button>

            <Button
              variant={filter === 'iluminacion' ? 'default' : 'outline'}
              onClick={() => setFilter('iluminacion')}
              className={filter === 'iluminacion' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Iluminación ({recommendations.filter((r) => r.category === 'iluminacion').length})
            </Button>

            <Button
              variant={filter === 'climatizacion' ? 'default' : 'outline'}
              onClick={() => setFilter('climatizacion')}
              className={filter === 'climatizacion' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Climatización ({recommendations.filter((r) => r.category === 'climatizacion').length})
            </Button>

            <Button
              variant={filter === 'equipos' ? 'default' : 'outline'}
              onClick={() => setFilter('equipos')}
              className={filter === 'equipos' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Equipos ({recommendations.filter((r) => r.category === 'equipos').length})
            </Button>

            <Button
              variant={filter === 'gestion' ? 'default' : 'outline'}
              onClick={() => setFilter('gestion')}
              className={filter === 'gestion' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Gestión ({recommendations.filter((r) => r.category === 'gestion').length})
            </Button>

            <Button
              variant={filter === 'general' ? 'default' : 'outline'}
              onClick={() => setFilter('general')}
              className={filter === 'general' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              General ({recommendations.filter((r) => r.category === 'general').length})
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
              transition={{ delay: index * 0.06 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg dark:bg-slate-800 dark:border-slate-700 ${
                  rec.completed ? 'opacity-80 border-emerald-600 dark:border-emerald-600' : ''
                }`}
                onClick={() => toggleRecommendation(rec.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          rec.completed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {rec.icon}
                      </div>
                      <div>
                        <CardTitle
                          className={`text-lg ${rec.completed ? 'line-through' : ''} dark:text-white`}
                        >
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
                        className="bg-emerald-600 text-white rounded-full p-1"
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <p
                    className={`text-sm text-slate-600 dark:text-slate-400 ${
                      rec.completed ? 'line-through' : ''
                    }`}
                  >
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