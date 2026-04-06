import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Ban } from 'lucide-react';
import { toast } from 'sonner';
import {
  FeedPost,
  getFeedPosts,
  moderateFeedPost,
  moderateFeedUserBan,
  FeedPostStatus,
} from '../../services/feedPostsApi';

type TabType = 'pending' | 'approved' | 'reported';

export function FeedModeration() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPostsForTab = async (tab: TabType) => {
    setIsLoading(true);
    // Clear while loading so the spinner displays during tab switches.
    setPosts([]);
    try {
      const query =
        tab === 'reported'
          ? { reported: true as boolean, limit: 50 }
          : { status: tab as FeedPostStatus, reported: false, limit: 50 };

      const data = await getFeedPosts(query);

      // In case backend returns mixed results for a query, enforce UI categorization here.
      const filtered = data.filter((p) => {
        const status = (p.status ?? '') as FeedPostStatus | '';
        const isReported = p.reported === true;

        // Reported tab represents all reported posts.
        if (tab === 'reported') return isReported;
        // If backend doesn't return status, default to the tab expectation.
        if (tab === 'pending') return !isReported && (status === 'pending' || status === '');
        // Approved tab should always show approved posts, even if reported flag is true.
        if (tab === 'approved') return status === 'approved';
        return false;
      });

      setPosts(filtered);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to load feed posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchPostsForTab(activeTab);
  }, [activeTab]);

  const getPostId = (post: FeedPost): string | null => post._id ?? post.id ?? null;
  const getUserId = (post: FeedPost): string | null => {
    if (post.userId) return post.userId;
    if (typeof post.createdBy !== 'string') return post.createdBy?._id ?? null;
    return null;
  };

  const handleApprove = async (postId: string) => {
    const nextStatus: FeedPostStatus = 'approved';
    try {
      await moderateFeedPost(postId, { status: nextStatus, reported: false });
      toast.success('Post approved');
      await fetchPostsForTab(activeTab);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to approve post');
    }
  };

  const handleReject = async (postId: string) => {
    const nextStatus: FeedPostStatus = 'rejected';
    try {
      await moderateFeedPost(postId, { status: nextStatus, reported: false });
      toast.success('Post rejected');
      await fetchPostsForTab(activeTab);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to reject post');
    }
  };

  const handleBanUser = async (userId: string, banFeedPost: boolean) => {
    try {
      await moderateFeedUserBan(userId, banFeedPost);
      toast.success(banFeedPost ? 'User banned from feed' : 'User unbanned from feed');
      await fetchPostsForTab(activeTab);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update user ban status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Feed Moderation</h1>
        <p style={{ color: '#666' }}>Review and moderate community posts</p>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {(['pending', 'approved', 'reported'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-3 px-2 text-sm capitalize"
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

      <div className="space-y-4">
        {isLoading && posts.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
          </div>
        ) : null}

        {posts.map((post) => {
          const postId = getPostId(post);
          const userId = getUserId(post);
          if (!postId) return null;

          const userName =
            typeof post.createdBy === 'string'
              ? post.createdBy
              : post.createdBy?.fullName ?? '—';

          const imageUrl = post.image ?? (post as any).imageUrl ?? null;
          const content = post.description || post.title || '';

          return (
            <div key={postId} className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-start gap-4">
              {imageUrl && (
                <img src={imageUrl} alt="" className="w-20 h-20 rounded-lg object-cover" />
              )}
              <div className="flex-1">
                <div className="text-sm mb-1" style={{ color: '#333' }}>{userName}</div>
                <p className="text-sm mb-4" style={{ color: '#666' }}>{content}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(postId)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
                    style={{ backgroundColor: '#CF9F0C' }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(postId)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
                    style={{ backgroundColor: '#C12D32' }}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => userId && handleBanUser(userId, !post.banFeedPost)}
                    disabled={!userId}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                    style={{
                      backgroundColor: '#ECC180',
                      color: '#333',
                      opacity: userId ? 1 : 0.6,
                      cursor: userId ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <Ban className="w-4 h-4" />
                    <span>{post.banFeedPost ? 'Unban User' : 'Ban User'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
