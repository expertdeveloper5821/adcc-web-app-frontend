import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Image, MessageSquare, Edit, MapPin, Award, Trash2 } from 'lucide-react';
import { getCommunityById, deleteCommunity as deleteCommunityApi, CommunityApiResponse } from '../../services/communitiesApi';
import { toast } from 'sonner';

type TabType = 'about' | 'members' | 'events' | 'gallery' | 'feed';

export function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const communityId = id || '';
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [community, setCommunity] = useState<CommunityApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setIsLoading(true);
        const data = await getCommunityById(communityId);
        setCommunity(data);
      } catch (error: any) {
        console.error('Error fetching community:', error);
        toast.error(error?.response?.data?.message || 'Failed to load community');
      } finally {
        setIsLoading(false);
      }
    };

    if (communityId) {
      fetchCommunity();
    }
  }, [communityId]);

  const handleDelete = async () => {
    try {
      await deleteCommunityApi(communityId);
      toast.success('Community deleted successfully');
      navigate('/communities');
    } catch (error: any) {
      console.error('Error deleting community:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete community');
      setShowDeleteModal(false);
    }
  };

  const handleEdit = () => {
    navigate(`/communities/${communityId}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: '#666' }}>Loading community...</div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: '#666' }}>Community not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Cover */}
      <div className="relative h-64 rounded-2xl overflow-hidden">
        {community.image ? (
          <img src={community.image} alt={community.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-end gap-4">
            {community.image && (
              <img
                src={community.image}
                alt={community.title}
                className="w-24 h-24 rounded-2xl border-4 border-white object-cover"
              />
            )}
            <div className="flex-1 text-white">
              <h1 className="text-4xl mb-2">{community.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{community.location}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
                  {community.type}
                </span>
                {/* <span className="px-3 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
                  {Array.isArray(community.category) ? community.category.join(', ') : community.category}
                </span> */}
                <span className="text-sm">{(community.membersCount ?? 3420).toLocaleString()} members</span>
                <span className="text-sm">{community.eventsCount ?? 18} events</span>
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
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h2 className="text-xl mb-4" style={{ color: '#333' }}>About</h2>
              <p className="text-base leading-relaxed" style={{ color: '#666' }}>{community.description}</p>
            </div>

            {/* Associated Teams - separate card underneath About */}
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Associated Teams</h3>
              <div className="flex flex-wrap gap-3">
                {(community.associatedTeams ?? ['ADCycling Team', 'Al Wathba CT', 'Al Fursan CT']).map((team) => (
                  <span
                    key={team}
                    className="px-4 py-2 rounded-full text-sm"
                    style={{ backgroundColor: '#ECC180', color: '#334155' }}
                  >
                    {team}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleEdit}
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
                    style={{ backgroundColor: community.isActive ? '#CF9F0C' : '#999' }}
                  >
                    {community.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Visibility</span>
                  <span className="text-sm" style={{ color: '#333' }}>{community.visibility ?? 'Public'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Featured</span>
                  <span className="text-sm" style={{ color: '#333' }}>{community.featured ?? true ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Manager</span>
                  <span className="text-sm" style={{ color: '#333' }}>{community.manager ?? 'Ahmed Al Mansoori'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Members</h2>
          <p style={{ color: '#666' }}>Member management interface would go here</p>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>Community Events</h2>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>Delete Community</h3>
            <p className="mb-6" style={{ color: '#666' }}>
              Are you sure you want to delete "{community.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: '#ECC180', color: '#333' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#C12D32' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
