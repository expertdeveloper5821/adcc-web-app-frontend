import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../App';
import {
  LayoutDashboard,
  Calendar,
  Users,
  MapPin,
  Trophy,
  Award,
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
  permissionSet?: Set<string>;
}

interface MenuItemDef {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
  roles: UserRole[];
  path: string;
}

const menuItems: MenuItemDef[] = [
  { id: 'dashboard', labelKey: 'sidebar.dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'community-manager', 'moderator'], path: '/dashboard' },
  { id: 'events', labelKey: 'sidebar.events', icon: <Calendar className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'community-manager'], path: '/events' },
  { id: 'communities', labelKey: 'sidebar.communities', icon: <Users className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'community-manager'], path: '/communities' },
  { id: 'tracks', labelKey: 'sidebar.tracks', icon: <MapPin className="w-5 h-5" />, roles: ['super-admin', 'community-manager'], path: '/tracks' },
  { id: 'challenges', labelKey: 'sidebar.challenges', icon: <Trophy className="w-5 h-5" />, roles: ['super-admin', 'community-manager'], path: '/challenges' },
  { id: 'badges', labelKey: 'sidebar.badges', icon: <Award className="w-5 h-5" />, roles: ['super-admin', 'community-manager'], path: '/badges' },
  { id: 'feed', labelKey: 'sidebar.feed', icon: <MessageSquare className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'moderator'], path: '/feed' },
  { id: 'marketplace', labelKey: 'sidebar.marketplace', icon: <ShoppingBag className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'moderator'], path: '/marketplace' },
  { id: 'cms', labelKey: 'sidebar.cms', icon: <FileText className="w-5 h-5" />, roles: ['super-admin', 'content-manager'], path: '/cms' },
  { id: 'media', labelKey: 'sidebar.media', icon: <Image className="w-5 h-5" />, roles: ['super-admin', 'content-manager'], path: '/media' },
  { id: 'push', labelKey: 'sidebar.push', icon: <Bell className="w-5 h-5" />, roles: ['super-admin', 'content-manager'], path: '/push' },
  { id: 'users', labelKey: 'sidebar.users', icon: <UserCog className="w-5 h-5" />, roles: ['super-admin', 'moderator'], path: '/users' },
  { id: 'reports', labelKey: 'sidebar.reports', icon: <BarChart3 className="w-5 h-5" />, roles: ['super-admin', 'content-manager', 'community-manager', 'moderator'], path: '/reports' },
  { id: 'config', labelKey: 'sidebar.config', icon: <Settings className="w-5 h-5" />, roles: ['super-admin'], path: '/config' },
  { id: 'languages', labelKey: 'sidebar.languages', icon: <Globe className="w-5 h-5" />, roles: ['super-admin'], path: '/languages' },
  { id: 'roles', labelKey: 'sidebar.roles', icon: <Shield className="w-5 h-5" />, roles: ['super-admin'], path: '/roles' },
];

export function Sidebar({ currentRole, currentPage, permissionSet }: SidebarProps) {
  const { t } = useTranslation();
  const normalizePermissionKey = (key: string) =>
    key.toLowerCase().replace(/[\s-]+/g, '_');
  const hasPermission = (key: string) => {
    if (!permissionSet) return true;
    const aliases = key === 'app_configuration'
      ? ['app_configuration', 'app_configure']
      : [key];
    const wanted = aliases.map(normalizePermissionKey);
    for (const k of permissionSet) {
      if (wanted.includes(normalizePermissionKey(k))) return true;
    }
    return false;
  };

  const visibleItems = menuItems
    .filter(item => item.roles.includes(currentRole))
    .filter((item) => {
      if (item.id === 'events') return hasPermission('manage_events');
      if (item.id === 'users') return hasPermission('manage_users');
      if (item.id === 'feed' || item.id === 'marketplace') return hasPermission('moderate_content');
      if (item.id === 'config') return hasPermission('app_configuration');
      return true;
    });

  return (
    <div className="scroller fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] overflow-x-scroll bg-white shadow-sm border-r border-gray-200 scroll-smooth">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C12D32' }}>
            <Flag className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-lg" style={{ color: '#333' }}>{t('sidebar.appTitle')}</div>
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
              <span className="text-sm">{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
