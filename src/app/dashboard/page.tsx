'use client'

import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { getSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { testDatabaseConnection } from '@/lib/testFirebase';
// import NotificationManager from '@/components/NotificationManager';
// import AlertStatus from '@/components/AlertStatus';
// import { notificationService } from '@/lib/notificationService';
import AuthForm from '@/components/AuthForm';
import NotificationButton from '@/components/NotificationButton';
import { fetchUserProfile, upsertUserSettings } from '@/lib/userService';
import { useUser } from '@/lib/useUser';

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
  console.log('Dashboard page rendering');
  
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const [data, setData] = useState(generateDummyData())
  const [currentMetrics, setCurrentMetrics] = useState({
    heartRate: 75,
    oxygen: 98,
    movement: 45,
    location: "Please enable 'Location tracking' on the Settings page",
    coordinates: { lat: 0, lng: 0 }
  })
  const [settings, setSettings] = useState<{ location_tracking_enabled: boolean }>({ location_tracking_enabled: false });
  const [alertThresholds, setAlertThresholds] = useState({
    heartRate: 60,
    oxygen: 95,
    movement: 30
  });
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const { user: authUser, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // For combined graph (60-minute)
  const [sixtyMinuteData, setSixtyMinuteData] = useState(generateDummyData());

  const [showMedicalInfo, setShowMedicalInfo] = useState(false);
  const medicalInfoTimeout = useRef<NodeJS.Timeout | null>(null);

  const [defaults, setDefaults] = useState({
    medical_history_default: '',
    medications_default: '',
    special_notes_default: ''
  });

  const requestLocation = async () => {
    if (!user) return;
    
    // Check if location tracking is enabled in settings
    const { data: settingsData } = await getSupabaseClient()
      .from('settings')
      .select('location_tracking_enabled')
      .eq('id', user.id)
      .single();

    if (!settingsData?.location_tracking_enabled) {
      setCurrentMetrics((prev) => ({ 
        ...prev, 
        location: 'Location tracking is disabled. Enable it in Settings.',
        coordinates: { lat: 0, lng: 0 }
      }));
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const location = data.display_name.split(',').slice(0, 2).join(',');
            setCurrentMetrics((prev) => ({
              ...prev,
              location,
              coordinates: { lat: latitude, lng: longitude },
            }));
          } catch (error) {
            setCurrentMetrics((prev) => ({ 
              ...prev, 
              location: 'Location unavailable',
              coordinates: { lat: 0, lng: 0 }
            }));
          }
        },
        (error) => {
          setCurrentMetrics((prev) => ({ 
            ...prev, 
            location: 'Location unavailable',
            coordinates: { lat: 0, lng: 0 }
          }));
        }
      );
    }
  };

  useEffect(() => {
    async function checkUser() {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
      if (!user) {
        router.push('/');
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
                  location_tracking_enabled: false 
                }
              ]);
            if (insertError) {
              console.error('Error creating settings:', insertError);
            } else {
              setSettings({ location_tracking_enabled: false });
            }
          }
        } else if (settingsData) {
          setSettings({ location_tracking_enabled: !!settingsData.location_tracking_enabled });
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

  // Automatically fetch location when location tracking is enabled
  useEffect(() => {
    if (settings.location_tracking_enabled) {
      requestLocation();
    }
    // Only run when the setting changes
  }, [settings.location_tracking_enabled]);

  // Load alert thresholds
  // useEffect(() => {
  //   const loadThresholds = async () => {
  //     try {
  //       const thresholds = await notificationService.getAlertThresholds();
  //       setAlertThresholds(thresholds);
  //     } catch (error) {
  //       console.error('Error loading thresholds:', error);
  //     }
  //   };
  //   loadThresholds();
  // }, []);

  // Helper to get current location (returns a Promise)
  const getCurrentLocation = () => {
    return new Promise<{ lat: number; lng: number; address: string }>((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject('Geolocation not supported');
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const address = data.display_name.split(',').slice(0, 2).join(',');
            resolve({ lat: latitude, lng: longitude, address });
          } catch (error) {
            reject('Error fetching address');
          }
        },
        (error) => {
          reject('Location unavailable');
        }
      );
    });
  };

  // Monitor vitals and trigger alerts
  useEffect(() => {
    const checkVitals = async () => {
      if (
        currentMetrics.heartRate < alertThresholds.heartRate &&
        currentMetrics.oxygen < alertThresholds.oxygen &&
        currentMetrics.movement < alertThresholds.movement
      ) {
        if (!activeAlert) {
          try {
            // Get location for alert (if possible)
            let locationData = {
              lat: currentMetrics.coordinates.lat,
              lng: currentMetrics.coordinates.lng,
              address: currentMetrics.location,
            };
            try {
              locationData = await getCurrentLocation();
              setCurrentMetrics(prev => ({
                ...prev,
                location: locationData.address,
                coordinates: { lat: locationData.lat, lng: locationData.lng },
              }));
            } catch (e) {
              // If user denies or error, keep previous location
            }

            // Capture screenshot
            // const screenshot = await notificationService.captureScreenshot();

            // Create alert
            // const alertId = await notificationService.createAlert({
            //   userId: user?.id || '',
            //   userName: user?.email || '',
            //   location: locationData,
            //   vitals: {
            //     heartRate: currentMetrics.heartRate,
            //     oxygen: currentMetrics.oxygen,
            //     movement: currentMetrics.movement,
            //   },
            //   timestamp: Date.now(),
            //   screenshot,
            // });

            // setActiveAlert(alertId);
          } catch (error) {
            console.error('Error creating alert:', error);
          }
        }
      } else {
        if (activeAlert) {
          setActiveAlert(null);
        }
      }
    };

    const interval = setInterval(checkVitals, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [currentMetrics, alertThresholds, activeAlert, user]);

  useEffect(() => {
    if (authUser && authUser.id) {
      fetchUserProfile(authUser.id)
        .then((data) => setProfile(data))
        .finally(() => setProfileLoading(false));
    }
  }, [authUser]);

  // Update: Show medical info when alert is triggered, and for 30s after
  useEffect(() => {
    if (activeAlert) {
      setShowMedicalInfo(true);
      if (medicalInfoTimeout.current) clearTimeout(medicalInfoTimeout.current);
    } else if (showMedicalInfo) {
      // Start 30s timer when alert is cleared
      if (medicalInfoTimeout.current) clearTimeout(medicalInfoTimeout.current);
      medicalInfoTimeout.current = setTimeout(() => setShowMedicalInfo(false), 30000);
    }
    return () => {
      if (medicalInfoTimeout.current) clearTimeout(medicalInfoTimeout.current);
    };
  }, [activeAlert]);

  // When admin simulates emergency, also show medical info
  const handleSimulateEmergency = () => {
    setCurrentMetrics(prev => ({ ...prev, heartRate: 0, oxygen: 0, movement: 0 }));
    setShowMedicalInfo(true);
    if (medicalInfoTimeout.current) clearTimeout(medicalInfoTimeout.current);
  };

  useEffect(() => {
    // Fetch profile defaults
    const fetchDefaults = async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase.from('profile_defaults').select('*').limit(1).single();
      if (data) setDefaults(data);
    };
    fetchDefaults();
  }, []);

  if (userLoading || profileLoading) return <div>Loading...</div>;
  if (!user || !profile) return null;

  // Compose address
  const address = [profile.address1, profile.address2, profile.address3, profile.country, profile.postal_code]
    .filter(Boolean)
    .join(', ');

  const getGoogleMapsUrl = () => {
    const { lat, lng } = currentMetrics.coordinates
    return `https://www.google.com/maps?q=${lat},${lng}`
  }

  const handleAlertCancelled = () => {
    setActiveAlert(null);
  };

  const testAlertSystem = () => {
    // Temporarily set vitals below thresholds
    setCurrentMetrics(prev => ({
      ...prev,
      heartRate: alertThresholds.heartRate - 10,
      oxygen: alertThresholds.oxygen - 5,
      movement: alertThresholds.movement - 10
    }));

    // Reset after 5 seconds
    setTimeout(() => {
      setCurrentMetrics(prev => ({
        ...prev,
        heartRate: 75,
        oxygen: 98,
        movement: 45
      }));
    }, 5000);
  };

  // At the top of the DashboardPage function, after profile is loaded
  const isAdmin = profile && profile.is_admin;

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 p-4 space-y-6 dashboard-container">
      {/* User Name & Address */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-8 border-blue-400 mb-2 flex flex-col items-start">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-white mb-1">{profile.full_name}</h1>
        <p className="text-md text-gray-700 dark:text-gray-300 font-medium mb-2 truncate w-full" title={address}>{address}</p>
      </div>

      {/* Location Section */}
      {!settings.location_tracking_enabled ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-8 border-blue-400 mb-2 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Location</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">Please enable 'Location tracking' on the Settings page</p>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-2 mt-4 md:mt-0">
            <button
              onClick={requestLocation}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mb-2 md:mb-0"
            >
              Update Location
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-8 border-blue-400 mb-2 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Location</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentMetrics.location}</p>
            {currentMetrics.coordinates.lat !== 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {currentMetrics.coordinates.lat.toFixed(6)}, {currentMetrics.coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>
          <div className="flex flex-col md:flex-row md:space-x-2 mt-4 md:mt-0">
            <button
              onClick={requestLocation}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mb-2 md:mb-0"
            >
              Update Location
            </button>
            {currentMetrics.coordinates.lat !== 0 && (
              <a
                href={`https://www.google.com/maps?q=${currentMetrics.coordinates.lat},${currentMetrics.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Open in Google Maps
              </a>
            )}
          </div>
        </div>
      )}

      {/* Metrics Summary Cards */}
      <div className="flex flex-row space-x-4">
        <div className="flex-1 bg-white dark:bg-gray-800 px-[12px] py-6 rounded-xl shadow-lg border-t-8 border-blue-400 flex flex-col items-center">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Heart Rate</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{currentMetrics.heartRate} BPM</p>
        </div>
        <div className="flex-1 bg-white dark:bg-gray-800 px-[12px] py-6 rounded-xl shadow-lg border-t-8 border-blue-400 flex flex-col items-center">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oxygen</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentMetrics.oxygen}%</p>
        </div>
        <div className="flex-1 bg-white dark:bg-gray-800 px-[12px] py-6 rounded-xl shadow-lg border-t-8 border-blue-400 flex flex-col items-center">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Movement</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{currentMetrics.movement}%</p>
        </div>
      </div>

      {/* Combined 60-Minute Graph */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-8 border-blue-400 mt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">60-Minute History</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sixtyMinuteData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Line type="monotone" dataKey="heartRate" stroke="#ef4444" name="Heart Rate" />
              <Line type="monotone" dataKey="oxygen" stroke="#3b82f6" name="Oxygen" />
              <Line type="monotone" dataKey="movement" stroke="#10b981" name="Movement" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Modern Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-4 rounded-full bg-red-500"></span>
            <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">Heart Rate</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-4 rounded-full bg-blue-500"></span>
            <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">Oxygen</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-4 rounded-full bg-green-500"></span>
            <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">Movement</span>
          </div>
        </div>
      </div>

      {/* Emergency Information Section (always visible) */}
      <div className="bg-red-50 dark:bg-red-900 p-6 rounded-xl shadow-lg border-t-8 border-red-400 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-red-700 dark:text-red-200">Emergency Information</h3>
          <span className="text-sm text-red-700 dark:text-red-200 ml-4">Please edit these details on the Profile Page.</span>
        </div>
        {/* Emergency Contacts */}
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Emergency Contact 1</h4>
          <div className="ml-2 break-words">
            <div><span className="font-medium">Name:</span> <span className="break-all">{profile.emergency_contact1_name || 'None provided'}</span></div>
            <div><span className="font-medium">Mobile #:</span> <span className="break-all">{profile.emergency_contact1_phone || 'None provided'}</span></div>
            <div><span className="font-medium">Email:</span> <span className="break-all">{profile.emergency_contact1_email || 'None provided'}</span></div>
          </div>
        </div>
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Emergency Contact 2</h4>
          <div className="ml-2 break-words">
            <div><span className="font-medium">Name:</span> <span className="break-all">{profile.emergency_contact2_name || 'None provided'}</span></div>
            <div><span className="font-medium">Mobile #:</span> <span className="break-all">{profile.emergency_contact2_phone || 'None provided'}</span></div>
            <div><span className="font-medium">Email:</span> <span className="break-all">{profile.emergency_contact2_email || 'None provided'}</span></div>
          </div>
        </div>
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Emergency Contact 3</h4>
          <div className="ml-2 break-words">
            <div><span className="font-medium">Name:</span> <span className="break-all">{profile.emergency_contact3_name || 'None provided'}</span></div>
            <div><span className="font-medium">Mobile #:</span> <span className="break-all">{profile.emergency_contact3_phone || 'None provided'}</span></div>
            <div><span className="font-medium">Email:</span> <span className="break-all">{profile.emergency_contact3_email || 'None provided'}</span></div>
          </div>
        </div>
        {/* Medical Info */}
        <div className="mb-2">
          <div className="font-semibold">Relevant Medical History</div>
          <div className="whitespace-pre-line break-words">{profile.medical_history || defaults.medical_history_default}</div>
        </div>
        <div className="mb-2">
          <div className="font-semibold">Current Medications:</div>
          <div className="whitespace-pre-line break-words">{profile.medications || defaults.medications_default}</div>
        </div>
        <div>
          <div className="font-semibold">Special Notes:</div>
          <div className="whitespace-pre-line break-words">{profile.special_notes || defaults.special_notes_default}</div>
        </div>
      </div>
    </div>
  )
} 