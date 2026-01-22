import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserRole } from '../../App';

interface ReportsProps {
  role: UserRole;
}

const data = [
  { month: 'Jul', users: 820, events: 12 },
  { month: 'Aug', users: 1050, events: 15 },
  { month: 'Sep', users: 1380, events: 18 },
  { month: 'Oct', users: 1620, events: 21 },
  { month: 'Nov', users: 1890, events: 25 },
  { month: 'Dec', users: 2240, events: 30 },
  { month: 'Jan', users: 2580, events: 35 },
];

export function Reports({ role }: ReportsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Reports & Analytics</h1>
        <p style={{ color: '#666' }}>View insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>User Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} />
              <YAxis tick={{ fill: '#666', fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#C12D32" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Event Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} />
              <YAxis tick={{ fill: '#666', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="events" fill="#CF9F0C" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
