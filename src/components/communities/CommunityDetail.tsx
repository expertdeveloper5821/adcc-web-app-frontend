import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Plus, Calendar, Image, MessageSquare, Edit, MapPin, Award, Trash2, FileImage, Upload, Route, Activity, } from 'lucide-react';
import { getCommunityById, deleteCommunity as deleteCommunityApi, CommunityApiResponse, getCommunityMembers, addGalleryImages, deleteGalleryImage } from '../../services/communitiesApi';
import { toast } from 'sonner';
import { getCommunity, getFeedPostsByCommunity, deleteFeedPost, updateFeedPost } from '../../data/communitiesData';
// import { getAllTracks } from '../../data/tracksData';
import { getAllTracks, deleteTrack, Track, archiveTrack } from '../../services/trackService';
import { getAllEvents, deleteEvent as deleteEventApi, EventApiResponse } from '../../services/eventsApi';
import { DetailPageSkeleton } from '../ui/skeleton';



type TabType = 'overview' | 'feed' | 'events' | 'gallery' | 'tracks | members';

export function CommunityDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const communityId = id || '';
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [community, setCommunity] = useState<CommunityApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [ getMembers, setMembers ] = useState(false);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [communityEvents, setCommunityEvents] = useState<EventApiResponse[]>([]);
  const [galleryImages, setGalleryImages] = useState<Array<{ id: string; url: string; name: string }>>([]);
  const [uploading, setUploading] = useState(false);

  const feedPosts = getFeedPostsByCommunity(communityId);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setIsLoading(true);
        const data = await getCommunityById(communityId);
        setCommunity(data);
      } catch (error: any) {
        console.error('Error fetching community:', error);
        toast.error(error?.response?.data?.message || t('communities.detail.toasts.loadCommunityError'));
      } finally {
        setIsLoading(false);
      }
    };

    if (communityId) {
      fetchCommunity();
    }
  }, [communityId]);


  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setIsLoading(true);
        const data = await getAllTracks();
        setAllTracks(Array.isArray(data) ? data : []);

      } catch (error: any) {
        console.error('Error fetching tracks:', error);
        toast.error(error?.response?.data?.message || t('communities.detail.toasts.loadTracksError'));
      } finally {
        setIsLoading(false);
      }
    }
  if (communityId) {
      fetchTracks();
    }
  }, [communityId]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const data = await getCommunityMembers(communityId);
        setMembers(data);
        console.log('Members', data);
      } catch (error: any) {
        console.error('Error fetching community:', error);
        toast.error(error?.response?.data?.message || t('communities.detail.toasts.loadCommunityError'));
      } finally {
        setIsLoading(false);
      }
    };

    if (communityId) {
      fetchMembers();
    }
  }, [communityId]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const allEvents = await getAllEvents();
        // Filter events for this community. communityId may be string or object.
        const filtered = allEvents.filter((event: any) => {
          const match = (val: any) => {
            if (!val) return false;
            if (typeof val === 'string') return val === communityId;
            if (typeof val === 'object') return val._id === communityId || val.id === communityId;
            return false;
          };
          return match(event.communityId) || match(event.community);
        });
        console.log('All Events:', allEvents);
        console.log('Filtered Events for community:', filtered);
        setCommunityEvents(filtered);
      } catch (error: any) {
        console.error('Error fetching events:', error);
        toast.error(error?.response?.data?.message || t('communities.detail.toasts.loadEventsError'));
      }
    };

    if (communityId) {
      fetchEvents();
    }
  }, [communityId]);

  // Load gallery images when community data is available
  useEffect(() => {
    if (community && community.gallery && Array.isArray(community.gallery)) {
      const galleryImageList = (community.gallery as string[]).map((url: string, idx: number) => ({
        id: `${url}-${idx}`,
        url,
        name: `Image ${idx + 1}`,
      }));
      setGalleryImages(galleryImageList);
    }
  }, [community]);

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !communityId) return;

    setUploading(true);
    try {
      const imageUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        await new Promise<void>((resolve) => {
          reader.onload = () => {
            imageUrls.push(reader.result as string);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      
      // Call API to add images to backend
      const result = await addGalleryImages(communityId, imageUrls);
      
      // Update state with new images from backend
      if (result.addedImages && result.addedImages.length > 0) {
        const newImages = result.addedImages.map((url: string, idx: number) => ({
          id: `${Date.now()}-${idx}`,
          url,
          name: `Image ${idx + 1}`,
        }));
        setGalleryImages([...galleryImages, ...newImages]);
        toast.success(t('communities.detail.toasts.galleryImagesAdded', { count: result.addedImages.length }));
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error(error?.response?.data?.message || t('communities.detail.toasts.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryDelete = async (id: string, imageUrl: string) => {
    if (!communityId) return;
    
    try {
      await deleteGalleryImage(communityId, imageUrl);
      setGalleryImages(galleryImages.filter(img => img.id !== id));
      toast.success(t('communities.detail.toasts.imageRemoved'));
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error(error?.response?.data?.message || t('communities.detail.toasts.deleteImageError'));
    }
  };

  // console.log('CommunityEvents:', communityEvents);

  const handleDelete = async () => {
    try {
      await deleteCommunityApi(communityId);
      toast.success(t('communities.detail.toasts.deleteSuccess'));
      navigate('/communities');
    } catch (error: any) {
      console.error('Error deleting community:', error);
      toast.error(error?.response?.data?.message || t('communities.detail.toasts.deleteError'));
      setShowDeleteModal(false);
    }
  };

  const handleEdit = () => {
    navigate(`/communities/${communityId}/edit`);
  };

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: '#666' }}>{t('communities.detail.notFound')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Cover */}
      <div className="relative h-72 rounded-2xl overflow-hidden">
        <img src={community.image} alt={community.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>

        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-end gap-6">
            <img
              src={community.logo}
              alt={community.title}
              className="w-28 h-28 rounded-2xl border-4 border-white object-cover"
            />
            <div className="flex-1 text-white">
              <h1 className="text-4xl font-bold mb-3">{community.title}</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{community.location}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
                  {community.type}
                </span>
                {/* <span className="px-3 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
                  {Array.isArray(community.category) ? community.category.join(', ') : community.category}
                </span> */}
                <span className="text-sm">{(community.membersCount ?? 3420).toLocaleString()} {t('communities.detail.members')}</span>
                <span className="text-sm">{community.eventsCount ?? 18} {t('communities.detail.events')}</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/communities/${communityId}/edit`)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all"
              style={{ backgroundColor: '#C12D32' }}
            >
              <Edit className="w-4 h-4" />
              <span>{t('communities.detail.editCommunity')}</span>
            </button>
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
              {t(`communities.detail.tabs.${tab}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h2 className="text-xl mb-4" style={{ color: '#333' }}>{t('communities.detail.aboutHeading')}</h2>
              <p className="text-base leading-relaxed" style={{ color: '#666' }}>{community.description}</p>
            </div>

            {/* About */}
            <div className="rounded-2xl p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#333' }}>{t('communities.detail.aboutHeading')}</h2>
              <p className="leading-relaxed" style={{ color: '#666' }}>{community.description}</p>
            </div>

            {/* Associated Teams */}
            
              <div className="rounded-2xl p-6 bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#333' }}>{t('communities.detail.associatedTeams')}</h2>
                {community.teams && community.teams.length > 0 && (
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
              )}
              </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('communities.detail.quickActions')}</h3>
              <div className="space-y-2">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md"
                  style={{ backgroundColor: '#ECC180', color: '#333' }}
                >
                  <Edit className="w-4 h-4" />
                  <span>{t('communities.detail.editCommunity')}</span>
                </button>
                <button
                  className="w-full px-4 py-2 rounded-lg transition-all hover:shadow-md"
                  style={{ backgroundColor: '#E1C06E', color: '#333' }}
                >
                  {t('communities.detail.featureOnHomepage')}
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-sm bg-white">
              <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('communities.detail.details')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>{t('communities.detail.statusLabel')}</span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium text-white capitalize"
                    style={{
                      backgroundColor:
                        community.isActive === 'active' ? '#10B981' : '#EF4444'
                    }}
                  >
                    {community.isActive === 'active' ? t('common.active') : t('common.inactive')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>{t('communities.detail.visibilityLabel')}</span>
                  <span className="text-sm" style={{ color: '#333' }}>{community.visibility ?? t('common.public')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>{t('communities.detail.featuredLabel')}</span>
                  <span className="text-sm" style={{ color: '#333' }}>{community.featured ?? true ? t('common.yes') : t('common.no')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>{t('communities.detail.managerLabel')}</span>
                  <span className="text-sm" style={{ color: '#333' }}>{community.manager ?? 'Ahmed Al Mansoori'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed Posts Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2" style={{ color: '#333' }}>{t('communities.detail.feed.heading')}</h2>
              <p style={{ color: '#666' }}>{t('communities.detail.feed.subheading')}</p>
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all"
              style={{ backgroundColor: '#C12D32' }}
            >
              <Plus className="w-5 h-5" />
              <span>{t('communities.detail.feed.createPost')}</span>
            </button>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {feedPosts.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map((post) => (
              <div
                key={post.id}
                className="rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  {post.media.length > 0 && (
                    <img
                      src={post.media[0].url}
                      alt={post.title}
                      className="w-32 h-32 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold" style={{ color: '#333' }}>{post.title}</h3>
                        {post.isPinned && (
                          <Pin className="w-4 h-4" style={{ color: '#CF9F0C' }} />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium text-white capitalize"
                          style={{ backgroundColor: getPostTypeColor(post.type) }}
                        >
                          {post.type}
                        </span>
                      </div>
                    </div>
                    <p className="mb-3" style={{ color: '#666' }}>{post.caption}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm" style={{ color: '#999' }}>
                        {t('communities.detail.byAuthor', { author: post.createdBy })} • {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePinPost(post.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={post.isPinned ? t('communities.detail.feed.unpin') : t('communities.detail.feed.pin')}
                        >
                          <Pin className="w-4 h-4" style={{ color: '#666' }} />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={t('communities.detail.feed.editPost')}
                        >
                          <Edit className="w-4 h-4" style={{ color: '#666' }} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={t('communities.detail.feed.deletePost')}
                        >
                          <Trash2 className="w-4 h-4" style={{ color: '#C12D32' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {feedPosts.length === 0 && (
              <div className="rounded-2xl p-12 text-center bg-white shadow-sm">
                <MessageSquare className="w-16 h-16 mx-auto mb-4" style={{ color: '#CCC' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#333' }}>{t('communities.detail.feed.noPosts')}</h3>
                <p className="mb-6" style={{ color: '#666' }}>{t('communities.detail.feed.noPostsBody')}</p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="px-6 py-3 rounded-xl text-white transition-all"
                  style={{ backgroundColor: '#C12D32' }}
                >
                  {t('communities.detail.feed.createPost')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2" style={{ color: '#333' }}>{t('communities.detail.eventsTab.heading')}</h2>
              <p style={{ color: '#666' }}>{t('communities.detail.eventsTab.totalEvents', { count: communityEvents.length })}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/events/create?communityId=${communityId}`)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all"
                style={{ backgroundColor: '#C12D32' }}
              >
                <Plus className="w-5 h-5" />
                <span>{t('communities.detail.eventsTab.createEvent')}</span>
              </button>
            </div>
          </div>

          {communityEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityEvents.map((event: any) => (
                <div
                  key={event._id || event.id}
                  className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/events/${event._id || event.id}`)}
                >
                  {/* Event Image */}
                  <img
                    src={event.eventImage || event.mainImage || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400'}
                    alt={event.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />

                  <div className="p-6">
                    {/* Event Title */}
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#333' }}>
                      {event.title}
                    </h3>

                    {/* Event Date & Time */}
                    <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: '#666' }}>
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(event.startDate || event.date).toLocaleDateString()} •{' '}
                        {new Date(event.startDate || event.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Event Location */}
                    {(event.location || event.venue) && (
                      <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: '#666' }}>
                        <MapPin className="w-4 h-4" />
                        <span>{event.location || event.venue}</span>
                      </div>
                    )}

                    {/* Event Description */}
                    <p className="mb-4 text-sm line-clamp-2" style={{ color: '#666' }}>
                      {event.description}
                    </p>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{
                          backgroundColor: event.status === 'active' || event.isActive ? '#10B981' : '#6B7280',
                        }}
                      >
                        {event.status === 'active' || event.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                      <span className="text-xs" style={{ color: '#999' }}>
                        {t('communities.detail.eventsTab.participants', { count: event.participants?.length || 0 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl p-12 text-center bg-white shadow-sm">
              <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: '#CCC' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#333' }}>{t('communities.detail.eventsTab.noEvents')}</h3>
              <p className="mb-6" style={{ color: '#666' }}>{t('communities.detail.eventsTab.noEventsBody')}</p>
              <button
                onClick={() => navigate(`/events/create?communityId=${communityId}`)}
                className="px-6 py-3 rounded-xl text-white transition-all"
                style={{ backgroundColor: '#C12D32' }}
              >
                {t('communities.detail.eventsTab.createEvent')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tracks Tab */}
      {activeTab === 'tracks' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#333' }}>{t('communities.detail.tracksTab.assignTracks')}</h2>
            <p style={{ color: '#666' }}>{t('communities.detail.tracksTab.tracksHint')}</p>
          </div>

          <div className="rounded-2xl p-6 bg-white shadow-sm">
            <div className="space-y-3">
              {allTracks.map((track) => (
                <label
                  key={track.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300"
                    style={{ accentColor: '#C12D32' }}
                    defaultChecked={Math.random() > 0.5}
                  />
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={track.image}
                      alt={track.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium" style={{ color: '#333' }}>{track.title}</div>
                      <div className="text-sm" style={{ color: '#666' }}>
                        {track.distance}km • {track.difficulty}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => toast.success(t('communities.detail.toasts.tracksAssigned'))}
                className="px-6 py-3 rounded-xl text-white transition-all"
                style={{ backgroundColor: '#C12D32' }}
              >
                {t('communities.detail.tracksTab.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2" style={{ color: '#333' }}>{t('communities.detail.gallery.heading')}</h2>
              <p style={{ color: '#666' }}>{t('communities.detail.gallery.subheading', { count: galleryImages.length })}</p>
            </div>
            <label className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all cursor-pointer hover:opacity-90" style={{ backgroundColor: '#C12D32' }}>
              <Upload className="w-5 h-5" />
              <span>{uploading ? t('communities.detail.gallery.uploading') : t('communities.detail.gallery.uploadMedia')}</span>
              <input
                type="file"
                multiple
                hidden
                accept="image/*,video/*"
                onChange={handleGalleryUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all group relative"
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-3">
                    <p className="text-sm truncate" style={{ color: '#333' }}>{image.name}</p>
                  </div>
                  
                  {/* Hover Delete Button */}
                  <button
                    onClick={() => handleGalleryDelete(image.id, image.url)}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title={t('communities.detail.gallery.deleteImage')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl p-12 text-center bg-white shadow-sm">
              <FileImage className="w-16 h-16 mx-auto mb-4" style={{ color: '#CCC' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#333' }}>{t('communities.detail.gallery.noMedia')}</h3>
              <p className="mb-6" style={{ color: '#666' }}>{t('communities.detail.gallery.noMediaBody')}</p>
              <label className="px-6 py-3 rounded-xl text-white transition-all cursor-pointer inline-block" style={{ backgroundColor: '#C12D32' }}>
                <span>{t('communities.detail.gallery.uploadMedia')}</span>
                <input
                  type="file"
                  multiple
                  hidden
                  accept="image/*,video/*"
                  onChange={handleGalleryUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('communities.detail.membersTab.heading')}</h2>
          <p style={{ color: '#666' }}>{t('communities.detail.membersTab.placeholder')}</p>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('communities.detail.eventsFallback.heading')}</h2>
          <p style={{ color: '#666' }}>{t('communities.detail.eventsFallback.placeholder')}</p>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('communities.detail.galleryFallback.heading')}</h2>
          <p style={{ color: '#666' }}>{t('communities.detail.galleryFallback.placeholder')}</p>
        </div>
      )}

      {activeTab === 'feed' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>{t('communities.detail.feedFallback.heading')}</h2>
          <p style={{ color: '#666' }}>{t('communities.detail.feedFallback.placeholder')}</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>{t('communities.detail.deleteModal.title')}</h3>
            <p className="mb-6" style={{ color: '#666' }}>
              {t('communities.detail.deleteModal.body', { name: community.title })}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: '#ECC180', color: '#333' }}
              >
                {t('communities.detail.deleteModal.cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-white"
                style={{ backgroundColor: '#C12D32' }}
              >
                {t('communities.detail.deleteModal.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function getPostTypeColor(type: string): string {
    switch (type?.toLowerCase()) {
      case 'announcement': return '#C12D32';
      case 'highlight': return '#CF9F0C';
      case 'awareness': return '#10B981';
      default: return '#666';
    }
  }

  function handlePinPost(postId: string) {
    toast.success(t('communities.detail.toasts.postPinned'));
  }

  function handleDeletePost(postId: string) {
    setShowDeleteModal(true);
  }
}

