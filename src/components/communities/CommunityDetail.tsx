import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Image, MessageSquare, Edit, MapPin, Award } from 'lucide-react';
import { getCommunity } from '../../data/communitiesData';

type TabType = 'about' | 'members' | 'events' | 'gallery' | 'feed';

export function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const communityId = id || '';
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const community = getCommunity(communityId);

  if (!community) {
    return <div>Community not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Cover */}
      <div className="relative h-64 rounded-2xl overflow-hidden">
        <img src={community.coverImage} alt={community.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <button
          onClick={() => navigate('/communities')}
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-end gap-4">
            <img
              src={community.logo}
              alt={community.name}
              className="w-24 h-24 rounded-2xl border-4 border-white object-cover"
            />
            <div className="flex-1 text-white">
              <h1 className="text-4xl mb-2">{community.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{community.city}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
                  {community.type}
                </span>
                <span className="text-sm">{community.membersCount.toLocaleString()} members</span>
                <span className="text-sm">{community.eventsCount} events</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {(['about', 'members', 'events', 'gallery', 'feed'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-3 px-2 text-sm capitalize transition-all"
              style={{
                color: activeTab === tab ? '#C12D32' : '#666',
                borderBottom: activeTab === tab ? '2px solid #C12D32' : '2px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl shadow-sm bg-white mb-6">
              <h2 className="text-xl mb-4" style={{ color: '#333' }}>About</h2>
              <p className="text-base leading-relaxed" style={{ color: '#666' }}>{community.description}</p>
            </div>

            {community.teams.length > 0 && (
              <div className="p-6 rounded-2xl shadow-sm bg-white">
                <h2 className="text-xl mb-4" style={{ color: '#333' }}>Associated Teams</h2>
                <div className="flex flex-wrap gap-2">
                  {community.teams.map((team) => (
                    <span
                      key={team}
                      className="px-4 py-2 rounded-full text-sm"
                      style={{ backgroundColor: '#ECC180', color: '#333' }}
                    >
                      {team}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Quick Actions</h3>
              <div className="space-y-2">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md"
                  style={{ backgroundColor: '#ECC180', color: '#333' }}
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Community</span>
                </button>
                <button
                  className="w-full px-4 py-2 rounded-lg transition-all hover:shadow-md"
                  style={{ backgroundColor: '#E1C06E', color: '#333' }}
                >
                  Feature on Homepage
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Status</span>
                  <span
                    className="px-3 py-1 rounded-full text-xs text-white"
                    style={{ backgroundColor: community.status === 'Active' ? '#CF9F0C' : '#999' }}
                  >
                    {community.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Visibility</span>
                  <span className="text-sm" style={{ color: '#333' }}>{community.isPublic ? 'Public' : 'Private'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Featured</span>
                  <span className="text-sm" style={{ color: '#333' }}>{community.isFeatured ? 'Yes' : 'No'}</span>
                </div>
                {community.adminName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#666' }}>Manager</span>
                    <span className="text-sm" style={{ color: '#333' }}>{community.adminName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Members ({community.membersCount.toLocaleString()})</h2>
          <p style={{ color: '#666' }}>Member management interface would go here</p>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Community Events ({community.eventsCount})</h2>
          <p style={{ color: '#666' }}>Community events list would go here</p>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Gallery</h2>
          <p style={{ color: '#666' }}>Community photo gallery would go here</p>
        </div>
      )}

      {activeTab === 'feed' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Community Feed</h2>
          <p style={{ color: '#666' }}>Community feed posts would go here</p>
        </div>
      )}
    </div>
  );
}
