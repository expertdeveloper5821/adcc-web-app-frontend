import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, MapPin, Calendar, Star, Filter } from 'lucide-react';
import { CardSkeleton } from '../ui/skeleton';
import { UserRole } from '../../App';
import { toast } from 'sonner';
import { getAllCommunities as getAllCommunitiesApi, deleteCommunity as deleteCommunityApi, CommunityApiResponse } from '../../services/communitiesApi';
import { availableCities, availableCategories } from '../../data/communitiesData';

interface CommunitiesListProps {
  role: UserRole;
}


 
interface Community {
  id: string;
  name: string;
  city: string;
  communityType?: string; // primary community type (city/type/purpose-based)
  type?: string[]; // additional type tags (e.g. 'Club', 'Training & Clinics')
  description: string;
  status: 'Active' | 'Draft' | 'Disabled';
  logo: string;
  coverImage: string;
  memberCount?: string;
  upcomingEventCount?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  membersCount: number;
  eventsCount: number;
}

export function CommunitiesList({ role }: CommunitiesListProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [communityTypeFilter, setCommunityTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [communityToDelete, setCommunityToDelete] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Map API response to component format
  const mapApiResponseToCommunity = (apiCommunity: CommunityApiResponse): Community => {
    const normalizeToArray = (v: any): string[] => {
      if (!v && v !== 0) return [];
      if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
      if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
      return [String(v)];
    };

    return {
      id: apiCommunity._id || apiCommunity.id || '',
      name: apiCommunity.title || apiCommunity.name || '',
      city: apiCommunity.location || apiCommunity.city || '',
      memberCount: apiCommunity.memberCount !== undefined ? String(apiCommunity.memberCount) : (apiCommunity.membersCount !== undefined ? String(apiCommunity.membersCount) : '0'),
      upcomingEventCount: apiCommunity.upcomingEventCount !== undefined ? String(apiCommunity.upcomingEventCount) : (apiCommunity.eventsCount !== undefined ? String(apiCommunity.eventsCount) : '0'),
      // Primary community category comes from `category` in the API (values like 'city', 'type', 'special')
      communityType: apiCommunity.category || apiCommunity.communityType || '',
      // Secondary type tags come from `type` (array or comma-separated string)
      type: normalizeToArray(apiCommunity.type || apiCommunity.types || apiCommunity.tags),
      description: apiCommunity.description || '',
      isActive: apiCommunity.isActive ?? false,
      isFeatured: apiCommunity.isFeatured ?? false,
      logo: apiCommunity.image || 'https://images.unsplash.com/photo-1584981401957-03158e43750d?w=200',
      coverImage: apiCommunity.image || 'https://images.unsplash.com/photo-1707297391684-e07bd2368432?w=800',
      membersCount: parseInt(String(apiCommunity.memberCount || apiCommunity.membersCount || 0)) || 0,
      eventsCount: parseInt(String(apiCommunity.upcomingEventCount || apiCommunity.eventsCount || 0)) || 0,
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
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || community.name.toLowerCase().includes(q) || community.description.toLowerCase().includes(q);
    const matchesCity = cityFilter === 'all' || community.city === cityFilter;
    const matchesCommunityType = communityTypeFilter === 'all' || community.communityType === communityTypeFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? community.isActive : !community.isActive);
    const matchesCategory = categoryFilter.length === 0 || (community.type || []).some(cat => categoryFilter.includes(cat));
    const matchesFeatured = featuredFilter === 'all' || (featuredFilter === 'yes' ? community.isFeatured : !community.isFeatured);
    return matchesSearch && matchesCity && matchesCommunityType && matchesStatus && matchesCategory && matchesFeatured;
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

  const getCommunityTypeColor = (type?: string) => {
    switch (type) {
      case 'city': return '#C12D32';
      case 'type': return '#3B82F6';
      case 'purpose-based': return '#8B5CF6';
      default: return '#999';
    }
  };

  const formatCommunityType = (type?: string) => {
    switch (type) {
      case 'city': return 'City Community';
      case 'type': return 'Type Community';
      case 'special': return 'Purpose-Based Community';
      default: return type || '';
    }
  };

  const toggleCategory = (category: string) => {
    if (categoryFilter.includes(category)) {
      setCategoryFilter(categoryFilter.filter(c => c !== category));
    } else {
      setCategoryFilter([...categoryFilter, category]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Communities / Cycling Teams</h1>
          <p style={{ color: '#666' }}>Manage cycling communities and teams across the UAE</p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('/communities/create')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: '#C12D32' }}
          >
            <Plus className="w-5 h-5" />
            <span>Create Community</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: '#ECC180' }}>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>Total Communities</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>{communities.length}</p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>Featured</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>{communities.filter(c => c.isFeatured == true).length}</p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>Total Members</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {communities.reduce((sum, c) => sum + (parseInt(c.memberCount as string) || 0), 0).toLocaleString()}
          </p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>Upcoming Events</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>
            {communities.reduce((sum, c) => sum + (parseInt(c.upcomingEventCount as string) || 0), 0)}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-6 rounded-2xl shadow-sm bg-white space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5" style={{ color: '#666' }} />
          <h3 className="text-lg" style={{ color: '#333' }}>Filters</h3>
        </div>

        {/* Row 1: Search, City, Community Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">All Cities</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select
            value={communityTypeFilter}
            onChange={(e) => setCommunityTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">All Community Types</option>
            <option value="city">City Community</option>
            <option value="type">Interest / Type Community</option>
            <option value="purpose-based">Special Purpose Community</option>
          </select>
        </div>

        {/* Row 2: Status, Featured */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">All Featured Status</option>
            <option value="yes">Featured Only</option>
            <option value="no">Not Featured</option>
          </select>
        </div>

        {/* Row 3: Category Multi-Select */}
        <div>
          <label className="block text-sm mb-2" style={{ color: '#666' }}>Categories</label>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className="px-3 py-1 rounded-full text-sm transition-all"
                style={{
                  backgroundColor: categoryFilter.includes(category) ? '#C12D32' : '#F3F4F6',
                  color: categoryFilter.includes(category) ? '#fff' : '#666',
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Communities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.map((community) => (
          <div
            key={community.id}
            onClick={() => navigate(`/communities/${community.id}`)}
            className="p-6 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all cursor-pointer relative"
          >
            {/* Featured Badge */}
            {community.isFeatured && (
              <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#C12D32' }}>
                <Star className="w-3 h-3" />
                Featured
              </div>
            )}

            {/* Community Logo */}
            <img
              src={community.logo}
              alt={community.name}
              className="w-16 h-16 rounded-full object-cover mb-4"
            />

            {/* Community Info */}
            <h3 className="text-lg font-medium mb-2" style={{ color: '#333' }}>
              {community.name}
            </h3>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm" style={{ color: '#666' }}>
                <MapPin className="w-4 h-4" />
                {community.city}
              </div>

              <div className="flex flex-wrap gap-2">
                {community.communityType && (
                  <span
                    className="px-3 py-1 rounded-full text-xs text-white"
                    style={{ backgroundColor: getCommunityTypeColor(community.communityType) }}
                  >
                    {formatCommunityType(community.communityType)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {(community.type || []).map((cat, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{ backgroundColor: '#ECC180', color: '#333' }}
                  >
                    {cat}
                  </span>
                ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs mb-1" style={{ color: '#999' }}>Members</p>
                <p className="text-lg" style={{ color: '#333' }}>{community.memberCount || 0}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: '#999' }}>Upcoming Events</p>
                <p className="text-lg" style={{ color: '#333' }}>{community.upcomingEventCount || 0}</p>
              </div>
            </div>

            {/* Status */}
            <div className="mt-4 flex items-center justify-between">
              <span
                className="px-3 py-1 rounded-full text-xs text-white"
                style={{ backgroundColor: community.isActive ? '#10B981' : '#6B7280' }}
              >
                {community.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Empty State */}
      {!loading && filteredCommunities.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#ECC180' }} />
          <h3 className="text-xl mb-2" style={{ color: '#333' }}>No communities found</h3>
          <p style={{ color: '#666' }}>
            {searchTerm || cityFilter !== 'all' || communityTypeFilter !== 'all' || statusFilter !== 'all' || categoryFilter.length > 0 || featuredFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first community to get started'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>Delete Community?</h3>
            <p className="mb-6" style={{ color: '#666' }}>
              Are you sure you want to delete this community? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded-lg text-white transition-all hover:shadow-md"
                style={{ backgroundColor: '#C12D32' }}
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                style={{ color: '#666' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}