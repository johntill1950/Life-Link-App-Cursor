import { useState, useEffect } from 'react';
// import { notificationService } from '@/lib/notificationService';

export default function AlertThresholds() {
  const [thresholds, setThresholds] = useState({
    heartRate: 60,
    oxygen: 95,
    movement: 30
  });

  useEffect(() => {
    const loadThresholds = async () => {
      try {
        // const simulationData = await notificationService.getSimulationData();
        if (simulationData?.thresholds) {
          setThresholds(simulationData.thresholds);
        }
      } catch (error) {
        console.error('Error loading thresholds:', error);
      }
    };

    loadThresholds();
    // Set up real-time updates for simulation data
    const interval = setInterval(loadThresholds, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-8 border-blue-400">
      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Alert Thresholds</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Heart Rate Threshold
          </label>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{thresholds.heartRate} BPM</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Oxygen Threshold
          </label>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{thresholds.oxygen}%</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Movement Threshold
          </label>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{thresholds.movement}%</p>
        </div>
      </div>
    </div>
  );
} 