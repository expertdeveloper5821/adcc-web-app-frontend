import React from 'react';
import { MapPin } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  description: string;
  distance: number;
  difficulty: string;
  trackType: string;
}

interface TrackSelectorProps {
  tracks: Track[];
  selectedTrackIds: string[];
  onToggle: (trackId: string) => void;
  city: string;
  country: string;
  loading?: boolean;
}

export const TrackSelector: React.FC<TrackSelectorProps> = ({
  tracks,
  selectedTrackIds,
  onToggle,
  city,
  country,
  loading = false,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
            <MapPin className="w-5 h-5" />
          </div>
          <h2 className="text-xl" style={{ color: '#333' }}>3. Assign Primary Track</h2>
        </div>
        {selectedTrackIds.length > 0 && (
          <span
            className="px-3 py-1 rounded-full text-sm"
            style={{ backgroundColor: '#10B981', color: '#fff' }}
          >
            1 selected
          </span>
        )}
      </div>

      <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
        <p className="text-sm" style={{ color: '#666' }}>
          <strong>Tip:</strong> Select one primary cycling track for this community. Change city above to see different tracks.
        </p>
      </div>

      {loading ? (
        <div className="p-8 rounded-lg text-center" style={{ backgroundColor: '#F3F4F6' }}>
          <p className="text-sm" style={{ color: '#666' }}>Loading tracks…</p>
        </div>
      ) : tracks.length > 0 ? (
        <div className="space-y-3">
          {tracks.map(track => (
            <label
              key={track.id}
              className="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
              style={{
                borderColor: selectedTrackIds.includes(track.id) ? '#C12D32' : '#E5E7EB',
                backgroundColor: selectedTrackIds.includes(track.id) ? '#FFF9EF' : '#fff',
              }}
            >
              <input
                type="radio"
                name="community-primary-track"
                checked={selectedTrackIds.includes(track.id)}
                onChange={() => onToggle(track.id)}
                className="mt-1 w-4 h-4"
                style={{ accentColor: '#C12D32' }}
              />
              <div className="flex-1">
                <div>
                  <h4 className="font-medium mb-1" style={{ color: '#333' }}>{track.name}</h4>
                  <p className="text-sm mb-2" style={{ color: '#666' }}>{track.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#ECC180', color: '#333' }}>
                    {track.distance}km
                  </span>
                  <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#F3F4F6', color: '#666' }}>
                    {track.difficulty}
                  </span>
                  <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#F3F4F6', color: '#666' }}>
                    {track.trackType}
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-lg text-center" style={{ backgroundColor: '#F3F4F6' }}>
          <MapPin className="w-12 h-12 mx-auto mb-3" style={{ color: '#999' }} />
          <p className="font-medium mb-1" style={{ color: '#666' }}>No tracks available</p>
          <p className="text-sm" style={{ color: '#999' }}>
            No tracks found in {city}, {country}. Create tracks in the Tracks module first.
          </p>
        </div>
      )}
    </div>
  );
};