import React from 'react';
import { Settings, Globe, Bell, Shield } from 'lucide-react';

export function AppConfig() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>App Configuration</h1>
        <p style={{ color: '#666' }}>Manage application settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6" style={{ color: '#C12D32' }} />
            <h2 className="text-xl" style={{ color: '#333' }}>General Settings</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>App Name</label>
              <input type="text" defaultValue="ADCC" className="w-full px-4 py-2 rounded-lg border border-gray-200" />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Support Email</label>
              <input type="email" defaultValue="support@adcc.ae" className="w-full px-4 py-2 rounded-lg border border-gray-200" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6" style={{ color: '#C12D32' }} />
            <h2 className="text-xl" style={{ color: '#333' }}>Notifications</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" style={{ accentColor: '#C12D32' }} />
              <span className="text-sm" style={{ color: '#666' }}>Event Reminders</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" style={{ accentColor: '#C12D32' }} />
              <span className="text-sm" style={{ color: '#666' }}>Community Updates</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
