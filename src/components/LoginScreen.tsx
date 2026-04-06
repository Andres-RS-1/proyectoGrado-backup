import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { BarChart3, Zap } from 'lucide-react'; // Icono más técnico
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface User {
  name: string;
  email: string;
  type: 'pyme' | 'industrial';
}

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [userType, setUserType] = useState<'pyme' | 'industrial'>('pyme');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      onLogin({
        name: loginEmail.split('@')[0],
        email: loginEmail,
        type: 'pyme' // Por defecto Pyme para el proyecto
      });
      toast.success('¡Inicio de sesión exitoso!');
    } else {
      toast.error('Por favor completa todos los campos');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerName && registerEmail && registerPassword) {
      onLogin({
        name: registerName,
        email: registerEmail,
        type: userType
      });
      toast.success('¡Usuario registrado!');
    } else {
      toast.error('Por favor completa todos los campos');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
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
          <h1 className="text-white text-4xl mb-2 font-bold">ProyectoGrado</h1>
          <p className="text-blue-100 flex items-center justify-center gap-2 text-lg">
            <Zap className="w-5 h-5" />
            Dashboard de Monitoreo Energético
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Acceso al Sistema</CardTitle>
            <CardDescription>
              Plataforma de análisis y monitoreo para gestión energética en PYMES
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Nuevo Usuario</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo electrónico</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="usuario@empresa.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Acceder a Dashboard
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nombre de la Empresa</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Nombre PYME / Industrial"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo institucional</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="contacto@empresa.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Establecimiento</Label>
                    <RadioGroup value={userType} onValueChange={(value: 'pyme' | 'industrial') => setUserType(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pyme" id="pyme" />
                        <Label htmlFor="pyme" className="cursor-pointer">PYME</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="industrial" id="industrial" />
                        <Label htmlFor="industrial" className="cursor-pointer">Industrial</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button type="submit" className="w-full">
                    Crear Usuario
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-blue-100/80 text-center text-sm mt-6">
          Plataforma de Ingeniería de Sistemas - Proyecto de Grado 2026
        </p>
      </motion.div>
    </div>
  );
}