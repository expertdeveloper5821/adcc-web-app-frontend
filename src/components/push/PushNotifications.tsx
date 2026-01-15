import React from 'react';
import { Send, Users, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PushNotificationsProps {
  navigate: (page: string) => void;
}

export function PushNotifications({ navigate }: PushNotificationsProps) {
  const handleSend = () => {
    toast.success('Push notification sent');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Push Notifications</h1>
        <p style={{ color: '#666' }}>Send notifications to app users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Create Campaign</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Title</label>
              <input
                type="text"
                placeholder="Notification title"
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Message</label>
              <textarea
                placeholder="Notification message"
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Audience</label>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-200">
                <option>All Users (12,458)</option>
                <option>Active Users (8,234)</option>
                <option>Event Participants</option>
                <option>Chapter Members</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Schedule</label>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="px-4 py-2 rounded-lg border border-gray-200" />
                <input type="time" className="px-4 py-2 rounded-lg border border-gray-200" />
              </div>
            </div>
            <button
              onClick={handleSend}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white"
              style={{ backgroundColor: '#C12D32' }}
            >
              <Send className="w-5 h-5" />
              <span>Send Notification</span>
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Preview</h2>
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9EF' }}>
            <div className="text-sm mb-2" style={{ color: '#333' }}>Notification Title</div>
            <p className="text-xs" style={{ color: '#666' }}>Your message will appear here...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
