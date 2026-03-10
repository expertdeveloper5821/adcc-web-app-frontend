import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Calendar,
  Image,
  MessageSquare,
  Edit,
  MapPin,
  Award,
  Plus,
  Pin,
  Trash2,
  FileImage,
  Upload,
  Route,
  Activity,
} from 'lucide-react';
import { getCommunityById, deleteCommunity as deleteCommunityApi, CommunityApiResponse, getCommunityMembers, addGalleryImages, deleteGalleryImage } from '../../services/communitiesApi';
import { toast } from 'sonner';
import { getCommunity, getFeedPostsByCommunity, deleteFeedPost, updateFeedPost } from '../../data/communitiesData';
// import { getAllTracks } from '../../data/tracksData';
import { getAllTracks, deleteTrack, Track, archiveTrack } from '../../services/trackService';
import { getAllEvents, deleteEvent as deleteEventApi, EventApiResponse } from '../../services/eventsApi';
import { DetailPageSkeleton } from '../ui/skeleton';



type TabType = 'overview' | 'feed' | 'events' | 'tracks' | 'gallery' | 'members';

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
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [showPostDeleteModal, setShowPostDeleteModal] = useState(false);
  const [membersData, setMembersData] = useState<unknown>(null);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [communityEvents, setCommunityEvents] = useState<EventApiResponse[]>([]);
  const [galleryImages, setGalleryImages] = useState<Array<{ id: string; url: string; name: string }>>([]);
  const [uploading, setUploading] = useState(false);

  const feedPosts = getFeedPostsByCommunity(communityId);

  useEffect(() => {
    if (!communityId) {
      setIsLoading(false);
      return;
    }
    const fetchCommunity = async () => {
      try {
        setIsLoading(true);
        const data = await getCommunityById(communityId);
        setCommunity(data);
      } catch (error: any) {
        console.error('Error fetching community:', error);
        toast.error(error?.response?.data?.message || t('communities.detail.toasts.loadCommunityError'));
        setCommunity(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunity();
  }, [communityId]);


  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const data = await getAllTracks();
        setAllTracks(Array.isArray(data) ? data : []);
      } catch (error: any) {
        console.error('Error fetching tracks:', error);
        toast.error(error?.response?.data?.message || t('communities.detail.toasts.loadTracksError'));
      }
    };
    if (communityId) {
      fetchTracks();
    }
  }, [communityId]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getCommunityMembers(communityId) as unknown;
        setMembersData(data);
      } catch (error: any) {
        console.error('Error fetching community members:', error);
        toast.error(error?.response?.data?.message || t('communities.detail.toasts.loadCommunityError'));
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
      {/* Header with Cover (Hero Section) - matches design: back top-left, logo+name+meta+edit in bottom row */}
      <div className={`relative h-[300px] rounded-2xl   bg-center  `} style={{
        backgroundImage: `url(${community.image})`,
        height: `350px`,
        backgroundSize: `cover`,
        backgroundPosition: `center`,
        backgroundRepeat: `no-repeat`,
      }}>
        {/* <img src={community.image} alt={community.title} className="w-full h-full  object-cover" /> */}
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" /> */}

        {/* Back button - top left only */}
        <button
          onClick={() => navigate(-1)}
          className=" left-6 p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all z-10" style={{ position: 'absolute', top: 10 }}
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>

        {/* Bottom row: Logo | Name + Metadata | Edit Community (right, aligned with name) */}
        <div className=" " style={{ position: 'absolute', bottom: 30, left: 0, right: 0 }}>
          <div className="flex items-end gap-6 px-6">
            {/* Community logo - bottom-left, thick white border, rounded square */}
            <img
              src={community.logo ?? community.image}
              alt={community.title}
              className=" h-20 rounded-2xl border-4 border-white object-cover shadow-lg flex-shrink-0 bg-white/10"
            />
            <div className="flex-1 text-white min-w-0">
              <h1 className="text-4xl font-bold mb-3">{community.title}</h1>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{community.city ?? community.location}</span>
                </div>
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/20 backdrop-blur-sm">
                  {typeof community.type === 'string' ? community.type : (Array.isArray(community.type) ? community.type.join(', ') : '')}
                </span>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{((community.stats?.members ?? Number(community.memberCount)) || 0).toLocaleString()} {t('communities.detail.members')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{community.stats?.upcomingEvents ?? community.eventsCount ?? 0} {t('communities.detail.events')}</span>
                </div>
              </div>
            </div>
            {/* Edit Community - right side, vertically centered with name/metadata, red button with icon + text */}
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 flex-shrink-0"
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
        <div className="flex gap-8">
          {([
            { id: 'overview', label: t('communities.detail.tabs.overview'), icon: Activity },
            { id: 'feed', label: t('communities.detail.tabs.feed'), icon: MessageSquare },
            { id: 'events', label: t('communities.detail.tabs.events'), icon: Calendar },
            { id: 'tracks', label: t('communities.detail.tabs.tracks'), icon: Route },
            { id: 'gallery', label: t('communities.detail.tabs.gallery'), icon: Image },
            { id: 'members', label: t('communities.detail.tabs.members'), icon: Users },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="pb-4 px-2 flex items-center gap-2 transition-all"
                style={{
                  color: activeTab === tab.id ? '#C12D32' : '#999',
                  borderBottom: activeTab === tab.id ? '2px solid #C12D32' : '2px solid transparent',
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl p-6 bg-white shadow-sm">
                <MessageSquare className="w-8 h-8 mb-3" style={{ color: '#C12D32' }} />
                <div className="text-2xl font-semibold mb-1" style={{ color: '#333' }}>{community.postsCount ?? 0}</div>
                <div className="text-sm" style={{ color: '#666' }}>Total Posts</div>
              </div>
              <div className="rounded-2xl p-6 bg-white shadow-sm">
                <Calendar className="w-8 h-8 mb-3" style={{ color: '#CF9F0C' }} />
                <div className="text-2xl font-semibold mb-1" style={{ color: '#333' }}>{community.stats?.upcomingEvents ?? community.eventsCount ?? 0}</div>
                <div className="text-sm" style={{ color: '#666' }}>Events</div>
              </div>
              <div className="rounded-2xl p-6 bg-white shadow-sm">
                <Route className="w-8 h-8 mb-3" style={{ color: '#10B981' }} />
                <div className="text-2xl font-semibold mb-1" style={{ color: '#333' }}>{allTracks.length}</div>
                <div className="text-sm" style={{ color: '#666' }}>Active Tracks</div>
              </div>
              <div className="rounded-2xl p-6 bg-white shadow-sm">
                <Image className="w-8 h-8 mb-3" style={{ color: '#8B5CF6' }} />
                <div className="text-2xl font-semibold mb-1" style={{ color: '#333' }}>{galleryImages.length}</div>
                <div className="text-sm" style={{ color: '#666' }}>Gallery Items</div>
              </div>
            </div>

            {/* About */}
            <div className="rounded-2xl p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#333' }}>{t('communities.detail.aboutHeading')}</h2>
              <p className="leading-relaxed" style={{ color: '#666' }}>{community.description}</p>
            </div>

            {/* Associated Teams */}
            {community.associatedTeams && community.associatedTeams.length > 0 && (
              <div className="rounded-2xl p-6 bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#333' }}>{t('communities.detail.associatedTeams')}</h2>
                <div className="flex flex-wrap gap-2">
                  {community.associatedTeams.map((team) => (
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <div className="rounded-2xl p-6 bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#333' }}>{t('communities.detail.details')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>{t('communities.detail.statusLabel')}</span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium text-white capitalize"
                    style={{
                      backgroundColor: community.isActive ? '#10B981' : '#EF4444',
                    }}
                  >
                    {community.isActive ? t('common.active') : t('common.inactive')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>{t('communities.detail.visibilityLabel')}</span>
                  <span className="text-sm" style={{ color: '#333' }}>{community.visibility === 'public' ? t('common.public') : t('common.private')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>{t('communities.detail.featuredLabel')}</span>
                  <span className="text-sm" style={{ color: '#333' }}>{community.featured ?? community.isFeatured ? t('common.yes') : t('common.no')}</span>
                </div>
                {community.manager && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#666' }}>{t('communities.detail.managerLabel')}</span>
                    <span className="text-sm" style={{ color: '#333' }}>{community.manager}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#666' }}>Created</span>
                  <span className="text-sm" style={{ color: '#333' }}>
                    {community.createdAt ? new Date(community.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl p-6 bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#333' }}>{t('communities.detail.quickActions')}</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('feed')}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#C12D32' }}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t('communities.detail.feed.createPost')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all hover:shadow-md"
                  style={{ backgroundColor: '#ECC180', color: '#333' }}
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t('communities.detail.eventsTab.createEvent')}</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all hover:shadow-md"
                  style={{ backgroundColor: '#E1C06E', color: '#333' }}
                >
                  <Award className="w-4 h-4" />
                  <span>{t('communities.detail.featureOnHomepage')}</span>
                </button>
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
                          onClick={() => {
                            setPostToDelete(post.id);
                            setShowPostDeleteModal(true);
                          }}
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2" style={{ color: '#333' }}>{t('communities.detail.membersTab.heading')}</h2>
              <p style={{ color: '#666' }}>{((community.stats?.members ?? Number(community.memberCount)) || 0).toLocaleString()} total members</p>
            </div>
          </div>

          <div className="rounded-2xl p-12 text-center bg-white shadow-sm">
            <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#CCC' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#333' }}>Member Management</h3>
            <p style={{ color: '#666' }}>View and manage community members</p>
          </div>
        </div>
      )}

      {/* Delete Post Confirmation Modal */}
      {showPostDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-2xl p-6 max-w-md w-full mx-4 bg-white">
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>Delete Post</h3>
            <p className="mb-6" style={{ color: '#666' }}>
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowPostDeleteModal(false);
                  setPostToDelete(null);
                }}
                className="px-4 py-2 rounded-xl"
                style={{ backgroundColor: '#ECC180', color: '#333' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (postToDelete) {
                    deleteFeedPost(postToDelete);
                    toast.success(t('communities.detail.toasts.postDeleted', { defaultValue: 'Post deleted successfully' }));
                    setShowPostDeleteModal(false);
                    setPostToDelete(null);
                  }
                }}
                className="px-4 py-2 rounded-xl text-white"
                style={{ backgroundColor: '#C12D32' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto bg-white">
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>Create Post</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Post Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                  placeholder="Enter post title..."
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Post Type</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]">
                  <option>Announcement</option>
                  <option>Highlight</option>
                  <option>Awareness</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Caption</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
                  placeholder="Write your post caption..."
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Upload Media</label>
                <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer" style={{ borderColor: '#ECC180' }}>
                  <Upload className="w-12 h-12 mx-auto mb-3" style={{ color: '#999' }} />
                  <p style={{ color: '#666' }}>Click to upload image or video</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowCreatePost(false)}
                className="px-4 py-2 rounded-xl"
                style={{ backgroundColor: '#ECC180', color: '#333' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success(t('communities.detail.toasts.postCreated', { defaultValue: 'Post created successfully' }));
                  setShowCreatePost(false);
                }}
                className="px-4 py-2 rounded-xl text-white"
                style={{ backgroundColor: '#C12D32' }}
              >
                Publish Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Community Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-2xl p-6 max-w-md w-full mx-4 bg-white">
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>{t('communities.detail.deleteModal.title')}</h3>
            <p className="mb-6" style={{ color: '#666' }}>
              {t('communities.detail.deleteModal.body', { name: community.title })}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl"
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
      case 'announcement': return '#3B82F6';
      case 'highlight': return '#CF9F0C';
      case 'awareness': return '#10B981';
      default: return '#666';
    }
  }

  function handlePinPost(postId: string) {
    const post = feedPosts.find((p) => p.id === postId);
    if (post) {
      updateFeedPost(postId, { isPinned: !post.isPinned });
      toast.success(post.isPinned ? t('communities.detail.feed.unpin') : t('communities.detail.feed.pin'));
    }
  }
}

