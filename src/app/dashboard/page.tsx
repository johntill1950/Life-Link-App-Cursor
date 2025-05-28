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
    location: 'Click to enable location tracking',
    coordinates: { lat: 0, lng: 0 }
  })
  const [settings, setSettings] = useState<{ location_tracking_enabled: boolean }>({ location_tracking_enabled: true });
  const [lastLocationUpdate, setLastLocationUpdate] = useState<number>(0);

  const requestLocation = () => {
    if (navigator.geolocation && settings.location_tracking_enabled) {
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
            setLastLocationUpdate(Date.now());
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
  };

  useEffect(() => {
    async function checkUser() {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
      if (!user) {
        router.push("/login");
      } else {
        // Fetch user settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('location_tracking_enabled')
          .eq('id', user.id)
          .single();
        
        if (settingsError) {
          console.error('Error fetching settings:', settingsError);
          // Create default settings if they don't exist
          if (settingsError.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('settings')
              .insert([
                { 
                  id: user.id,
                  location_tracking_enabled: true 
                }
              ]);
            if (insertError) {
              console.error('Error creating settings:', insertError);
            } else {
              setSettings({ location_tracking_enabled: true });
            }
          }
        } else if (settingsData) {
          setSettings(settingsData);
        }
      }
    }
    checkUser();

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
  }, [settings.location_tracking_enabled]);

  if (authLoading) return <div>Loading...</div>;
  if (!user) return null;

  const getGoogleMapsUrl = () => {
    const { lat, lng } = currentMetrics.coordinates
    return `https://www.google.com/maps?q=${lat},${lng}`
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {/* Location */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-8 border-blue-400">
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
              className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Show in Map
            </a>
          </>
        )}
        {/* Show the button only if location is not being tracked */}
        {(
          currentMetrics.coordinates.lat === 0 ||
          currentMetrics.location === 'Location unavailable' ||
          currentMetrics.location === 'Click to enable location tracking'
        ) && (
          <button
            onClick={requestLocation}
            className="mt-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 float-right"
          >
            Enable Location Tracking
          </button>
        )}
      </div>

      {/* Metrics Section */}
      <div className="flex space-x-4">
        {/* Heart Rate */}
        <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-8 border-blue-400">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Heart Rate</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentMetrics.heartRate} BPM</p>
        </div>

        {/* Oxygen */}
        <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-8 border-blue-400">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oxygen</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentMetrics.oxygen}%</p>
        </div>

        {/* Movement */}
        <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-8 border-blue-400">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Movement</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentMetrics.movement}%</p>
        </div>
      </div>
    </div>
  )
} 