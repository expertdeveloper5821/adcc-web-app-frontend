import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, TrendingUp, Eye, MousePointerClick } from 'lucide-react';

const campaigns = [
  { name: 'Weekend Ride Reminder', sent: 8234, opened: 6187, clicked: 3421, rate: '75.2%' },
  { name: 'New Track Announcement', sent: 8234, opened: 5876, clicked: 2940, rate: '71.4%' },
  { name: 'Community Milestone', sent: 8234, opened: 5345, clicked: 2138, rate: '64.9%' },
];

export function PushPerformance() {
  const navigate = useNavigate();
  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl" style={{ color: '#333' }}>Push Campaign Performance</h2>
        <button
          onClick={() => navigate('/push')}
          className="text-sm hover:underline"
          style={{ color: '#C12D32' }}
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign, index) => (
          <div key={index} className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: '#333' }}>{campaign.name}</span>
              <div className="flex items-center gap-1 text-sm" style={{ color: '#C12D32' }}>
                <TrendingUp className="w-4 h-4" />
                <span>{campaign.rate}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xs mb-1" style={{ color: '#999' }}>Sent</div>
                <div className="text-sm" style={{ color: '#333' }}>{campaign.sent.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-xs mb-1" style={{ color: '#999' }}>Opened</div>
                <div className="text-sm" style={{ color: '#333' }}>{campaign.opened.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-xs mb-1" style={{ color: '#999' }}>Clicked</div>
                <div className="text-sm" style={{ color: '#333' }}>{campaign.clicked.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
