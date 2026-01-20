import React from 'react';
import { Upload, Image, Video, FileText } from 'lucide-react';

const media = [
  { id: '1', url: 'https://images.unsplash.com/photo-1707297391684-e07bd2368432?w=300', type: 'image', name: 'cycling-group.jpg' },
  { id: '2', url: 'https://images.unsplash.com/photo-1716738634956-1494117b349b?w=300', type: 'image', name: 'track-race.jpg' },
  { id: '3', url: 'https://images.unsplash.com/photo-1718527192815-bb68dd23ce74?w=300', type: 'image', name: 'desert-ride.jpg' },
];

export function MediaLibrary() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Media Library</h1>
          <p style={{ color: '#666' }}>Manage images, videos, and documents</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-lg text-white" style={{ backgroundColor: '#C12D32' }}>
          <Upload className="w-5 h-5" />
          <span>Upload Media</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media.map((item) => (
          <div key={item.id} className="rounded-xl overflow-hidden shadow-sm bg-white">
            <img src={item.url} alt={item.name} className="w-full h-32 object-cover" />
            <div className="p-2">
              <p className="text-xs truncate" style={{ color: '#666' }}>{item.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
