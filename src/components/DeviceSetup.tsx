import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart3, Database, Wifi, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from './ui/alert';

interface DeviceSetupProps {
  onComplete: (simulationMode: boolean) => void;
  userName: string;
}

export default function DeviceSetup({ onComplete, userName }: DeviceSetupProps) {
  const handleSimulationMode = () => {
    toast.success('Modo de desarrollo activado');
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
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center gap-3 mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <div className="relative">
              <BarChart3 className="w-16 h-16 text-blue-400" />
              <motion.div
                className="absolute -inset-2 rounded-full border-2 border-blue-400 opacity-50"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5],
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
            Activa el modo desarrollo para probar el análisis energético
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-8 h-8" />
              Configuración de Datos
            </CardTitle>
            <CardDescription>
              Activa el modo desarrollo para usar datos simulados en el dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 bg-emerald-50/50 rounded-xl p-6"
            >
              <div className="flex items-start space-x-3 p-6 rounded-2xl border-2 border-emerald-500 bg-emerald-500/5 shadow-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Wifi className="w-6 h-6 text-emerald-500" />
                    <span className="font-semibold text-lg">Modo Desarrollo</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    Datos simulados realistas para desarrollo y pruebas
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                    <div>📊 24 kWh/día promedio</div>
                    <div>⚡ 220V industrial</div>
                    <div>🔄 Actualización 5s</div>
                  </div>
                </div>
              </div>

              <Alert className="border-emerald-200 bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription>
                  <strong>Modo desarrollo:</strong> Usa datos simulados realistas para pruebas del dashboard y visualización de indicadores
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4 text-sm text-slate-700 bg-white/80 p-4 rounded-2xl">
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

            <div className="pt-6 border-t text-center">
              <p className="text-sm text-slate-500">
                El modo desarrollo permite probar el dashboard sin depender de hardware ni integraciones externas
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