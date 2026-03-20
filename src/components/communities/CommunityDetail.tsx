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
  Trash2,
  FileImage,
  Upload,
  Route,
  Activity,
} from 'lucide-react';
import { getCommunityById, deleteCommunity as deleteCommunityApi, CommunityApiResponse, getCommunityMembers, addGalleryImages, deleteGalleryImage, updateCommunity } from '../../services/communitiesApi';
import { toast } from 'sonner';
import { getAllTracks, Track } from '../../services/trackService';
import { getAllEvents, EventApiResponse } from '../../services/eventsApi';
import { getCommunityPosts, createCommunityPost, updateCommunityPost, deleteCommunityPost as deleteCommunityPostApi, CommunityPost } from '../../services/communityPostsApi';
import { DetailPageSkeleton } from '../ui/skeleton';
import { PostFormModal, PostFormData } from './PostFormModal';



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
  const [isTogglingFeatured, setIsTogglingFeatured] = useState(false);
  const [feedPosts, setFeedPosts] = useState<CommunityPost[]>([]);
  const [postModal, setPostModal] = useState<{ mode: 'create' | 'edit'; post?: CommunityPost } | null>(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const openCreatePostModal = () => setPostModal({ mode: 'create' });
  const openEditPostModal = (post: CommunityPost) => setPostModal({ mode: 'edit', post });
  const closePostModal = () => setPostModal(null);

  const handlePostSubmit = async (data: PostFormData) => {
    setIsSubmittingPost(true);
    try {
      if (postModal?.mode === 'edit' && postModal.post) {
        const updated = await updateCommunityPost(communityId, postModal.post._id, data);
        setFeedPosts(prev => prev.map(p => p._id === postModal.post!._id ? updated : p));
        toast.success(t('communities.detail.toasts.postUpdated', { defaultValue: 'Announcement updated successfully' }));
      } else {
        const created = await createCommunityPost(communityId, data);
        setFeedPosts(prev => [created, ...prev]);
        toast.success(t('communities.detail.toasts.postCreated', { defaultValue: 'Announcement created successfully' }));
      }
      closePostModal();
    } catch (error: any) {
      const key = postModal?.mode === 'edit' ? 'postUpdateError' : 'postCreateError';
      const fallback = postModal?.mode === 'edit' ? 'Failed to update announcement' : 'Failed to create announcement';
      toast.error(error?.response?.data?.message || t(`communities.detail.toasts.${key}`, { defaultValue: fallback }));
    } finally {
      setIsSubmittingPost(false);
    }
  };

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
        const allEvents = await getAllEvents({ page: 1, limit: 100 });
        // Filter events for this community. communityId may be a string or populated object.
        const filtered = allEvents.filter((event: any) => {
          const cid = event.communityId;
          if (!cid) return false;
          if (typeof cid === 'string') return cid === communityId;
          if (typeof cid === 'object') return String(cid._id) === communityId || String(cid.id) === communityId;
          return false;
        });
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

  // Fetch community feed posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getCommunityPosts(communityId, { limit: 50 });
        setFeedPosts(data.posts);
      } catch (error: any) {
        console.error('Error fetching community posts:', error);
      }
    };
    if (communityId) fetchPosts();
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
    if (!files || !communityId || files.length === 0) return;

    setUploading(true);
    try {
      const fileList = Array.from(files);
      const result = await addGalleryImages(communityId, fileList);

      if (result?.addedImages && result.addedImages.length > 0) {
        const newImages = result.addedImages.map((url: string, idx: number) => ({
          id: `${Date.now()}-${idx}`,
          url,
          name: `Image ${idx + 1}`,
        }));
        setGalleryImages((prev) => [...prev, ...newImages]);
        toast.success(t('communities.detail.toasts.galleryImagesAdded', { count: result.addedImages.length }));
      } else if (result?.gallery && Array.isArray(result.gallery)) {
        const newImages = result.gallery.slice(-fileList.length).map((url: string, idx: number) => ({
          id: `${Date.now()}-${idx}`,
          url,
          name: `Image ${idx + 1}`,
        }));
        setGalleryImages((prev) => [...prev, ...newImages]);
        toast.success(t('communities.detail.toasts.galleryImagesAdded', { count: fileList.length }));
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error(error?.response?.data?.message || t('communities.detail.toasts.uploadError'));
    } finally {
      setUploading(false);
    }
    e.target.value = '';
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

  const isFeaturedOnHomepage = !!(community?.isFeatured ?? community?.featured);

  const handleToggleFeatured = async () => {
    if (!communityId || !community) return;
    const next = !isFeaturedOnHomepage;
    setIsTogglingFeatured(true);
    try {
      const updated = await updateCommunity(communityId, { isFeatured: next });
      setCommunity(updated);
      toast.success(
        next ? t('communities.detail.toasts.featuredSuccess') : t('communities.detail.toasts.unfeaturedSuccess')
      );
    } catch (error: any) {
      console.error('Error toggling community featured:', error);
      toast.error(error?.response?.data?.message || t('communities.detail.toasts.featureError'));
    } finally {
      setIsTogglingFeatured(false);
    }
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-2xl" />

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
                  <span>{community.location || '—'}</span>
                </div>
                {(() => {
                  const CITY_CATEGORIES = ['City Communities', 'المجتمعات الحضرية'];
                  const PURPOSE_CATEGORIES = [
                    'Awareness & Charity', 'Corporate', 'Education', 'Health', 'Special Purpose',
                    'الوعي والخيرية', 'شركات', 'تعليمي', 'صحي',
                  ];
                  const FALLBACK_LABELS: Record<string, string> = {
                    'communityTypes.nightRiders': 'Night Riders',
                    'communityTypes.social/Weekend': 'Social / Weekend',
                    'communityTypes.mtb/Trail': 'MTB / Trail',
                    'communityTypes.education': 'Education',
                    'communityTypes.health': 'Health',
                  };
                  const cleanLabel = (label: string): string => {
                    if (FALLBACK_LABELS[label]) return FALLBACK_LABELS[label];
                    if (label.startsWith('communityTypes.')) return label.replace('communityTypes.', '');
                    return label;
                  };
                  const tags = (typeof community.type === 'string' ? [community.type] : (Array.isArray(community.type) ? community.type : [])).map(cleanLabel);
                  const communityType = tags.length === 0 ? '' : tags.some(t => CITY_CATEGORIES.includes(t)) ? 'city' : tags.some(t => PURPOSE_CATEGORIES.includes(t)) ? 'purpose-based' : 'type';
                  const typeColor = communityType === 'city' ? '#C12D32' : communityType === 'purpose-based' ? '#8B5CF6' : communityType === 'type' ? '#3B82F6' : '#999';
                  const typeLabel = communityType === 'city' ? t('communities.card.cityType') : communityType === 'purpose-based' ? t('communities.card.purposeType') : communityType === 'type' ? t('communities.card.interestType') : '';

                  return communityType ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: typeColor }}>
                      {typeLabel}
                    </span>
                  ) : null;
                })()}
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{((community.stats?.members ?? Number(community.memberCount)) || 0).toLocaleString()} {t('communities.detail.members')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{communityEvents.length} {t('communities.detail.events')}</span>
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
                <div className="text-2xl font-semibold mb-1" style={{ color: '#333' }}>{feedPosts.length}</div>
                <div className="text-sm" style={{ color: '#666' }}>{t('communities.detail.stats.totalPosts', 'Total Posts')}</div>
              </div>
              <div className="rounded-2xl p-6 bg-white shadow-sm">
                <Calendar className="w-8 h-8 mb-3" style={{ color: '#CF9F0C' }} />
                <div className="text-2xl font-semibold mb-1" style={{ color: '#333' }}>{communityEvents.length}</div>
                <div className="text-sm" style={{ color: '#666' }}>{t('communities.detail.stats.events', 'Events')}</div>
              </div>
              <div className="rounded-2xl p-6 bg-white shadow-sm">
                <Route className="w-8 h-8 mb-3" style={{ color: '#10B981' }} />
                <div className="text-2xl font-semibold mb-1" style={{ color: '#333' }}>{allTracks.length}</div>
                <div className="text-sm" style={{ color: '#666' }}>{t('communities.detail.stats.activeTracks', 'Active Tracks')}</div>
              </div>
              <div className="rounded-2xl p-6 bg-white shadow-sm">
                <Image className="w-8 h-8 mb-3" style={{ color: '#8B5CF6' }} />
                <div className="text-2xl font-semibold mb-1" style={{ color: '#333' }}>{galleryImages.length}</div>
                <div className="text-sm" style={{ color: '#666' }}>{t('communities.detail.stats.galleryItems', 'Gallery Items')}</div>
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
                  <span className="text-sm" style={{ color: '#666' }}>{t('communities.detail.createdLabel', 'Created')}</span>
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
                  onClick={handleToggleFeatured}
                  disabled={isTogglingFeatured}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all hover:shadow-md"
                  style={{
                    backgroundColor: isFeaturedOnHomepage ? '#10B981' : '#E1C06E',
                    color: isFeaturedOnHomepage ? '#fff' : '#333',
                    opacity: isTogglingFeatured ? 0.7 : 1,
                  }}
                >
                  <Award className="w-4 h-4" />
                  <span>
                    {isTogglingFeatured
                      ? t('common.saving')
                      : isFeaturedOnHomepage
                        ? t('communities.detail.unfeatureFromHomepage')
                        : t('communities.detail.featureOnHomepage')}
                  </span>
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
              onClick={() => openCreatePostModal()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all"
              style={{ backgroundColor: '#C12D32' }}
            >
              <Plus className="w-5 h-5" />
              <span>{t('communities.detail.feed.createPost')}</span>
            </button>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {feedPosts.map((post) => (
              <div
                key={post._id}
                className="rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  {post.image && (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-32 h-32 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold" style={{ color: '#333' }}>{post.title}</h3>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white capitalize"
                        style={{ backgroundColor: getPostTypeColor(post.postType) }}
                      >
                        {t(`communities.detail.feed.types.${post.postType.toLowerCase()}`, post.postType)}
                      </span>
                    </div>
                    {post.caption && <p className="mb-3" style={{ color: '#666' }}>{post.caption}</p>}
                    <div className="flex items-center justify-between">
                      <div className="text-sm" style={{ color: '#999' }}>
                        {typeof post.createdBy === 'object' ? post.createdBy.fullName : ''} • {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditPostModal(post)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={t('communities.detail.feed.editPost', 'Edit Post')}
                        >
                          <Edit className="w-4 h-4" style={{ color: '#3B82F6' }} />
                        </button>
                        <button
                          onClick={() => {
                            setPostToDelete(post._id);
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
                  onClick={() => openCreatePostModal()}
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
                        {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : '—'} •{' '}
                        {event.eventTime || (event.eventDate ? new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—')}
                      </span>
                    </div>

                    {/* Event Location */}
                    {(event.address || event.city) && (
                      <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: '#666' }}>
                        <MapPin className="w-4 h-4" />
                        <span>{event.address || event.city}</span>
                      </div>
                    )}

                    {/* Event Description */}
                    <p className="mb-4 text-sm line-clamp-2" style={{ color: '#666' }}>
                      {event.description}
                    </p>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white capitalize"
                        style={{
                          backgroundColor:
                            event.status === 'Open' ? '#10B981' :
                            event.status === 'Full' ? '#F59E0B' :
                            event.status === 'Completed' ? '#3B82F6' :
                            event.status === 'Draft' ? '#6B7280' : '#EF4444',
                        }}
                      >
                        {event.status || 'Unknown'}
                      </span>
                      <span className="text-xs" style={{ color: '#999' }}>
                        {t('communities.detail.eventsTab.participants', { count: event.currentParticipants || 0 })}
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
      {activeTab === 'tracks' && (() => {
        // Community's directly associated track (populated object from backend)
        const communityTrackObj = community.trackId as any;
        const communityTrackId = communityTrackObj?._id || communityTrackObj?.id || (typeof communityTrackObj === 'string' ? communityTrackObj : null);

        // Tracks from community events
        const eventTrackIds = new Set<string>();
        communityEvents.forEach((event: any) => {
          const tid = event.trackId?._id || event.trackId?.id || (typeof event.trackId === 'string' ? event.trackId : null);
          if (tid && tid !== communityTrackId) eventTrackIds.add(tid);
        });

        // Match associated tracks from allTracks
        const primaryTrack = communityTrackId ? allTracks.find(t => t.id === communityTrackId || (t as any)._id === communityTrackId) : null;
        const eventTracks = allTracks.filter(t => eventTrackIds.has(t.id) || eventTrackIds.has((t as any)._id));

        // Build display list with labels
        const associatedTracks: { track: Track; label: string }[] = [];
        if (primaryTrack) associatedTracks.push({ track: primaryTrack, label: t('communities.detail.tracksTab.primaryTrack') });
        eventTracks.forEach(tr => associatedTracks.push({ track: tr, label: t('communities.detail.tracksTab.fromEvents') }));

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2" style={{ color: '#333' }}>{t('communities.detail.tracksTab.assignTracks')}</h2>
                <p style={{ color: '#666' }}>{t('communities.detail.tracksTab.tracksAssociated', { count: associatedTracks.length })}</p>
              </div>
            </div>

            {associatedTracks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {associatedTracks.map(({ track, label }) => (
                  <div
                    key={track.id || (track as any)._id}
                    className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/tracks/${track.id || (track as any)._id}`)}
                  >
                    <img
                      src={track.image}
                      alt={track.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: '#333' }}>{track.title}</h3>
                      <div className="flex items-center gap-4 mb-3 text-sm" style={{ color: '#666' }}>
                        {track.distance && <span>{track.distance} {t('common.km')}</span>}
                        {track.difficulty && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{track.difficulty}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: label === t('communities.detail.tracksTab.primaryTrack') ? '#C12D32' : '#3B82F6' }}
                        >
                          {label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl p-12 text-center bg-white shadow-sm">
                <Route className="w-16 h-16 mx-auto mb-4" style={{ color: '#CCC' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#333' }}>{t('communities.detail.tracksTab.noTracks')}</h3>
                <p style={{ color: '#666' }}>{t('communities.detail.tracksTab.noTracksBody')}</p>
              </div>
            )}
          </div>
        );
      })()}

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
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#333' }}>{t('member.member-managaement')}</h3>
            <p style={{ color: '#666' }}>{t('member.view-manage-community-members')}</p>
          </div>
        </div>
      )}

      {/* Delete Post Confirmation Modal */}
      {showPostDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-2xl p-6 max-w-md w-full mx-4 bg-white">
            <h3 className="text-xl mb-4" style={{ color: '#333' }}>{t('communities.detail.feed.deletePost')}</h3>
            <p className="mb-6" style={{ color: '#666' }}>
              {t('communities.detail.feed.deleteConfirm', 'Are you sure you want to delete this post? This action cannot be undone.')}
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
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={async () => {
                  if (postToDelete) {
                    try {
                      await deleteCommunityPostApi(communityId, postToDelete);
                      setFeedPosts(prev => prev.filter(p => p._id !== postToDelete));
                      toast.success(t('communities.detail.toasts.postDeleted', { defaultValue: 'Post deleted successfully' }));
                    } catch (error: any) {
                      toast.error(error?.response?.data?.message || t('communities.detail.toasts.postDeleteError', { defaultValue: 'Failed to delete post' }));
                    }
                    setShowPostDeleteModal(false);
                    setPostToDelete(null);
                  }
                }}
                className="px-4 py-2 rounded-xl text-white"
                style={{ backgroundColor: '#C12D32' }}
              >
                {t('common.delete', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Post Modal */}
      {postModal && (
        <PostFormModal
          key={postModal.mode + (postModal.post?._id ?? '')}
          mode={postModal.mode}
          initialData={postModal.post ? {
            title: postModal.post.title,
            postType: postModal.post.postType,
            caption: postModal.post.caption,
          } : undefined}
          isSubmitting={isSubmittingPost}
          onSubmit={handlePostSubmit}
          onClose={closePostModal}
        />
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

}

