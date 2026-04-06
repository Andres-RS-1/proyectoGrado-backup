import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import {
  AlertTriangle,
  Bell,
  Settings,
  Zap,
  X,
  Check,
  Filter,
  BellRing,
  Volume2,
  VolumeX,
  Clock,
  Activity,
} from 'lucide-react';
import type { ConsumptionData } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';

interface AlertsProps {
  consumptionData: ConsumptionData[];
  threshold: number;
  onThresholdChange: (threshold: number) => void;
  onNavigate: (
    screen: 'dashboard' | 'statistics' | 'alerts' | 'recommendations' | 'environmental'
  ) => void;
  isDarkMode: boolean;
}

interface AlertItem {
  id: string;
  fecha: Date;
  consumo: number;
  tipo: 'alto' | 'muy_alto' | 'critico';
  read: boolean;
}

export default function Alerts({
  consumptionData,
  threshold,
  onThresholdChange,
  onNavigate,
}: AlertsProps) {
  const [localThreshold, setLocalThreshold] = useState(threshold);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [realTimeAlerts, setRealTimeAlerts] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'alto' | 'muy_alto' | 'critico'>('all');
  const [readAlerts, setReadAlerts] = useState<Set<string>>(new Set());
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const alerts = useMemo(() => {
    const alertList: AlertItem[] = [];

    consumptionData.forEach((data, index) => {
      const consumoWatts = Number((data.voltaje * data.corriente).toFixed(2));

      if (consumoWatts > threshold) {
        let tipo: 'alto' | 'muy_alto' | 'critico' = 'alto';

        if (consumoWatts > threshold * 1.5) {
          tipo = 'muy_alto';
        }

        if (consumoWatts > threshold * 2) {
          tipo = 'critico';
        }

        alertList.push({
          id: `alert-${index}`,
          fecha: data.fecha,
          consumo: consumoWatts,
          tipo,
          read: readAlerts.has(`alert-${index}`),
        });
      }
    });

    return alertList
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, 50);
  }, [consumptionData, threshold, readAlerts]);

  const filteredAlerts = useMemo(() => {
    let filtered = alerts;

    if (filterType !== 'all') {
      filtered = filtered.filter((a) => a.tipo === filterType);
    }

    if (showOnlyUnread) {
      filtered = filtered.filter((a) => !a.read);
    }

    return filtered;
  }, [alerts, filterType, showOnlyUnread]);

  const handleUpdateThreshold = () => {
    if (localThreshold > 0) {
      onThresholdChange(localThreshold);
      toast.success(`✅ Umbral actualizado a ${localThreshold}W`);
    } else {
      toast.error('❌ El umbral debe ser mayor a 0');
    }
  };

  const handleMarkAsRead = (alertId: string) => {
    setReadAlerts((prev) => new Set(prev).add(alertId));
    toast.success('Alerta marcada como leída');
  };

  const handleMarkAllAsRead = () => {
    const allIds = new Set(alerts.map((a) => a.id));
    setReadAlerts(allIds);
    toast.success(`✅ ${alerts.length} alertas marcadas como leídas`);
  };

  const handleClearAll = () => {
    setReadAlerts(new Set());
    toast.info('Todas las alertas marcadas como no leídas');
  };

  const getAlertColor = (tipo: AlertItem['tipo']) => {
    switch (tipo) {
      case 'alto':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500';
      case 'muy_alto':
        return 'bg-orange-100 dark:bg-orange-900/30 border-orange-500';
      case 'critico':
        return 'bg-red-100 dark:bg-red-900/30 border-red-600';
      default:
        return 'bg-slate-100 dark:bg-slate-800 border-slate-300';
    }
  };

  const getAlertTextColor = (tipo: AlertItem['tipo']) => {
    switch (tipo) {
      case 'alto':
        return 'text-yellow-800 dark:text-yellow-300';
      case 'muy_alto':
        return 'text-orange-800 dark:text-orange-300';
      case 'critico':
        return 'text-red-800 dark:text-red-300';
      default:
        return 'text-slate-700 dark:text-slate-300';
    }
  };

  const getAlertLabel = (tipo: AlertItem['tipo']) => {
    switch (tipo) {
      case 'alto':
        return 'Consumo alto';
      case 'muy_alto':
        return 'Consumo muy alto';
      case 'critico':
        return 'Crítico';
      default:
        return 'Alerta';
    }
  };

  const getAlertEmoji = (tipo: AlertItem['tipo']) => {
    switch (tipo) {
      case 'alto':
        return '⚠️';
      case 'muy_alto':
        return '⚡';
      case 'critico':
        return '🚨';
      default:
        return '🔔';
    }
  };

  const alertStats = useMemo(() => {
    return {
      total: alerts.length,
      unread: alerts.filter((a) => !a.read).length,
      alto: alerts.filter((a) => a.tipo === 'alto').length,
      muy_alto: alerts.filter((a) => a.tipo === 'muy_alto').length,
      critico: alerts.filter((a) => a.tipo === 'critico').length,
    };
  }, [alerts]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bell className="w-8 h-8 text-blue-600" />
                </motion.div>
                Alertas Inteligentes
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Monitoreo en tiempo real de consumos anormales en watts
              </p>
            </div>

            {alertStats.unread > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <Badge className="bg-red-500 text-white px-4 py-2 text-base shadow-md">
                  {alertStats.unread} nuevas
                </Badge>
              </motion.div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => onNavigate('dashboard')} variant="outline">
              Dashboard
            </Button>
            <Button onClick={() => onNavigate('statistics')} variant="outline">
              Estadísticas
            </Button>
            <Button onClick={() => onNavigate('alerts')} className="bg-blue-600 hover:bg-blue-700">
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
      </div>

      <motion.div
        className="max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {alertStats.unread > 0 && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border px-5 py-4 shadow-lg ${
              alertStats.critico > 0
                ? 'bg-red-50 border-red-300 dark:bg-red-950/40 dark:border-red-800'
                : 'bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800'
            }`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-full p-2 ${
                    alertStats.critico > 0
                      ? 'bg-red-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div>
                  <p
                    className={`font-semibold ${
                      alertStats.critico > 0
                        ? 'text-red-800 dark:text-red-200'
                        : 'text-amber-800 dark:text-amber-200'
                    }`}
                  >
                    {alertStats.critico > 0
                      ? `Tienes ${alertStats.critico} alerta(s) crítica(s) que requieren atención inmediata`
                      : `Tienes ${alertStats.unread} alerta(s) nueva(s) pendientes de revisión`}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      alertStats.critico > 0
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    Revisa el historial y marca como leídas las incidencias atendidas.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleMarkAllAsRead}
                className={
                  alertStats.critico > 0
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }
              >
                <Check className="w-4 h-4 mr-2" />
                Marcar todas
              </Button>
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700 border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{alertStats.total}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-amber-700 border-2 border-amber-400 bg-amber-50/80 dark:bg-amber-950/20 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-1 font-medium">No leídas</p>
                  <p className="text-3xl font-bold text-amber-700 dark:text-amber-200">{alertStats.unread}</p>
                </div>
                <BellRing className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-yellow-700 border-2 border-yellow-400 bg-yellow-50/80 dark:bg-yellow-950/20 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-1 font-medium">Alto</p>
                  <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-200">{alertStats.alto}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-orange-700 border-2 border-orange-400 bg-orange-50/80 dark:bg-orange-950/20 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-1 font-medium">Muy alto</p>
                  <p className="text-3xl font-bold text-orange-700 dark:text-orange-200">{alertStats.muy_alto}</p>
                </div>
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-red-700 border-2 border-red-500 bg-red-50/80 dark:bg-red-950/20 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-1 font-medium">Crítico</p>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-200">{alertStats.critico}</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="rounded-full bg-red-600 p-2 text-white shadow-lg"
                >
                  <AlertTriangle className="h-7 w-7" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="config">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Activity className="w-4 h-4 mr-2" />
                Preferencias
              </TabsTrigger>
            </TabsList>

            <TabsContent value="config">
              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Umbral de Consumo
                  </CardTitle>
                  <CardDescription className="dark:text-slate-400">
                    Ajusta el límite en watts para recibir alertas automáticas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg">Umbral: {localThreshold}W</Label>
                      <Badge variant="outline" className="text-sm">
                        Potencia instantánea
                      </Badge>
                    </div>

                    <Slider
                      value={[localThreshold]}
                      onValueChange={(value) => setLocalThreshold(value[0] ?? 1000)}
                      min={1000}
                      max={15000}
                      step={100}
                      className="
                        w-full
                        [&_[data-slot=slider-track]]:h-3
                        [&_[data-slot=slider-track]]:rounded-full
                        [&_[data-slot=slider-track]]:bg-slate-200
                        dark:[&_[data-slot=slider-track]]:bg-slate-700
                        [&_[data-slot=slider-range]]:bg-blue-600
                        dark:[&_[data-slot=slider-range]]:bg-blue-500
                        [&_[data-slot=slider-thumb]]:h-6
                        [&_[data-slot=slider-thumb]]:w-6
                        [&_[data-slot=slider-thumb]]:border-4
                        [&_[data-slot=slider-thumb]]:border-white
                        [&_[data-slot=slider-thumb]]:bg-blue-600
                        dark:[&_[data-slot=slider-thumb]]:border-slate-900
                        dark:[&_[data-slot=slider-thumb]]:bg-blue-500
                        [&_[data-slot=slider-thumb]]:shadow-md
                        [&_[data-slot=slider-thumb]]:transition
                        [&_[data-slot=slider-thumb]]:hover:scale-110
                        [&_[data-slot=slider-thumb]]:focus-visible:ring-2
                        [&_[data-slot=slider-thumb]]:focus-visible:ring-blue-400
                        [&_[data-slot=slider-thumb]]:focus-visible:ring-offset-2
                        dark:[&_[data-slot=slider-thumb]]:focus-visible:ring-offset-slate-800
                      "
                    />

                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="text-left">1000W</div>
                      <div className="text-center">8000W</div>
                      <div className="text-right">15000W</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpdateThreshold}
                      className="bg-blue-600 hover:bg-blue-700 flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aplicar cambios
                    </Button>
                    <Button
                      onClick={() => setLocalThreshold(threshold)}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Estas alertas usan potencia instantánea calculada a partir de voltaje y corriente del dispositivo.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Preferencias de notificación
                  </CardTitle>
                  <CardDescription className="dark:text-slate-400">
                    Personaliza cómo deseas recibir alertas del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <p className="text-sm text-slate-900 dark:text-white">Sonido de alertas</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Reproducir sonido cuando se detecta una alerta
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BellRing className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-slate-900 dark:text-white">Alertas en tiempo real</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Recibir notificaciones instantáneas
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={realTimeAlerts}
                      onCheckedChange={setRealTimeAlerts}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-slate-900 dark:text-white">Resumen diario</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Recibir un resumen de alertas cada día
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <Label className="text-sm">Filtrar por tipo:</Label>
                  </div>

                  <Select
                    value={filterType}
                    onValueChange={(value: 'all' | 'alto' | 'muy_alto' | 'critico') => setFilterType(value)}
                  >
                    <SelectTrigger className="w-[190px]">
                      <SelectValue placeholder="Todas las alertas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las alertas</SelectItem>
                      <SelectItem value="alto">⚠️ Alto</SelectItem>
                      <SelectItem value="muy_alto">⚡ Muy alto</SelectItem>
                      <SelectItem value="critico">🚨 Crítico</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showOnlyUnread}
                      onCheckedChange={setShowOnlyUnread}
                      id="unread-only"
                    />
                    <Label
                      htmlFor="unread-only"
                      className="text-sm cursor-pointer text-slate-900 dark:text-white"
                    >
                      Solo no leídas
                    </Label>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={handleMarkAllAsRead}
                    variant="outline"
                    size="sm"
                    disabled={alertStats.unread === 0}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Marcar todas
                  </Button>
                  <Button
                    onClick={handleClearAll}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar marcas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Historial de alertas</CardTitle>
              <CardDescription className="dark:text-slate-400">
                {filteredAlerts.length} alertas {showOnlyUnread ? 'sin leer' : 'registradas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Bell className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-slate-500 dark:text-slate-400">
                    {showOnlyUnread ? 'No hay alertas pendientes por leer' : 'No hay alertas registradas'}
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                    Las alertas aparecerán cuando la potencia supere el umbral configurado
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  <AnimatePresence>
                    {filteredAlerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ scale: 1.01 }}
                        className={`p-4 rounded-xl border-l-[6px] ${getAlertColor(alert.tipo)} ${
                          alert.read
                            ? 'opacity-60'
                            : 'shadow-md ring-1 ring-inset ring-white/40 dark:ring-white/10'
                        } cursor-pointer transition-all`}
                        onClick={() => !alert.read && handleMarkAsRead(alert.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <motion.div
                                animate={alert.read ? {} : { rotate: [0, 8, -8, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                className="text-2xl"
                              >
                                <span>{getAlertEmoji(alert.tipo)}</span>
                              </motion.div>

                              <Badge
                                className={`font-medium ${
                                  alert.tipo === 'critico'
                                    ? 'bg-red-600 text-white'
                                    : alert.tipo === 'muy_alto'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-yellow-500 text-white'
                                }`}
                              >
                                {getAlertLabel(alert.tipo)}
                              </Badge>

                              {!alert.read && (
                                <Badge className="bg-blue-600 text-white shadow-sm">Nueva</Badge>
                              )}
                            </div>

                            <p className={`text-sm ${getAlertTextColor(alert.tipo)} mb-1 font-medium`}>
                              <Zap className="w-4 h-4 inline mr-1" />
                              Potencia detectada: <strong>{alert.consumo.toFixed(2)} W</strong>
                            </p>

                            <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(alert.fecha, "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                                locale: es,
                              })}
                            </p>
                          </div>

                          <div className="text-right space-y-2 min-w-[110px]">
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium"
                            >
                              +{threshold > 0 ? (((alert.consumo - threshold) / threshold) * 100).toFixed(0) : 0}%
                            </Badge>

                            {!alert.read && (
                              <Button
                                size="sm"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(alert.id);
                                }}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Atender
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}