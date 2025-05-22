'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { getSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Dummy data generator
const generateDummyData = () => {
  const data = []
  const now = new Date()
  
  for (let i = 0; i < 24; i++) {
    data.push({
      time: format(new Date(now.getTime() - (23 - i) * 3600000), 'HH:mm'),
      heartRate: Math.floor(Math.random() * (100 - 60) + 60),
      oxygen: Math.floor(Math.random() * (100 - 95) + 95),
      movement: Math.floor(Math.random() * 100),
    })
  }
  
  return data
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const [data, setData] = useState(generateDummyData())
  const [currentMetrics, setCurrentMetrics] = useState({
    heartRate: 75,
    oxygen: 98,
    movement: 45,
    location: 'Loading location...',
    coordinates: { lat: 0, lng: 0 }
  })

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

    // Get actual location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            const location = data.display_name.split(',').slice(0, 2).join(',')
            setCurrentMetrics(prev => ({ 
              ...prev, 
              location,
              coordinates: { lat: latitude, lng: longitude }
            }))
          } catch (error) {
            console.error('Error fetching location:', error)
            setCurrentMetrics(prev => ({ ...prev, location: 'Location unavailable' }))
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          setCurrentMetrics(prev => ({ ...prev, location: 'Location unavailable' }))
        }
      )
    }

    const interval = setInterval(() => {
      setData(generateDummyData())
      setCurrentMetrics(prev => ({
        ...prev,
        heartRate: Math.floor(Math.random() * (100 - 60) + 60),
        oxygen: Math.floor(Math.random() * (100 - 95) + 95),
        movement: Math.floor(Math.random() * 100),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, []);

  if (authLoading) return <div>Loading...</div>;
  if (!user) return null;

  const getGoogleMapsUrl = () => {
    const { lat, lng } = currentMetrics.coordinates
    return `https://www.google.com/maps?q=${lat},${lng}`
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {/* Current Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Heart Rate</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentMetrics.heartRate} BPM</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oxygen</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentMetrics.oxygen}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Movement</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentMetrics.movement}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentMetrics.location}</p>
          {currentMetrics.coordinates.lat !== 0 && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {currentMetrics.coordinates.lat.toFixed(6)}, {currentMetrics.coordinates.lng.toFixed(6)}
              </p>
              <a
                href={getGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Show in Map
              </a>
            </>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">24-Hour History</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="heartRate" stroke="#ef4444" name="Heart Rate" />
              <Line type="monotone" dataKey="oxygen" stroke="#3b82f6" name="Oxygen" />
              <Line type="monotone" dataKey="movement" stroke="#10b981" name="Movement" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
} 