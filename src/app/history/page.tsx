'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'

// Dummy data generator for 7 days
const generateDummyData = () => {
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

export default function HistoryPage() {
  const [data] = useState(generateDummyData())
  const [selectedMetric, setSelectedMetric] = useState<'heartRate' | 'oxygen' | 'movement'>('heartRate')

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">History</h1>

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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">7-Day History</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Table */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Min</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Max</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Average</th>
            </tr>
          </thead>
          <tbody>
            {data.map((day) => (
              <tr key={day.date} className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{day.date}</td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  {day[selectedMetric].min}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  {day[selectedMetric].max}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  {day[selectedMetric].avg}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 