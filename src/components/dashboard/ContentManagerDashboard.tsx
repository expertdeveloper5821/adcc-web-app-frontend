import React from 'react';
import { FileText, Calendar, MessageSquare, ShoppingBag, TrendingUp, Image } from 'lucide-react';
import { StatCard } from './StatCard';

interface ContentManagerDashboardProps {
  navigate: (page: string, params?: any) => void;
}

export function ContentManagerDashboard({ navigate }: ContentManagerDashboardProps) {
  const banners = [
    { title: 'Homepage Hero', status: 'Active', clicks: 1247, ctr: '3.2%' },
    { title: 'Event Promotion', status: 'Active', clicks: 892, ctr: '2.8%' },
    { title: 'New Track Launch', status: 'Scheduled', clicks: 0, ctr: '-' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Content Dashboard</h1>
        <p style={{ color: '#666' }}>Manage marketing content and campaigns</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Banners"
          value="8"
          icon={<Image className="w-6 h-6" />}
          trend="+2"
          onClick={() => navigate('cms')}
        />
        <StatCard
          label="Events Promoted"
          value="12"
          icon={<Calendar className="w-6 h-6" />}
          trend="+4"
          onClick={() => navigate('events')}
        />
        <StatCard
          label="Feed Posts"
          value="47"
          icon={<MessageSquare className="w-6 h-6" />}
          trend="+8"
          onClick={() => navigate('feed')}
        />
        <StatCard
          label="Featured Items"
          value="15"
          icon={<ShoppingBag className="w-6 h-6" />}
          trend="+3"
          onClick={() => navigate('marketplace')}
        />
      </div>

      {/* Homepage Banners */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl" style={{ color: '#333' }}>Homepage Banners</h2>
          <button
            onClick={() => navigate('cms')}
            className="px-4 py-2 rounded-lg text-white text-sm"
            style={{ backgroundColor: '#C12D32' }}
          >
            Manage Content
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.map((banner, index) => (
            <div key={index} className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm" style={{ color: '#333' }}>{banner.title}</span>
                <span
                  className="px-2 py-1 rounded text-xs text-white"
                  style={{ backgroundColor: banner.status === 'Active' ? '#CF9F0C' : '#999' }}
                >
                  {banner.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs mb-1" style={{ color: '#999' }}>Clicks</div>
                  <div className="text-sm" style={{ color: '#333' }}>{banner.clicks.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: '#999' }}>CTR</div>
                  <div className="text-sm" style={{ color: '#333' }}>{banner.ctr}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Event Promotions</h2>
          <div className="space-y-3">
            {[
              { name: 'Al Wathba Morning Ride', views: 3420, registrations: 124 },
              { name: 'Yas Island Sprint', views: 2890, registrations: 89 },
              { name: 'Desert Adventure', views: 2340, registrations: 67 },
            ].map((event, index) => (
              <div key={index} className="p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                <div className="text-sm mb-2" style={{ color: '#333' }}>{event.name}</div>
                <div className="flex items-center justify-between text-xs" style={{ color: '#666' }}>
                  <span>{event.views.toLocaleString()} views</span>
                  <span>{event.registrations} registrations</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Feed Engagement</h2>
          <div className="space-y-3">
            {[
              { type: 'Club Announcement', likes: 342, comments: 67, shares: 23 },
              { type: 'Event Highlight', likes: 289, comments: 45, shares: 18 },
              { type: 'Member Spotlight', likes: 234, comments: 38, shares: 12 },
            ].map((post, index) => (
              <div key={index} className="p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                <div className="text-sm mb-2" style={{ color: '#333' }}>{post.type}</div>
                <div className="flex items-center justify-between text-xs" style={{ color: '#666' }}>
                  <span>{post.likes} likes</span>
                  <span>{post.comments} comments</span>
                  <span>{post.shares} shares</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
