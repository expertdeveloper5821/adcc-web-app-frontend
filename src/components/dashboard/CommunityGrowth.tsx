import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jul', members: 820 },
  { month: 'Aug', members: 1050 },
  { month: 'Sep', members: 1380 },
  { month: 'Oct', members: 1620 },
  { month: 'Nov', members: 1890 },
  { month: 'Dec', members: 2240 },
  { month: 'Jan', members: 2580 },
];

export function CommunityGrowth() {
  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white">
      <h2 className="text-xl mb-6" style={{ color: '#333' }}>Community Growth</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} />
          <YAxis tick={{ fill: '#666', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFF9EF',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          />
          <Bar dataKey="members" fill="#C12D32" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
