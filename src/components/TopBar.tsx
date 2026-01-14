import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../App';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TopBarProps {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
}

const roleLabels: Record<UserRole, string> = {
  'super-admin': 'Super Admin',
  'content-manager': 'Content Manager',
  'community-manager': 'Community Manager',
  'moderator': 'Moderator / Support',
};

export function TopBar({ currentRole, setRole }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setRole(role);
    setDropdownOpen(false);
    toast.success(`Viewing as ${roleLabels[role]}`);
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50 flex items-center justify-between px-8">
      <div className="flex items-center gap-4 flex-1 max-w-2xl ml-64">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
            style={{ focusRing: '#C12D32' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Role Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            style={{ backgroundColor: '#ECC180', color: '#333' }}
          >
            <span className="text-sm">View as: {roleLabels[currentRole]}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
              {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                  style={{
                    backgroundColor: role === currentRole ? '#FFF9EF' : 'transparent',
                    color: '#333',
                  }}
                >
                  <div className="text-sm">{roleLabels[role]}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-6 h-6" style={{ color: '#333' }} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#C12D32' }} />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#C12D32' }}>
            <span>AD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
