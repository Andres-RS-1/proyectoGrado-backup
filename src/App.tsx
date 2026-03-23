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
  type: 'hogar' | 'local';
}

export interface ConsumptionData {
  id_usuario: string;
  fecha: Date;
  consumo_watts: number;
  voltaje: number;
  corriente: number;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [deviceSetupComplete, setDeviceSetupComplete] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'statistics' | 'alerts' | 'recommendations' | 'environmental'>('dashboard');
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [isSimulationMode, setIsSimulationMode] = useState(true);
  const [threshold, setThreshold] = useState(1000);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Simulate IoT data
  useEffect(() => {
    if (!user || !isSimulationMode) return;

    const interval = setInterval(() => {
      const newData: ConsumptionData = {
        id_usuario: user.email,
        fecha: new Date(),
        consumo_watts: Math.floor(Math.random() * 1500) + 300,
        voltaje: 110 + Math.random() * 10,
        corriente: (Math.random() * 15) + 2
      };

      setConsumptionData(prev => {
        const newArray = [...prev, newData];
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return newArray.filter(d => d.fecha > oneDayAgo);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [user, isSimulationMode]);

  // Generate initial historical data
  useEffect(() => {
    if (!user) return;

    const historicalData: ConsumptionData[] = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      for (let hour = 0; hour < 24; hour++) {
        const dataPoint = new Date(date);
        dataPoint.setHours(hour);
        
        historicalData.push({
          id_usuario: user.email,
          fecha: dataPoint,
          consumo_watts: Math.floor(Math.random() * 1500) + 300,
          voltaje: 110 + Math.random() * 10,
          corriente: (Math.random() * 15) + 2
        });
      }
    }

    setConsumptionData(historicalData);
  }, [user]);

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
        <DeviceSetup 
          onComplete={handleDeviceSetupComplete} 
          userName={user.name}
        />
        <Toaster />
      </>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        {currentScreen === 'dashboard' && (
          <Dashboard
            user={user}
            consumptionData={consumptionData}
            threshold={threshold}
            onNavigate={setCurrentScreen}
            onLogout={handleLogout}
            isSimulationMode={isSimulationMode}
            onToggleSimulation={() => setIsSimulationMode(!isSimulationMode)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
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
