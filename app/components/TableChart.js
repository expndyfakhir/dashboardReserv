'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TableChart({ data }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm" style={{ height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tableNumber" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="capacity" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}