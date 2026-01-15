import React from 'react';
import { MapPin, Users, Star } from 'lucide-react';

interface PopularTracksProps {
  navigate: (page: string) => void;
}

const tracks = [
  { name: 'Al Wathba Circuit', city: 'Abu Dhabi', users: 1247, rating: 4.8, color: '#C12D32' },
  { name: 'Yas Marina Circuit', city: 'Abu Dhabi', users: 1089, rating: 4.9, color: '#CF9F0C' },
  { name: 'Corniche Road', city: 'Abu Dhabi', users: 892, rating: 4.7, color: '#E1C06E' },
  { name: 'Desert Route 1', city: 'Al Ain', users: 645, rating: 4.6, color: '#ECC180' },
];

export function PopularTracks({ navigate }: PopularTracksProps) {
  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl" style={{ color: '#333' }}>Popular Tracks</h2>
        <button
          onClick={() => navigate('tracks')}
          className="text-sm hover:underline"
          style={{ color: '#C12D32' }}
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {tracks.map((track, index) => (
          <button
            key={index}
            onClick={() => navigate('tracks')}
            className="w-full p-4 rounded-xl transition-all hover:shadow-md text-left"
            style={{ backgroundColor: '#FFF9EF' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ backgroundColor: track.color }}>
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm mb-1" style={{ color: '#333' }}>{track.name}</div>
                <div className="flex items-center gap-1 text-xs" style={{ color: '#999' }}>
                  <MapPin className="w-3 h-3" />
                  <span>{track.city}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pl-11">
              <div className="flex items-center gap-1 text-xs" style={{ color: '#666' }}>
                <Users className="w-3 h-3" />
                <span>{track.users.toLocaleString()} riders</span>
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: '#666' }}>
                <Star className="w-3 h-3 fill-current" style={{ color: '#CF9F0C' }} />
                <span>{track.rating}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
