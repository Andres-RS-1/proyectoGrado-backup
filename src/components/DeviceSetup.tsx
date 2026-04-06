import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { BarChart3, Database, Wifi, WifiOff, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from './ui/alert';

interface DeviceSetupProps {
  onComplete: (simulationMode: boolean) => void;
  userName: string;
}

export default function DeviceSetup({ onComplete, userName }: DeviceSetupProps) {
  const [setupMode, setSetupMode] = useState<'api' | 'simulation'>('api');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleApiSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiEndpoint || !apiKey) {
      toast.error('Por favor completa los datos de la API');
      return;
    }

    setIsConnecting(true);
    
    // Simular conexión a API real
    setTimeout(() => {
      setIsConnecting(false);
      toast.success('Conexión API establecida correctamente');
      onComplete(false);
    }, 2000);
  };

  const handleSimulationMode = () => {
    toast.success('Modo de desarrollo activado (datos simulados)');
    onComplete(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center gap-3 mb-4"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <div className="relative">
              <BarChart3 className="w-16 h-16 text-blue-400" />
              <motion.div
                className="absolute -inset-2 rounded-full border-2 border-blue-400 opacity-50"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </div>
          </motion.div>
          <h1 className="text-white text-3xl mb-2 font-bold">¡Hola, {userName}!</h1>
          <p className="text-blue-100 text-lg">
            Configura la conexión de datos para tu análisis energético
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-8 h-8" />
              Configuración de Datos
            </CardTitle>
            <CardDescription>
              Selecciona fuente de datos: APIs reales o modo desarrollo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selección de modo */}
            <div className="space-y-3">
              <Label className="text-lg font-medium">Fuente de Datos</Label>
              <RadioGroup value={setupMode} onValueChange={(value: 'api' | 'simulation') => setSetupMode(value)}>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-start space-x-3 p-6 rounded-2xl border-2 cursor-pointer transition-all group ${
                    setupMode === 'api' 
                      ? 'border-blue-500 bg-blue-500/5 shadow-lg' 
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                  onClick={() => setSetupMode('api')}
                >
                  <RadioGroupItem value="api" id="api" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Server className="w-6 h-6 text-blue-500" />
                      <Label htmlFor="api" className="cursor-pointer font-semibold text-lg">
                        APIs Reales
                      </Label>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Conexión a APIs de medidores energéticos o sistemas IoT
                    </p>
                    <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                      Soporte: REST APIs, WebSockets, bases de datos externas
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-start space-x-3 p-6 rounded-2xl border-2 cursor-pointer transition-all group ${
                    setupMode === 'simulation' 
                      ? 'border-emerald-500 bg-emerald-500/5 shadow-lg' 
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                  onClick={() => setSetupMode('simulation')}
                >
                  <RadioGroupItem value="simulation" id="simulation" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Wifi className="w-6 h-6 text-emerald-500" />
                      <Label htmlFor="simulation" className="cursor-pointer font-semibold text-lg">
                        Modo Desarrollo
                      </Label>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Datos simulados realistas para desarrollo y pruebas
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                      <div>📊 24 kWh/día promedio</div>
                      <div>⚡ 220V industrial</div>
                      <div>🔄 Actualización 5s</div>
                    </div>
                  </div>
                </motion.div>
              </RadioGroup>
            </div>

            {/* Configuración API */}
            {setupMode === 'api' && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleApiSetup}
                className="space-y-4 pt-6 border-t bg-slate-50/50 rounded-xl p-6"
              >
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    <strong>Configuración API:</strong> Introduce los datos de tu proveedor de medición energética
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="api-endpoint">Endpoint API</Label>
                  <Input
                    id="api-endpoint"
                    type="url"
                    placeholder="https://api.proveedor.com/v1/consumo"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key / Token</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="sk_proyecto_xxxxxxxxxxxxxxxx"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                      />
                      Conectando a API...
                    </>
                  ) : (
                    <>
                      <Server className="w-5 h-5 mr-2" />
                      Establecer Conexión API
                    </>
                  )}
                </Button>
              </motion.form>
            )}

            {/* Modo simulación */}
            {setupMode === 'simulation' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-6 border-t bg-emerald-50/50 rounded-xl p-6"
              >
                <Alert className="border-emerald-200 bg-emerald-50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertDescription>
                    <strong>Datos de desarrollo:</strong> Simulación realista de consumo PYME (24 kWh/día promedio, 220V)
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4 text-sm text-slate-700 bg-white/80 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span>Actualización: 5 segundos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Voltaje: 220V industrial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Consumo: 10-60 kWh/día</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                    <span>Sin hardware requerido</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSimulationMode}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg text-lg py-8"
                >
                  <CheckCircle2 className="w-6 h-6 mr-3" />
                  🚀 Iniciar Dashboard de Desarrollo
                </Button>
              </motion.div>
            )}

            <div className="pt-6 border-t text-center">
              <p className="text-sm text-slate-500">
                La configuración se puede modificar después desde Ajustes → Fuentes de Datos
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-blue-100/70 text-center text-sm mt-8">
          ProyectoGrado | Plataforma de Análisis Energético - Ingeniería de Sistemas 2026
        </p>
      </motion.div>
    </div>
  );
}