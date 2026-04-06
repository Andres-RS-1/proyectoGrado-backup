import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import DeviceSetup from './components/DeviceSetup';
import Dashboard from './components/Dashboard';
import Statistics from './components/Statistics';
import Alerts from './components/Alerts';
import Recommendations from './components/Recommendations';
import Environmental from './components/Environmental';
import { Toaster } from './components/ui/sonner';

export interface User {
  name: string;
  email: string;
  type: 'pyme' | 'industrial';
}

export interface ConsumptionData {
  id_usuario: string;
  fecha: Date;
  consumo_kwh: number;
  costo_cop: number;
  voltaje: number;
  corriente: number;
}

export type AppScreen =
  | 'dashboard'
  | 'statistics'
  | 'alerts'
  | 'recommendations'
  | 'environmental';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [deviceSetupComplete, setDeviceSetupComplete] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('dashboard');
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [isSimulationMode, setIsSimulationMode] = useState(true);
  const [threshold, setThreshold] = useState(25);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (!user) return;

    const now = new Date();
    const historicalData: ConsumptionData[] = [];

    for (let dayOffset = 90; dayOffset >= 0; dayOffset--) {
      const baseDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);

      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date(baseDate);
        timestamp.setHours(hour, 0, 0, 0);

        const isBusinessHour = hour >= 7 && hour <= 18;
        const baseConsumption = user.type === 'industrial' ? 4.5 : 2.2;
        const variableConsumption = isBusinessHour
          ? Math.random() * (user.type === 'industrial' ? 5.5 : 2.8)
          : Math.random() * (user.type === 'industrial' ? 2.2 : 1.2);

        const consumo_kwh = Number((baseConsumption + variableConsumption).toFixed(2));
        const costo_cop = Math.round(consumo_kwh * 750);

        historicalData.push({
          id_usuario: user.email,
          fecha: timestamp,
          consumo_kwh,
          costo_cop,
          voltaje: Number((220 + Math.random() * 15).toFixed(2)),
          corriente: Number((15 + Math.random() * 45).toFixed(2)),
        });
      }
    }

    setConsumptionData(historicalData.slice(-5000));
  }, [user]);

  useEffect(() => {
    if (!user || !deviceSetupComplete || !isSimulationMode) return;

    const interval = setInterval(() => {
      const currentHour = new Date().getHours();
      const isBusinessHour = currentHour >= 7 && currentHour <= 18;

      const baseConsumption = user.type === 'industrial' ? 6 : 3;
      const variableConsumption = isBusinessHour
        ? Math.random() * (user.type === 'industrial' ? 6 : 3.5)
        : Math.random() * (user.type === 'industrial' ? 2.5 : 1.5);

      const consumo_kwh = Number((baseConsumption + variableConsumption).toFixed(2));
      const costo_cop = Math.round(consumo_kwh * 750);

      const newData: ConsumptionData = {
        id_usuario: user.email,
        fecha: new Date(),
        consumo_kwh,
        costo_cop,
        voltaje: Number((220 + Math.random() * 10).toFixed(2)),
        corriente: Number((10 + Math.random() * 50).toFixed(2)),
      };

      setConsumptionData((prev) => {
        const updated = [...prev, newData];
        return updated.slice(-5000);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [user, deviceSetupComplete, isSimulationMode]);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleDeviceSetupComplete = (simulationMode: boolean) => {
    setIsSimulationMode(simulationMode);
    setDeviceSetupComplete(true);
  };

  const handleLogout = () => {
    setUser(null);
    setDeviceSetupComplete(false);
    setConsumptionData([]);
    setCurrentScreen('dashboard');
    setIsSimulationMode(true);
    setThreshold(25);
    setIsDarkMode(false);
  };

  if (!user) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  if (!deviceSetupComplete) {
    return (
      <>
        <DeviceSetup onComplete={handleDeviceSetupComplete} userName={user.name} />
        <Toaster />
      </>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
        {currentScreen === 'dashboard' && (
          <Dashboard
            user={user}
            consumptionData={consumptionData}
            threshold={threshold}
            onNavigate={setCurrentScreen}
            onLogout={handleLogout}
            isSimulationMode={isSimulationMode}
            onToggleSimulation={() => setIsSimulationMode((prev) => !prev)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
          />
        )}

        {currentScreen === 'statistics' && (
          <Statistics
            consumptionData={consumptionData}
            onNavigate={setCurrentScreen}
            isDarkMode={isDarkMode}
          />
        )}

        {currentScreen === 'alerts' && (
          <Alerts
            consumptionData={consumptionData}
            threshold={threshold}
            onThresholdChange={setThreshold}
            onNavigate={setCurrentScreen}
            isDarkMode={isDarkMode}
          />
        )}

        {currentScreen === 'recommendations' && (
          <Recommendations
            onNavigate={setCurrentScreen}
            isDarkMode={isDarkMode}
          />
        )}

        {currentScreen === 'environmental' && (
          <Environmental
            consumptionData={consumptionData}
            onNavigate={setCurrentScreen}
            isDarkMode={isDarkMode}
          />
        )}

        <Toaster />
      </div>
    </div>
  );
}