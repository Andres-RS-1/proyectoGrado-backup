import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { 
  AlertTriangle, 
  Bell, 
  Settings, 
  TrendingUp,
  Zap,
  X,
  Check,
  Filter,
  BellRing,
  Volume2,
  VolumeX,
  Clock,
  Activity
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
} from "./ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";

interface AlertsProps {
  consumptionData: ConsumptionData[];
  threshold: number;
  onThresholdChange: (threshold: number) => void;
  onNavigate: (screen: 'dashboard' | 'statistics' | 'alerts' | 'recommendations' | 'environmental') => void;
  isDarkMode: boolean;
}

interface Alert {
  id: string;
  fecha: Date;
  consumo: number;
  tipo: 'alto' | 'muy_alto' | 'critico';
  read: boolean;
}

export default function Alerts({ consumptionData, threshold, onThresholdChange, onNavigate, isDarkMode }: AlertsProps) {
  const [localThreshold, setLocalThreshold] = useState(threshold);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [realTimeAlerts, setRealTimeAlerts] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'alto' | 'muy_alto' | 'critico'>('all');
  const [readAlerts, setReadAlerts] = useState<Set<string>>(new Set());
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  // Generate alerts from consumption data
  const alerts = useMemo(() => {
    const alertList: Alert[] = [];
    
    consumptionData.forEach((data, index) => {
      if (data.consumo_watts > threshold) {
        let tipo: 'alto' | 'muy_alto' | 'critico' = 'alto';
        
        if (data.consumo_watts > threshold * 1.5) {
          tipo = 'muy_alto';
        }
        if (data.consumo_watts > threshold * 2) {
          tipo = 'critico';
        }

        alertList.push({
          id: `alert-${index}`,
          fecha: data.fecha,
          consumo: data.consumo_watts,
          tipo,
          read: readAlerts.has(`alert-${index}`)
        });
      }
    });

    return alertList.sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 50);
  }, [consumptionData, threshold, readAlerts]);

  const filteredAlerts = useMemo(() => {
    let filtered = alerts;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.tipo === filterType);
    }
    
    if (showOnlyUnread) {
      filtered = filtered.filter(a => !a.read);
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
    setReadAlerts(prev => new Set(prev).add(alertId));
    toast.success('Alerta marcada como leída');
  };

  const handleMarkAllAsRead = () => {
    const allIds = new Set(alerts.map(a => a.id));
    setReadAlerts(allIds);
    toast.success(`✅ ${alerts.length} alertas marcadas como leídas`);
  };

  const handleClearAll = () => {
    setReadAlerts(new Set());
    toast.info('Todas las alertas marcadas como no leídas');
  };

  const getAlertColor = (tipo: Alert['tipo']) => {
    switch (tipo) {
      case 'alto':
        return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500';
      case 'muy_alto':
        return 'bg-orange-100 dark:bg-orange-900/20 border-orange-500';
      case 'critico':
        return 'bg-red-100 dark:bg-red-900/20 border-red-500';
    }
  };

  const getAlertTextColor = (tipo: Alert['tipo']) => {
    switch (tipo) {
      case 'alto':
        return 'text-yellow-700 dark:text-yellow-400';
      case 'muy_alto':
        return 'text-orange-700 dark:text-orange-400';
      case 'critico':
        return 'text-red-700 dark:text-red-400';
    }
  };

  const getAlertIconColor = (tipo: Alert['tipo']) => {
    switch (tipo) {
      case 'alto':
        return 'text-yellow-600';
      case 'muy_alto':
        return 'text-orange-600';
      case 'critico':
        return 'text-red-600';
    }
  };

  const getAlertLabel = (tipo: Alert['tipo']) => {
    switch (tipo) {
      case 'alto':
        return 'Consumo Alto';
      case 'muy_alto':
        return 'Consumo Muy Alto';
      case 'critico':
        return '🚨 CRÍTICO';
    }
  };

  const getAlertEmoji = (tipo: Alert['tipo']) => {
    switch (tipo) {
      case 'alto':
        return '⚠️';
      case 'muy_alto':
        return '⚡';
      case 'critico':
        return '🚨';
    }
  };

  const alertStats = useMemo(() => {
    const stats = {
      total: alerts.length,
      unread: alerts.filter(a => !a.read).length,
      alto: alerts.filter(a => a.tipo === 'alto').length,
      muy_alto: alerts.filter(a => a.tipo === 'muy_alto').length,
      critico: alerts.filter(a => a.tipo === 'critico').length
    };
    return stats;
  }, [alerts]);

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
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-3xl text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bell className="w-8 h-8 text-[#32a852]" />
                </motion.div>
                Alertas Inteligentes
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitoreo en tiempo real de consumos anormales
              </p>
            </div>
            {alertStats.unread > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <Badge className="bg-red-500 text-white px-4 py-2 text-lg">
                  {alertStats.unread} nuevas
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => onNavigate('dashboard')} variant="outline">
              Panel Principal
            </Button>
            <Button onClick={() => onNavigate('statistics')} variant="outline">
              Estadísticas
            </Button>
            <Button onClick={() => onNavigate('alerts')} className="bg-[#32a852] hover:bg-[#2a8f46]">
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

      {/* Main Content */}
      <motion.div 
        className="max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-all border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                  <p className="text-3xl text-gray-900 dark:text-white">{alertStats.total}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-all border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">No Leídas</p>
                  <p className="text-3xl text-gray-900 dark:text-white">{alertStats.unread}</p>
                </div>
                <BellRing className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-all border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Alto</p>
                  <p className="text-3xl text-gray-900 dark:text-white">{alertStats.alto}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-all border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Muy Alto</p>
                  <p className="text-3xl text-gray-900 dark:text-white">{alertStats.muy_alto}</p>
                </div>
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-all border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Crítico</p>
                  <p className="text-3xl text-gray-900 dark:text-white">{alertStats.critico}</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Configuration */}
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
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Settings className="w-5 h-5 text-[#32a852]" />
                    Umbral de Consumo
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Ajusta el límite para recibir alertas automáticas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg">Umbral: {localThreshold}W</Label>
                      <Badge variant="outline" className="text-sm">
                        {(localThreshold / 1000).toFixed(2)} kWh
                      </Badge>
                    </div>
                    
