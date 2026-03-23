import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Zap, Wifi, WifiOff, Smartphone, Activity, CheckCircle2, AlertCircle, Leaf } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from './ui/alert';

interface DeviceSetupProps {
  onComplete: (simulationMode: boolean) => void;
  userName: string;
}

export default function DeviceSetup({ onComplete, userName }: DeviceSetupProps) {
  const [setupMode, setSetupMode] = useState<'iot' | 'simulation'>('iot');
  const [deviceName, setDeviceName] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleIoTSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deviceName || !deviceId) {
      toast.error('Por favor completa todos los campos del dispositivo');
      return;
    }

    setIsConnecting(true);
    
    // Simulate connection attempt
    setTimeout(() => {
      setIsConnecting(false);
      toast.success('Dispositivo IoT vinculado exitosamente');
      onComplete(false);
    }, 2000);
  };

  const handleSimulationMode = () => {
    toast.success('Modo simulación activado');
    onComplete(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0077b6] via-[#32a852] to-[#0077b6] flex items-center justify-center p-4">
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
              <Zap className="w-12 h-12 text-[#32a852] fill-[#32a852]" />
              <motion.div
                className="absolute -inset-2 rounded-full border-2 border-[#32a852] opacity-50"
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
          <h1 className="text-white text-3xl mb-2">¡Bienvenido, {userName}!</h1>
          <p className="text-white/90 flex items-center justify-center gap-2">
            <Leaf className="w-4 h-4" />
            Conecta tu dispositivo o activa el modo simulación
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95">
          <CardHeader>
            <CardTitle>Vincular Dispositivo IoT</CardTitle>
            <CardDescription>
              Configura tu dispositivo de monitoreo o utiliza datos simulados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Selection */}
            <div className="space-y-3">
              <Label>Selecciona el modo de operación</Label>
              <RadioGroup value={setupMode} onValueChange={(value: 'iot' | 'simulation') => setSetupMode(value)}>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    setupMode === 'iot' 
                      ? 'border-[#0077b6] bg-[#0077b6]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSetupMode('iot')}
                >
                  <RadioGroupItem value="iot" id="iot" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="iot" className="cursor-pointer flex items-center gap-2">
                      <Wifi className="w-5 h-5 text-[#0077b6]" />
                      Conectar Dispositivo IoT Real
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      ESP32, Arduino + Sensor SCT-013 para monitoreo en tiempo real
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    setupMode === 'simulation' 
                      ? 'border-[#32a852] bg-[#32a852]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSetupMode('simulation')}
                >
                  <RadioGroupItem value="simulation" id="simulation" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="simulation" className="cursor-pointer flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#32a852]" />
                      Modo Simulación
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Datos simulados que se actualizan cada 10 segundos (ideal para pruebas)
                    </p>
                  </div>
                </motion.div>
              </RadioGroup>
            </div>

            {/* IoT Device Setup Form */}
            {setupMode === 'iot' && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleIoTSetup}
                className="space-y-4 pt-4 border-t"
              >
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Dispositivos compatibles:</strong> ESP32, Arduino Uno/Mega con sensor de corriente SCT-013 (30A/1V)
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="device-name">Nombre del dispositivo</Label>
                  <Input
                    id="device-name"
                    type="text"
                    placeholder="Ej: Monitor Sala Principal"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="device-id">ID del Dispositivo / MAC Address</Label>
                  <Input
                    id="device-id"
                    type="text"
                    placeholder="Ej: ESP32-A1B2C3D4"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Puedes encontrar este ID en el monitor serial del dispositivo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wifi-ssid">Red WiFi (opcional)</Label>
                  <Input
                    id="wifi-ssid"
                    type="text"
                    placeholder="Nombre de tu red WiFi"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wifi-password">Contraseña WiFi (opcional)</Label>
                  <Input
                    id="wifi-password"
                    type="password"
                    placeholder="••••••••"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                  />
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-[#0077b6]" />
                  <AlertDescription className="text-sm">
                    Asegúrate de que tu dispositivo esté encendido y en modo de emparejamiento
                  </AlertDescription>
                </Alert>

                <Button 
                  type="submit" 
                  className="w-full bg-[#0077b6] hover:bg-[#005f93]"
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4 mr-2" />
                      Vincular Dispositivo
                    </>
                  )}
                </Button>
              </motion.form>
            )}

            {/* Simulation Mode */}
            {setupMode === 'simulation' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t"
              >
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-[#32a852]" />
                  <AlertDescription>
                    <strong>Modo simulación:</strong> Genera datos realistas de consumo eléctrico para Bogotá (110-120V, 300-1800W)
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-[#32a852]" />
                    <span>Actualización cada 10 segundos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-[#32a852]" />
                    <span>Consumo simulado: 300-1800 Watts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <WifiOff className="w-4 h-4 text-gray-500" />
                    <span>No requiere hardware físico</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSimulationMode}
                  className="w-full bg-[#32a852] hover:bg-[#2a8f46]"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Activar Modo Simulación
                </Button>
              </motion.div>
            )}

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 text-center">
                Podrás cambiar entre modo real y simulación más adelante desde el panel principal
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-white/80 text-center text-sm mt-6">
          ECO-LUZ 360 | Monitoreo Inteligente de Energía 🌱
        </p>
      </motion.div>
    </div>
  );
}
