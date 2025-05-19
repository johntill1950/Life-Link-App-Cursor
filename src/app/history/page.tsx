'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays, subHours } from 'date-fns'

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
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('7d')
  const [selectedMetric, setSelectedMetric] = useState<'heartRate' | 'oxygen' | 'movement'>('heartRate')
  const [sevenDayData] = useState(generateSevenDayData())
  const [twentyFourHourData] = useState(generateTwentyFourHourData())

  const data = timeRange === '24h' ? twentyFourHourData : sevenDayData

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
                    dataKey={`${selectedMetric}.min`}
                    stroke="#ef4444"
                    name="Min"
                  />
                  <Line
                    type="monotone"
                    dataKey={`${selectedMetric}.max`}
                    stroke="#3b82f6"
                    name="Max"
                  />
                  <Line
                    type="monotone"
                    dataKey={`${selectedMetric}.avg`}
                    stroke="#10b981"
                    name="Average"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Table */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                {timeRange === '24h' ? 'Time' : 'Date'}
              </th>
              {timeRange === '24h' ? (
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Value</th>
              ) : (
                <>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Min</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Max</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Average</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const key = 'time' in item ? item.time : ('date' in item ? item.date : Math.random().toString())
              return (
                <tr key={key} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {'time' in item ? item.time : ('date' in item ? item.date : '')}
                  </td>
                  {timeRange === '24h' ? (
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {typeof item[selectedMetric] === 'number' ? item[selectedMetric] : ''}
                    </td>
                  ) : (
                    <>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {typeof item[selectedMetric] === 'object' ? item[selectedMetric].min : ''}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {typeof item[selectedMetric] === 'object' ? item[selectedMetric].max : ''}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {typeof item[selectedMetric] === 'object' ? item[selectedMetric].avg : ''}
                      </td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
} 