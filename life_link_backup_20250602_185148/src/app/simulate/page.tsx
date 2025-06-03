"use client";

import { useState, useEffect, useRef } from "react";
import { testDatabaseConnection } from '@/lib/testFirebase';
// import { notificationService } from '@/lib/notificationService';

const SIREN_URL = "/Siren.mp3"; // Use local siren audio from public folder

export default function SimulatePage() {
  // State for simulated vitals
  const [heartRate, setHeartRate] = useState(70);
  const [oxygen, setOxygen] = useState(98);
  const [movement, setMovement] = useState(50);

  // State for thresholds
  const [hrThreshold, setHrThreshold] = useState(50);
  const [oxyThreshold, setOxyThreshold] = useState(90);
  const [moveThreshold, setMoveThreshold] = useState(10);

  // Alarm state
  const [showAlarm, setShowAlarm] = useState(false);
  const [alarmReason, setAlarmReason] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const sirenRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [pauseMonitoring, setPauseMonitoring] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<string | null>(null);

  // Resume monitoring handler
  const handleResumeMonitoring = () => {
    setShowAlarm(false);
    setPauseMonitoring(true);
    setEmergencyTriggered(false);
    setAlarmReason(null);
    setCountdown(30);
    // Pause monitoring for 15 seconds
    setTimeout(() => {
      setPauseMonitoring(false);
    }, 15000);
  };

  // Automatically check vitals and trigger alarm when not paused
  useEffect(() => {
    if (!pauseMonitoring && !showAlarm && !emergencyTriggered) {
      if (
        heartRate < hrThreshold &&
        oxygen < oxyThreshold &&
        movement < moveThreshold
      ) {
        setAlarmReason("All metrics below thresholds");
        setShowAlarm(true);
        setCountdown(30);
        setEmergencyTriggered(false);
      }
    }
    // If any metric is above threshold, close alarm and reset emergencyTriggered
    if (
      (showAlarm || emergencyTriggered) &&
      (!(
        heartRate < hrThreshold &&
        oxygen < oxyThreshold &&
        movement < moveThreshold
      ) || pauseMonitoring)
    ) {
      setShowAlarm(false);
      setAlarmReason(null);
      setCountdown(30);
      setEmergencyTriggered(false);
    }
    // eslint-disable-next-line
  }, [heartRate, oxygen, movement, hrThreshold, oxyThreshold, moveThreshold, pauseMonitoring, showAlarm, emergencyTriggered]);

  // Handle countdown and siren
  useEffect(() => {
    if (showAlarm) {
      // Play siren
      if (sirenRef.current) {
        sirenRef.current.currentTime = 0;
        sirenRef.current.play();
      }
      // Start countdown
      timerRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      // Stop siren and timer
      if (sirenRef.current) sirenRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setCountdown(30);
      setEmergencyTriggered(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sirenRef.current) sirenRef.current.pause();
    };
  }, [showAlarm]);

  const sendEmergencyNotification = async () => {
    try {
      // await notificationService.createAlert({
      //   userId: 'admin',
      //   userName: 'Admin (Simulated)',
      //   location: {
      //     lat: 0,
      //     lng: 0,
      //     address: 'Simulated Location'
      //   },
      //   vitals: {
      //     heartRate,
      //     oxygen,
      //     movement
      //   },
      //   timestamp: Date.now(),
      //   screenshot: ''
      // });
      console.log('Emergency notification sent!');
    } catch (error) {
      console.error('Failed to send emergency notification:', error);
    }
  };

  useEffect(() => {
    if ((showAlarm && countdown === 0) || (!showAlarm && emergencyTriggered)) {
      setEmergencyTriggered(true);
      if (sirenRef.current) sirenRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setShowAlarm(false); // Close modal automatically

      sendEmergencyNotification();
    }
  }, [countdown, showAlarm]);

  useEffect(() => {
    console.log('emergencyTriggered:', emergencyTriggered, 'showAlarm:', showAlarm, 'pauseMonitoring:', pauseMonitoring);
  }, [emergencyTriggered, showAlarm, pauseMonitoring]);

  // Cancel Alarm handler
  const handleCancelAlarm = () => {
    setShowAlarm(false);
    setEmergencyTriggered(true);
    setCountdown(0);
    if (sirenRef.current) sirenRef.current.pause();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleTestConnection = async () => {
    try {
      const result = await testDatabaseConnection();
      if (result.success) {
        setDbTestResult('Database connection successful! Check console for details.');
      } else {
        setDbTestResult('Database connection failed. Check console for details.');
      }
    } catch (error) {
      setDbTestResult('Test failed. Check console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Simulation / Test Page</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-8 border-blue-400 p-8 w-full max-w-lg space-y-6">
        {/* Vital Inputs */}
        <div>
          <label className="block font-medium mb-1">Heart Rate (BPM): {heartRate}</label>
          <input type="range" min="0" max="150" value={heartRate} onChange={e => setHeartRate(Number(e.target.value))} className="w-full" />
          <input type="number" min="0" max="150" value={heartRate} onChange={e => setHeartRate(Number(e.target.value))} className="w-full mb-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Oxygen (%): {oxygen}</label>
          <input type="range" min="60" max="100" value={oxygen} onChange={e => setOxygen(Number(e.target.value))} className="w-full" />
          <input type="number" min="60" max="100" value={oxygen} onChange={e => setOxygen(Number(e.target.value))} className="w-full mb-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Movement: {movement}</label>
          <input type="range" min="0" max="100" value={movement} onChange={e => setMovement(Number(e.target.value))} className="w-full" />
          <input type="number" min="0" max="100" value={movement} onChange={e => setMovement(Number(e.target.value))} className="w-full mb-2" />
        </div>
        {/* Threshold Inputs */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">HR Threshold: {hrThreshold}</label>
            <input type="range" min="0" max="150" value={hrThreshold} onChange={e => setHrThreshold(Number(e.target.value))} className="w-full" />
            <input type="number" min="0" max="150" value={hrThreshold} onChange={e => setHrThreshold(Number(e.target.value))} className="w-full" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Oxygen Threshold: {oxyThreshold}</label>
            <input type="range" min="60" max="100" value={oxyThreshold} onChange={e => setOxyThreshold(Number(e.target.value))} className="w-full" />
            <input type="number" min="60" max="100" value={oxyThreshold} onChange={e => setOxyThreshold(Number(e.target.value))} className="w-full" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Movement Threshold: {moveThreshold}</label>
            <input type="range" min="0" max="100" value={moveThreshold} onChange={e => setMoveThreshold(Number(e.target.value))} className="w-full" />
            <input type="number" min="0" max="100" value={moveThreshold} onChange={e => setMoveThreshold(Number(e.target.value))} className="w-full" />
          </div>
        </div>
      </div>
      <button
        onClick={handleTestConnection}
        className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Test Database Connection
      </button>
      {dbTestResult && (
        <div className="mt-2 text-center text-sm text-blue-700 dark:text-blue-300">{dbTestResult}</div>
      )}

      {/* Alarm Modal */}
      {showAlarm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center border-t-8 border-red-400">
            <audio ref={sirenRef} src={SIREN_URL} loop />
            <h3 className="text-xl font-bold text-red-600 mb-4">ALARM TRIGGERED</h3>
            <p className="mb-2 text-gray-900 dark:text-gray-100">{alarmReason}</p>
            <p className="mb-2 text-gray-900 dark:text-gray-100">Heart Rate: {heartRate}</p>
            <p className="mb-2 text-gray-900 dark:text-gray-100">Oxygen: {oxygen}%</p>
            <p className="mb-2 text-gray-900 dark:text-gray-100">Movement: {movement}</p>
            <p className="mb-4 text-red-600 font-bold text-lg">{!emergencyTriggered ? `Auto-notify in ${countdown}s` : "EMERGENCY NOTIFICATION SENT!"}</p>
            <div className="flex flex-col md:flex-row gap-2">
              <button
                onClick={handleCancelAlarm}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                disabled={emergencyTriggered}
              >
                {emergencyTriggered ? "Locked" : "Cancel Alarm"}
              </button>
              <button
                onClick={handleResumeMonitoring}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Resume monitoring
              </button>
            </div>
          </div>
        </div>
      )}

      {!showAlarm && emergencyTriggered && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
          <h3 className="font-bold">EMERGENCY NOTIFICATION SENT!</h3>
          <p className="text-sm">An emergency alert has been triggered and notifications have been sent.</p>
        </div>
      )}
    </div>
  );
} 