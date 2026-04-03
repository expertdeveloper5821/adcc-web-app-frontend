import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ShoppingBag, AlertCircle } from 'lucide-react';

interface PendingApprovalsProps {
  pendingFeedPosts?: number;
  pendingStoreItems?: number;
  reportedFeedPosts?: number;
}

export function PendingApprovals({
  pendingFeedPosts = 0,
  pendingStoreItems = 0,
  reportedFeedPosts = 0,
}: PendingApprovalsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const approvals = [
    { type: 'feed', count: pendingFeedPosts, label: t('dashboard.pendingPosts'), icon: <MessageSquare className="w-5 h-5" /> },
    { type: 'marketplace', count: pendingStoreItems, label: t('dashboard.marketplaceItems'), icon: <ShoppingBag className="w-5 h-5" /> },
    { type: 'reports', count: reportedFeedPosts, label: t('dashboard.reportedContent'), icon: <AlertCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl" style={{ color: '#333' }}>{t('dashboard.pendingApprovals')}</h2>
      </div>

      <div className="space-y-4">
        {approvals.map((approval) => (
          <button
            key={approval.type}
            onClick={() => navigate(`/${approval.type}`)}
            className="w-full p-4 rounded-xl transition-all hover:shadow-md"
            style={{ backgroundColor: '#FFF9EF' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                  {approval.icon}
                </div>
                <span className="text-sm" style={{ color: '#333' }}>{approval.label}</span>
              </div>
              <div className="px-3 py-1 rounded-full text-white text-sm" style={{ backgroundColor: '#C12D32' }}>
                {approval.count}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: '#E1C06E', color: '#333' }}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="mb-1">{t('dashboard.actionRequired')}</div>
            <div style={{ color: '#666' }}>{t('dashboard.actionRequiredBody')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
