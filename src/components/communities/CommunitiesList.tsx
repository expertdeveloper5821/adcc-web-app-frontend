import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, MapPin, Calendar, Edit, Trash2, Eye, Ban } from 'lucide-react';
import { UserRole } from '../../App';
import { getAllCommunities as getAllCommunitiesApi, deleteCommunity as deleteCommunityApi, CommunityApiResponse } from '../../services/communitiesApi';
import { toast } from 'sonner';

interface CommunitiesListProps {
  navigate: (page: string, params?: any) => void;
  role: UserRole;
}

interface Community {
  id: string;
  name: string;
  city: string;
  type: string;
  description: string;
  status: 'Active' | 'Draft' | 'Disabled';
  logo: string;
  coverImage: string;
  membersCount: number;
  eventsCount: number;
}

export function CommunitiesList({ navigate, role }: CommunitiesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [communityToDelete, setCommunityToDelete] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map API response to component format
  const mapApiResponseToCommunity = (apiCommunity: CommunityApiResponse): Community => {
    return {
      id: apiCommunity._id || apiCommunity.id || '',
      name: apiCommunity.title || '',
      city: apiCommunity.location || '',
      type: apiCommunity.type || '',
      description: apiCommunity.description || '',
      status: apiCommunity.isActive ? 'Active' : 'Draft',
      logo: apiCommunity.image || 'https://images.unsplash.com/photo-1584981401957-03158e43750d?w=200',
      coverImage: apiCommunity.image || 'https://images.unsplash.com/photo-1707297391684-e07bd2368432?w=800',
      membersCount: 0, // Default value, API doesn't provide this
      eventsCount: 0, // Default value, API doesn't provide this
    };
  };

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllCommunitiesApi();
        
        // Handle different API response structures
        let apiCommunities: CommunityApiResponse[] = [];
        
        if (Array.isArray(response)) {
          // Direct array response
          apiCommunities = response;
        } else if (response && typeof response === 'object') {
          // Handle wrapped response: { success: true, message: '...', data: {...} }
          const responseData = (response as any).data;
          
          // Check if data itself is an array
          if (Array.isArray(responseData)) {
            apiCommunities = responseData;
          } 
          // Check if data is an object containing an array property
          else if (responseData && typeof responseData === 'object') {
            // Try common nested array properties
            const nestedArray = responseData.communities || 
                               responseData.items || 
                               responseData.list || 
                               responseData.results ||
                               responseData.data;
            
            if (Array.isArray(nestedArray)) {
              apiCommunities = nestedArray;
            } else {
              // Log the structure to help debug
              console.log('response.data structure:', Object.keys(responseData));
              console.warn('Could not find array in response.data:', responseData);
            }
          }
          
          // Also check top-level properties as fallback
          if (apiCommunities.length === 0) {
            const topLevelCommunities = (response as any).communities;
            const topLevelResults = (response as any).results;
            
            if (Array.isArray(topLevelCommunities)) {
              apiCommunities = topLevelCommunities;
            } else if (Array.isArray(topLevelResults)) {
              apiCommunities = topLevelResults;
            }
          }
          
          if (apiCommunities.length === 0) {
            console.warn('API response is not in expected format:', response);
          }
        } else {
          console.warn('API response is not an array or object:', response);
          apiCommunities = [];
        }
        
        // Ensure apiCommunities is an array before mapping
        if (!Array.isArray(apiCommunities)) {
          console.error('apiCommunities is not an array:', apiCommunities);
          apiCommunities = [];
        }
        
        const mappedCommunities = apiCommunities.map(mapApiResponseToCommunity);
        setCommunities(mappedCommunities);
      } catch (err) {
        console.error('Error fetching communities:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch communities';
        setError(errorMessage);
        toast.error(`Error loading communities: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === 'all' || community.city === cityFilter;
    const matchesType = typeFilter === 'all' || community.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || community.status === statusFilter;
    return matchesSearch && matchesCity && matchesType && matchesStatus;
  });

  const canEdit = role === 'super-admin' || role === 'community-manager';
  const canCreate = role === 'super-admin' || role === 'community-manager';

  const handleDelete = (communityId: string) => {
    setCommunityToDelete(communityId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (communityToDelete) {
      try {
        await deleteCommunityApi(communityToDelete);
        toast.success('Community deleted successfully');
        // Remove the deleted community from the list
        setCommunities(communities.filter(c => c.id !== communityToDelete));
        setShowDeleteModal(false);
        setCommunityToDelete(null);
      } catch (error: any) {
        console.error('Error deleting community:', error);
        toast.error(error?.response?.data?.message || 'Failed to delete community');
        setShowDeleteModal(false);
        setCommunityToDelete(null);
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Club': return '#C12D32';
      case 'Shop': return '#CF9F0C';
      case 'Women': return '#B95E82';
      case 'Youth': return '#E1C06E';
      case 'Family': return '#ECC180';
      case 'Corporate': return '#999';
      default: return '#999';
    }
  };

  // Get unique cities and types from communities for filter options
  const uniqueCities = Array.from(new Set(communities.map(c => c.city).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(communities.map(c => c.type).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: '#666' }}>Loading communities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Communities / Cycling Teams</h1>
          <p style={{ color: '#666' }}>Manage cycling communities and teams</p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('community-create')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: '#C12D32' }}
          >
            <Plus className="w-5 h-5" />
            <span>Create Community</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                style={{ focusRing: '#C12D32' }}
              />
            </div>
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
            style={{ focusRing: '#C12D32' }}
          >
            <option value="all">All Cities</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
            style={{ focusRing: '#C12D32' }}
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
            style={{ focusRing: '#C12D32' }}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Communities Grid */}
      {filteredCommunities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg" style={{ color: '#666' }}>No communities found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
          <div
            key={community.id}
            className="rounded-2xl shadow-sm bg-white hover:shadow-md transition-all overflow-hidden"
          >
            {/* Cover Image */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={community.coverImage}
                alt={community.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Logo */}
              <div className="absolute bottom-4 left-4">
                <img
                  src={community.logo}
                  alt={community.name}
                  className="w-16 h-16 rounded-lg border-2 border-white object-cover"
                />
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span
                  className="px-3 py-1 rounded-full text-xs text-white"
                  style={{
                    backgroundColor:
                      community.status === 'Active' ? '#CF9F0C' :
                      community.status === 'Draft' ? '#999' : '#C12D32'
                  }}
                >
                  {community.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg mb-2" style={{ color: '#333' }}>{community.name}</h3>
              
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-3 py-1 rounded-full text-xs text-white"
                  style={{ backgroundColor: getTypeColor(community.type) }}
                >
                  {community.type}
                </span>
                <div className="flex items-center gap-1 text-xs" style={{ color: '#666' }}>
                  <MapPin className="w-3 h-3" />
                  <span>{community.city}</span>
                </div>
              </div>

              <p className="text-sm mb-4 line-clamp-2" style={{ color: '#666' }}>
                {community.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                  <Users className="w-5 h-5 mx-auto mb-1" style={{ color: '#C12D32' }} />
                  <div className="text-lg" style={{ color: '#333' }}>{community.membersCount.toLocaleString()}</div>
                  <div className="text-xs" style={{ color: '#666' }}>Members</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                  <Calendar className="w-5 h-5 mx-auto mb-1" style={{ color: '#C12D32' }} />
                  <div className="text-lg" style={{ color: '#333' }}>{community.eventsCount}</div>
                  <div className="text-xs" style={{ color: '#666' }}>Events</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('community-detail', { selectedCommunityId: community.id })}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all hover:shadow-md"
                  style={{ backgroundColor: '#ECC180', color: '#333' }}
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">View</span>
                </button>
                {canEdit && (
                  <>
                    <button
                      onClick={() => navigate('community-detail', { selectedCommunityId: community.id })}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" style={{ color: '#666' }} />
                    </button>
                    <button
                      onClick={() => handleDelete(community.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: '#C12D32' }} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>Delete Community</h3>
            <p className="mb-6" style={{ color: '#666' }}>
              Are you sure you want to delete this community? This action cannot be undone.
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
                onClick={confirmDelete}
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