<div className="space-y-3">
  <div className="flex items-center justify-between">
  </div>

  <input
    type="range"
    min="100"
    max="3000"
    step="50"
    value={localThreshold}
    onChange={(e) => setLocalThreshold(Number(e.target.value))}
    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer 
               accent-[#32a852] [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
               [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg 
               [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 
               [&::-webkit-slider-thumb]:border-[#32a852] hover:[&::-webkit-slider-thumb]:ring-4 
               [&::-webkit-slider-thumb]:ring-green-100 dark:bg-gray-200 dark:border-green-600"
  />

  <div className="flex justify-between text-xs text-gray-500">
  </div>
</div>


                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="text-left">100W</div>
                      <div className="text-center">1500W</div>
                      <div className="text-right">3000W</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleUpdateThreshold} 
                      className="bg-[#32a852] hover:bg-[#2a8f46] flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aplicar Cambios
                    </Button>
                    <Button 
                      onClick={() => setLocalThreshold(threshold)} 
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      💡 <strong>Recomendación:</strong> Un hogar promedio en Bogotá consume entre 800-1200W. 
                      Ajusta el umbral según tus necesidades.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Activity className="w-5 h-5 text-[#0077b6]" />
                    Preferencias de Notificaciones
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Personaliza cómo recibes las alertas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-[#32a852]" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">Sonido de alertas</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Reproducir sonido cuando se detecta una alerta
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                      className="data-[state=checked]:bg-[#32a852] h-6 w-11 rounded-full shadow-md ring-2 ring-gray-200 dark:ring-gray-700"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BellRing className="w-5 h-5 text-[#0077b6]" />
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">Alertas en tiempo real</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Recibir notificaciones instantáneas
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={realTimeAlerts}
                      onCheckedChange={setRealTimeAlerts}
                      className="data-[state=checked]:bg-blue-500 h-6 w-11 rounded-full shadow-md ring-2 ring-gray-200 dark:ring-gray-700"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">Resumen diario</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Recibir un resumen de alertas cada día
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked 
                    className="data-[state=checked]:bg-purple-500 h-6 w-11 rounded-full shadow-md ring-2 ring-gray-200 dark:ring-gray-700"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Filters and Actions */}
        <motion.div variants={itemVariants}>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <Label className="text-sm">Filtrar por tipo:</Label>
                  </div>
                  <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Todas las alertas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las alertas</SelectItem>
                      <SelectItem value="alto">⚠️ Alto</SelectItem>
                      <SelectItem value="muy_alto">⚡ Muy Alto</SelectItem>
                      <SelectItem value="critico">🚨 Crítico</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
  <Switch
    checked={showOnlyUnread}
    onCheckedChange={setShowOnlyUnread}
    id="unread-only"
    className="data-[state=checked]:bg-[#32a852] h-6 w-11 rounded-full shadow-md ring-2 ring-gray-200 dark:ring-gray-700"
  />
  <Label htmlFor="unread-only" className="text-sm cursor-pointer text-gray-900 dark:text-white">
    Solo no leídas
  </Label>
</div>

                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleMarkAllAsRead}
                    variant="outline"
                    size="sm"
                    disabled={alertStats.unread === 0}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Marcar todas como leídas
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

        {/* Alerts List */}
        <motion.div variants={itemVariants}>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">
                Historial de Alertas
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                {filteredAlerts.length} alertas {showOnlyUnread ? 'no leídas' : 'encontradas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-gray-500 dark:text-gray-400">
                    {showOnlyUnread 
                      ? '✅ No hay alertas sin leer' 
                      : 'No hay alertas registradas'}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Las alertas aparecerán cuando el consumo supere el umbral configurado
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
                        whileHover={{ scale: 1.02, x: 5 }}
                        className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.tipo)} ${
                          alert.read ? 'opacity-60' : ''
                        } cursor-pointer transition-all`}
                        onClick={() => !alert.read && handleMarkAsRead(alert.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <motion.div
                                animate={alert.read ? {} : { rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                              >
                                <span className="text-2xl">{getAlertEmoji(alert.tipo)}</span>
                              </motion.div>
                              <Badge 
                                variant="outline" 
                                className={`${getAlertTextColor(alert.tipo)} border-current`}
                              >
                                {getAlertLabel(alert.tipo)}
                              </Badge>
                              {!alert.read && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                >
                                  <Badge className="bg-blue-500 text-white">Nueva</Badge>
                                </motion.div>
                              )}
                            </div>
                            <p className={`text-sm ${getAlertTextColor(alert.tipo)} mb-1`}>
                              <Zap className="w-4 h-4 inline mr-1" />
                              Consumo detectado: <strong>{alert.consumo}W</strong> ({(alert.consumo / 1000).toFixed(2)} kWh)
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(alert.fecha, "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge variant="secondary" className="text-xs">
                              +{((alert.consumo - threshold) / threshold * 100).toFixed(0)}%
                            </Badge>
                            {!alert.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(alert.id);
                                }}
                              >
                                <Check className="w-4 h-4" />
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
