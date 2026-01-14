import React, { useState } from 'react';
import { CheckCircle, XCircle, Ban, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface FeedModerationProps {
  navigate: (page: string) => void;
}

type TabType = 'pending' | 'approved' | 'reported';

const posts = [
  { id: '1', user: 'Ahmed Al Mansoori', content: 'Great ride this morning! Weather was perfect.', status: 'pending', image: 'https://images.unsplash.com/photo-1707297391684-e07bd2368432?w=200' },
  { id: '2', user: 'Sara Ali', content: 'Looking forward to the Yas Island event next week!', status: 'pending', image: null },
  { id: '3', user: 'Mohammed Hassan', content: 'Check out my new bike! Ready for the desert adventure.', status: 'reported', image: 'https://images.unsplash.com/photo-1716738634956-1494117b349b?w=200' },
];

export function FeedModeration({ navigate }: FeedModerationProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  const handleApprove = (postId: string) => {
    toast.success('Post approved');
  };

  const handleReject = (postId: string) => {
    toast.success('Post rejected');
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
        {posts.filter(post => post.status === activeTab).map((post) => (
          <div key={post.id} className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-start gap-4">
              {post.image && (
                <img src={post.image} alt="" className="w-20 h-20 rounded-lg object-cover" />
              )}
              <div className="flex-1">
                <div className="text-sm mb-1" style={{ color: '#333' }}>{post.user}</div>
                <p className="text-sm mb-4" style={{ color: '#666' }}>{post.content}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(post.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
                    style={{ backgroundColor: '#CF9F0C' }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(post.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
                    style={{ backgroundColor: '#C12D32' }}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: '#ECC180', color: '#333' }}>
                    <Ban className="w-4 h-4" />
                    <span>Ban User</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
