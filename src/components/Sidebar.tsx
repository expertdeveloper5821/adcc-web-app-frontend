import React from 'react';
import { NavLink } from 'react-router-dom';
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
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

interface MenuItemWithPath extends MenuItem {
  path: string;
}

const menuItems: MenuItemWithPath[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'community-manager', 'moderator'], path: '/dashboard' },
  { id: 'events', label: 'Events', icon: <Calendar className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'community-manager'], path: '/events' },
  { id: 'communities', label: 'Communities', icon: <Users className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'community-manager'], path: '/communities' },
  { id: 'tracks', label: 'Tracks', icon: <MapPin className="w-5 h-5" />, roles: ['super-admin', 'community-manager'], path: '/tracks' },
  { id: 'feed', label: 'Feed Moderation', icon: <MessageSquare className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'moderator'], path: '/feed' },
  { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'moderator'], path: '/marketplace' },
  { id: 'cms', label: 'Content Manager', icon: <FileText className="w-5 h-5" />, roles: ['super-admin', 'content-manager'], path: '/cms' },
  { id: 'media', label: 'Media Library', icon: <Image className="w-5 h-5" />, roles: ['super-admin', 'content-manager'], path: '/media' },
  { id: 'push', label: 'Push Notifications', icon: <Bell className="w-5 h-5" />, roles: ['super-admin', 'content-manager'], path: '/push' },
  { id: 'users', label: 'Users', icon: <UserCog className="w-5 h-5" />, roles: ['super-admin', 'moderator'], path: '/users' },
  { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'community-manager', 'moderator'], path: '/reports' },
  { id: 'config', label: 'App Configuration', icon: <Settings className="w-5 h-5" />, roles: ['super-admin'], path: '/config' },
  { id: 'roles', label: 'Roles & Permissions', icon: <Shield className="w-5 h-5" />, roles: ['super-admin'], path: '/roles' },
];

export function Sidebar({ currentRole, currentPage }: SidebarProps) {
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
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive ? '' : ''
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? '#ECC180' : 'transparent',
                color: '#333',
              })}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
