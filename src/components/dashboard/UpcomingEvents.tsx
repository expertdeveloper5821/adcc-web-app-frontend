import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Star } from 'lucide-react';

const events = [
  {
    id: '1',
    name: 'Al Wathba Morning Ride',
    city: 'Abu Dhabi',
    date: 'Jan 15, 2026',
    track: 'Al Wathba Circuit',
    registrations: 124,
    capacity: 150,
    rating: 4.8,
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1707297391684-e07bd2368432?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWNsaW5nJTIwZ3JvdXAlMjByb2FkfGVufDF8fHx8MTc2ODEzNjQzNXww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: '2',
    name: 'Yas Island Sprint Challenge',
    city: 'Abu Dhabi',
    date: 'Jan 18, 2026',
    track: 'Yas Marina Circuit',
    registrations: 89,
    capacity: 100,
    rating: 4.9,
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1716738634956-1494117b349b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWtlJTIwcmFjZSUyMHRyYWNrfGVufDF8fHx8MTc2ODEzNjQzNXww&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: '3',
    name: 'Desert Adventure Ride',
    city: 'Al Ain',
    date: 'Jan 22, 2026',
    track: 'Desert Route 1',
    registrations: 67,
    capacity: 80,
    rating: 4.7,
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1718527192815-bb68dd23ce74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBjeWNsaW5nJTIwdWFlfGVufDF8fHx8MTc2ODEzNjQzNnww&ixlib=rb-4.1.0&q=80&w=400'
  },
];

export function UpcomingEvents({ navigate }: UpcomingEventsProps) {
  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl" style={{ color: '#333' }}>Upcoming Events</h2>
        <button
          onClick={() => navigate('/events')}
          className="text-sm hover:underline"
          style={{ color: '#C12D32' }}
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Event</th>
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>City</th>
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Date</th>
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Track</th>
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Registrations</th>
              <th className="text-left py-3 px-2 text-sm" style={{ color: '#666' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="text-sm" style={{ color: '#333' }}>{event.name}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: '#999' }} />
                    <span className="text-sm" style={{ color: '#333' }}>{event.city}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: '#999' }} />
                    <span className="text-sm" style={{ color: '#333' }}>{event.date}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-sm" style={{ color: '#333' }}>{event.track}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" style={{ color: '#999' }} />
                    <span className="text-sm" style={{ color: '#333' }}>{event.registrations}/{event.capacity}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" style={{ color: '#CF9F0C' }} />
                    <span className="text-sm" style={{ color: '#333' }}>{event.rating}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
