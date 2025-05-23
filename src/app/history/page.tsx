'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays, subHours, subMinutes } from 'date-fns'
import { useUser } from '@/lib/useUser';
import { useRouter } from "next/navigation";

// Dummy data generator for 7 days (flattened)
const generateSevenDayData = () => {
  const data = []
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const date = subDays(now, 6 - i)
    data.push({
      date: format(date, 'MMM dd'),
      heartRateMin: Math.floor(Math.random() * (80 - 60) + 60),
      heartRateMax: Math.floor(Math.random() * (100 - 80) + 80),
      heartRateAvg: Math.floor(Math.random() * (90 - 70) + 70),
      oxygenMin: Math.floor(Math.random() * (98 - 95) + 95),
      oxygenMax: 100,
      oxygenAvg: Math.floor(Math.random() * (99 - 96) + 96),
      movementMin: Math.floor(Math.random() * 30),
      movementMax: Math.floor(Math.random() * (100 - 70) + 70),
      movementAvg: Math.floor(Math.random() * (70 - 40) + 40),
    })
  }
  return data
}

// Dummy data generator for 24 hours
const generateTwentyFourHourData = () => {
  const data = []
  const now = new Date()
  for (let i = 0; i < 24; i++) {
    const time = subHours(now, 23 - i)
    data.push({
      time: format(time, 'HH:mm'),
      heartRate: Math.floor(Math.random() * (100 - 60) + 60),
      oxygen: Math.floor(Math.random() * (100 - 95) + 95),
      movement: Math.floor(Math.random() * 100),
    })
  }
  return data
}

// Dummy data generator for 60 minutes
const generateSixtyMinuteData = () => {
  const data = []
  const now = new Date()
  for (let i = 0; i < 60; i++) {
    const time = subMinutes(now, 59 - i)
    data.push({
      time: format(time, 'HH:mm'),
      heartRate: Math.floor(Math.random() * (100 - 60) + 60),
      oxygen: Math.floor(Math.random() * (100 - 95) + 95),
      movement: Math.floor(Math.random() * 100),
    })
  }
  return data
}

export default function HistoryPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [timeRange, setTimeRange] = useState<'60m' | '24h' | '7d'>('7d');
  const [sevenDayData] = useState(generateSevenDayData());
  const [twentyFourHourData] = useState(generateTwentyFourHourData());
  const [sixtyMinuteData] = useState(generateSixtyMinuteData());

  let data;
  if (timeRange === '60m') data = sixtyMinuteData;
  else if (timeRange === '24h') data = twentyFourHourData;
  else data = sevenDayData;

  useEffect(() => {
    if (!user && !userLoading) {
      router.push("/login");
      return;
    }
  }, [user, userLoading]);

  if (userLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">History</h1>

      {/* Time Range Selector */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setTimeRange('60m')}
          className={`px-4 py-2 rounded-lg ${
            timeRange === '60m'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          60 Minutes
        </button>
        <button
          onClick={() => setTimeRange('24h')}
          className={`px-4 py-2 rounded-lg ${
            timeRange === '24h'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          24 Hours
        </button>
        <button
          onClick={() => setTimeRange('7d')}
          className={`px-4 py-2 rounded-lg ${
            timeRange === '7d'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          7 Days
        </button>
      </div>

      {/* Combined Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {timeRange === '60m' ? '60-Minute History' : timeRange === '24h' ? '24-Hour History' : '7-Day History'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={timeRange === '7d' ? 'date' : 'time'} />
              <YAxis />
              <Tooltip />
              {timeRange === '7d' ? (
                <>
                  <Line type="monotone" dataKey="heartRateMin" stroke="#ef4444" name="Heart Rate Min" />
                  <Line type="monotone" dataKey="heartRateMax" stroke="#f59e42" name="Heart Rate Max" />
                  <Line type="monotone" dataKey="heartRateAvg" stroke="#fbbf24" name="Heart Rate Avg" />
                  <Line type="monotone" dataKey="oxygenMin" stroke="#3b82f6" name="Oxygen Min" />
                  <Line type="monotone" dataKey="oxygenMax" stroke="#60a5fa" name="Oxygen Max" />
                  <Line type="monotone" dataKey="oxygenAvg" stroke="#93c5fd" name="Oxygen Avg" />
                  <Line type="monotone" dataKey="movementMin" stroke="#10b981" name="Movement Min" />
                  <Line type="monotone" dataKey="movementMax" stroke="#34d399" name="Movement Max" />
                  <Line type="monotone" dataKey="movementAvg" stroke="#6ee7b7" name="Movement Avg" />
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey="heartRate" stroke="#ef4444" name="Heart Rate" />
                  <Line type="monotone" dataKey="oxygen" stroke="#3b82f6" name="Oxygen" />
                  <Line type="monotone" dataKey="movement" stroke="#10b981" name="Movement" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heart Rate Only Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Heart Rate</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={timeRange === '7d' ? 'date' : 'time'} />
              <YAxis />
              <Tooltip />
              {timeRange === '7d' ? (
                <>
                  <Line type="monotone" dataKey="heartRateMin" stroke="#ef4444" name="Min" />
                  <Line type="monotone" dataKey="heartRateMax" stroke="#f59e42" name="Max" />
                  <Line type="monotone" dataKey="heartRateAvg" stroke="#fbbf24" name="Avg" />
                </>
              ) : (
                <Line type="monotone" dataKey="heartRate" stroke="#ef4444" name="Heart Rate" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Oxygen Only Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Oxygen</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={timeRange === '7d' ? 'date' : 'time'} />
              <YAxis />
              <Tooltip />
              {timeRange === '7d' ? (
                <>
                  <Line type="monotone" dataKey="oxygenMin" stroke="#3b82f6" name="Min" />
                  <Line type="monotone" dataKey="oxygenMax" stroke="#60a5fa" name="Max" />
                  <Line type="monotone" dataKey="oxygenAvg" stroke="#93c5fd" name="Avg" />
                </>
              ) : (
                <Line type="monotone" dataKey="oxygen" stroke="#3b82f6" name="Oxygen" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Movement Only Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Movement</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={timeRange === '7d' ? 'date' : 'time'} />
              <YAxis />
              <Tooltip />
              {timeRange === '7d' ? (
                <>
                  <Line type="monotone" dataKey="movementMin" stroke="#10b981" name="Min" />
                  <Line type="monotone" dataKey="movementMax" stroke="#34d399" name="Max" />
                  <Line type="monotone" dataKey="movementAvg" stroke="#6ee7b7" name="Avg" />
                </>
              ) : (
                <Line type="monotone" dataKey="movement" stroke="#10b981" name="Movement" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}