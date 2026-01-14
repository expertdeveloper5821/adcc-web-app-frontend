import React from 'react';
import { UserRole } from '../App';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  MapPin, 
  MessageSquare, 
  ShoppingBag,
  FileText,
  Image,
  Bell,
  UserCog,
  BarChart3,
  Settings,
  Shield,
  Globe,
  Flag
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  currentPage: string;
  navigate: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'community-manager', 'moderator'] },
  { id: 'events', label: 'Events', icon: <Calendar className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'community-manager'] },
  { id: 'communities', label: 'Communities', icon: <Users className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'community-manager'] },
  { id: 'tracks', label: 'Tracks', icon: <MapPin className="w-5 h-5" />, roles: ['super-admin', 'community-manager'] },
  { id: 'feed', label: 'Feed Moderation', icon: <MessageSquare className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'moderator'] },
  { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'moderator'] },
  { id: 'cms', label: 'Content Manager', icon: <FileText className="w-5 h-5" />, roles: ['super-admin', 'content-manager'] },
  { id: 'media', label: 'Media Library', icon: <Image className="w-5 h-5" />, roles: ['super-admin', 'content-manager'] },
  { id: 'push', label: 'Push Notifications', icon: <Bell className="w-5 h-5" />, roles: ['super-admin', 'content-manager'] },
  { id: 'users', label: 'Users', icon: <UserCog className="w-5 h-5" />, roles: ['super-admin', 'moderator'] },
  { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'community-manager', 'moderator'] },
  { id: 'config', label: 'App Configuration', icon: <Settings className="w-5 h-5" />, roles: ['super-admin'] },
  { id: 'languages', label: 'Languages', icon: <Globe className="w-5 h-5" />, roles: ['super-admin'] },
  { id: 'roles', label: 'Roles & Permissions', icon: <Shield className="w-5 h-5" />, roles: ['super-admin'] },
];

export function Sidebar({ currentRole, currentPage, navigate }: SidebarProps) {
  const visibleItems = menuItems.filter(item => item.roles.includes(currentRole));

  return (
    <div className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C12D32' }}>
            <Flag className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-lg" style={{ color: '#333' }}>ADCC Admin</div>
          </div>
        </div>

        <nav className="space-y-1">
          {visibleItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
              style={{
                backgroundColor: currentPage === item.id ? '#ECC180' : 'transparent',
                color: '#333',
              }}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
