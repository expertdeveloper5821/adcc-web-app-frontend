import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Star, MessageCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { getStoreItems, approveStoreItem, rejectStoreItem, featureStoreItem, StoreItem } from '../../services/storeApi';

export function MarketplaceModeration() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getStoreItems();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load marketplace items');
      toast.error('Failed to load marketplace items');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleApprove = async (itemId: string | undefined) => {
    if (!itemId) return;
    try {
      setActionId(itemId);
      const res = await approveStoreItem(itemId);
      if (res?.success) {
        toast.success(res.message ?? 'Item approved');
        await fetchItems();
      } else {
        toast.error(res?.message ?? 'Failed to approve item');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve item');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (itemId: string | undefined) => {
    if (!itemId) return;
    try {
      setActionId(itemId);
      const res = await rejectStoreItem(itemId);
      if (res?.success) {
        toast.success(res.message ?? 'Item rejected');
        await fetchItems();
      } else {
        toast.error(res?.message ?? 'Failed to reject item');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject item');
    } finally {
      setActionId(null);
    }
  };

  const handleFeature = async (itemId: string | undefined) => {
    if (!itemId) return;
    try {
      setActionId(itemId);
      const res = await featureStoreItem(itemId);
      if (res?.success) {
        toast.success(res.message ?? 'Item featured');
        await fetchItems();
      } else {
        toast.error(res?.message ?? 'Failed to feature item');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to feature item');
    } finally {
      setActionId(null);
    }
  };

  const formatPrice = (item: StoreItem) => {
    const symbol = item.currency === 'AED' ? 'AED' : item.currency;
    return `${symbol} ${Number(item.price).toLocaleString()}`;
  };

  const getItemImage = (item: StoreItem): string | undefined =>
    item.coverImage ?? (item.photos?.length ? item.photos[0] : undefined);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Marketplace Moderation</h1>
          <p style={{ color: '#666' }}>Review and manage marketplace listings</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Marketplace Moderation</h1>
          <p style={{ color: '#666' }}>Review and manage marketplace listings</p>
        </div>
        <div className="p-6 rounded-2xl bg-red-50 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Marketplace Moderation</h1>
        <p style={{ color: '#666' }}>Review and manage marketplace listings</p>
      </div>

      {items.length === 0 ? (
        <div className="p-6 rounded-2xl shadow-sm bg-white text-center" style={{ color: '#666' }}>
          No marketplace items to review.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id ?? item.title + item.price} className="p-6 rounded-2xl shadow-sm bg-white">
              <div className="flex items-start gap-4">
                {getItemImage(item) ? (
                  <img src={getItemImage(item)} alt={item.title} className="w-24 h-24 rounded-lg object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center" style={{ color: '#999' }}>
                    No image
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg mb-1" style={{ color: '#333' }}>{item.title}</h3>
                  {item.description && (
                    <p className="text-sm mb-2 line-clamp-2" style={{ color: '#666' }}> seller :{item.createdBy?.fullName}</p>
                  )}
                  {/* <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-2" style={{ color: '#666' }}>
                    {item.category && <span>Category: {item.category}</span>}
                    {item.condition && <span>Condition: {item.condition}</span>}
                    {item.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {item.city}
                      </span>
                    )}
                  </div> */}
                  <p className="text-lg mb-1" style={{ color: '#C12D32' }}>{formatPrice(item)}</p>
                  {/* {(item.contactMethod || item.phoneNumber) && (
                    <p className="text-sm mb-3 flex items-center gap-1" style={{ color: '#666' }}>
                      <MessageCircle className="w-3.5 h-3.5" />
                      {item.contactMethod && `${item.contactMethod}`}
                      {item.contactMethod && item.phoneNumber && ' · '}
                      {item.phoneNumber && item.phoneNumber}
                    </p>
                  )} */}
                    {/* {item.status && (
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-3"
                        style={{
                          backgroundColor: item.status === 'Pending' ? '#FEF3C7' : item.status === 'Approved' ? '#D1FAE5' : '#FEE2E2',
                          color: item.status === 'Pending' ? '#92400E' : item.status === 'Approved' ? '#065F46' : '#991B1B',
                        }}
                      >
                        {item.status}
                      </span>
                    )} */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={actionId === (item.id ?? item._id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#CF9F0C' }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{actionId === (item.id ?? item._id) ? '...' : 'Approve'}</span>
                    </button>
                    <button
                      onClick={() => handleFeature(item.id)}
                      disabled={actionId === (item.id ?? item._id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#E1C06E', color: '#333' }}
                    >
                      <Star className="w-4 h-4" />
                      <span>{actionId === (item.id ?? item._id) ? '...' : 'Feature'}</span>
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={actionId === (item.id ?? item._id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#C12D32' }}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{actionId === (item.id ?? item._id) ? '...' : 'Reject'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
