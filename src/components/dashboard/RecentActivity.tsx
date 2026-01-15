import React from 'react';
import { Calendar, Users, MessageSquare, ShoppingBag, UserPlus, Star } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'event',
    icon: <Calendar className="w-5 h-5" />,
    message: 'New event "Corniche Sunset Ride" was published',
    time: '5 minutes ago',
    color: '#C12D32',
  },
  {
    id: 2,
    type: 'user',
    icon: <UserPlus className="w-5 h-5" />,
    message: '12 new members joined Abu Dhabi Chapter',
    time: '15 minutes ago',
    color: '#CF9F0C',
  },
  {
    id: 3,
    type: 'post',
    icon: <MessageSquare className="w-5 h-5" />,
    message: 'Mohammed Ali posted in Community Feed',
    time: '1 hour ago',
    color: '#ECC180',
  },
  {
    id: 4,
    type: 'marketplace',
    icon: <ShoppingBag className="w-5 h-5" />,
    message: 'New listing: Specialized Road Bike - AED 4,500',
    time: '2 hours ago',
    color: '#E1C06E',
  },
  {
    id: 5,
    type: 'rating',
    icon: <Star className="w-5 h-5" />,
    message: 'Al Wathba Morning Ride received 5-star rating',
    time: '3 hours ago',
    color: '#CF9F0C',
  },
  {
    id: 6,
    type: 'community',
    icon: <Users className="w-5 h-5" />,
    message: 'Dubai Chapter reached 500 members',
    time: '4 hours ago',
    color: '#C12D32',
  },
];

export function RecentActivity() {
  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white">
      <h2 className="text-xl mb-6" style={{ color: '#333' }}>Recent Activity</h2>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${activity.color}20` }}>
              <div style={{ color: activity.color }}>
                {activity.icon}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm mb-1" style={{ color: '#333' }}>{activity.message}</p>
              <p className="text-xs" style={{ color: '#999' }}>{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
