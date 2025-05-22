'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays, subHours } from 'date-fns'
import { getSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Dummy data generator for 7 days
const generateSevenDayData = () => {
  const data = []
  const now = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = subDays(now, 6 - i)
    data.push({
      date: format(date, 'MMM dd'),
      heartRate: {
        min: Math.floor(Math.random() * (80 - 60) + 60),
        max: Math.floor(Math.random() * (100 - 80) + 80),
        avg: Math.floor(Math.random() * (90 - 70) + 70),
      },
      oxygen: {
        min: Math.floor(Math.random() * (98 - 95) + 95),
        max: 100,
        avg: Math.floor(Math.random() * (99 - 96) + 96),
      },
      movement: {
        min: Math.floor(Math.random() * 30),
        max: Math.floor(Math.random() * (100 - 70) + 70),
        avg: Math.floor(Math.random() * (70 - 40) + 40),
      },
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

export default function HistoryPage() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'heartRate' | 'oxygen' | 'movement'>('heartRate');
  const [sevenDayData] = useState(generateSevenDayData());
  const [twentyFourHourData] = useState(generateTwentyFourHourData());

  const data = timeRange === '24h' ? twentyFourHourData : sevenDayData;

  useEffect(() => {
    async function checkUser() {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
      if (!user) {
        router.push("/login");
      }
    }
    checkUser();
  }, []);

  if (authLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">History</h1>

      {/* Time Range Selector */}
      <div className="flex space-x-4 mb-4">
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

      {/* Metric Selector */}
      <div className="flex space-x-4">
        <button
          onClick={() => setSelectedMetric('heartRate')}
          className={`px-4 py-2 rounded-lg ${
            selectedMetric === 'heartRate'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Heart Rate
        </button>
        <button
          onClick={() => setSelectedMetric('oxygen')}
          className={`px-4 py-2 rounded-lg ${
            selectedMetric === 'oxygen'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Oxygen
        </button>
        <button
          onClick={() => setSelectedMetric('movement')}
          className={`px-4 py-2 rounded-lg ${
            selectedMetric === 'movement'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Movement
        </button>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {timeRange === '24h' ? '24-Hour History' : '7-Day History'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={timeRange === '24h' ? 'time' : 'date'} />
              <YAxis />
              <Tooltip />
              {timeRange === '24h' ? (
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={
                    selectedMetric === 'heartRate'
                      ? '#ef4444'
                      : selectedMetric === 'oxygen'
                      ? '#3b82f6'
                      : '#10b981'
                  }
                  name={selectedMetric === 'heartRate' ? 'Heart Rate' : selectedMetric === 'oxygen' ? 'Oxygen' : 'Movement'}
                />
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey={`${selectedMetric}Min`}
                    stroke="#ef4444"
                    name="Min"
                  />
                  <Line
                    type="monotone"
                    dataKey={`${selectedMetric}Max`}
                    stroke="#3b82f6"
                    name="Max"
                  />
                  <Line
                    type="monotone"
                    dataKey={`${selectedMetric}Avg`}
                    stroke="#10b981"
                    name="Avg"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}