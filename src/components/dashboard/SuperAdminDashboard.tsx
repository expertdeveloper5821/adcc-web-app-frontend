import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Calendar, Building2, ShoppingBag, MapPin } from 'lucide-react';
import { StatCard } from './StatCard';
import { UpcomingEvents } from './UpcomingEvents';
import { PendingApprovals } from './PendingApprovals';
import { CommunityGrowth } from './CommunityGrowth';
import { RecentActivity } from './RecentActivity';
import { PushPerformance } from './PushPerformance';
import { PopularTracks } from './PopularTracks';

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Dashboard</h1>
        <p style={{ color: '#666' }}>Welcome back, Super Admin</p>
      </div>

      {/* Row 1: Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Users"
          value="12,458"
          icon={<Users className="w-6 h-6" />}
          trend="+12%"
          onClick={() => navigate('/users')}
        />
        <StatCard
          label="Active Users"
          value="8,234"
          icon={<UserCheck className="w-6 h-6" />}
          trend="+8%"
          onClick={() => navigate('/users')}
        />
        <StatCard
          label="Events This Month"
          value="47"
          icon={<Calendar className="w-6 h-6" />}
          trend="+23%"
          onClick={() => navigate('/events')}
        />
        <StatCard
          label="Active Tracks"
          value="24"
          icon={<MapPin className="w-6 h-6" />}
          trend="+4"
          onClick={() => navigate('/tracks')}
        />
        <StatCard
          label="Communities"
          value="28"
          icon={<Building2 className="w-6 h-6" />}
          trend="+3"
          onClick={() => navigate('/communities')}
        />
      </div>

      {/* Row 2: Main Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingEvents />
        </div>
        <PendingApprovals />
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommunityGrowth />
        <PushPerformance />
      </div>

      {/* Row 4: Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <PopularTracks />
      </div>
    </div>
  );
}
