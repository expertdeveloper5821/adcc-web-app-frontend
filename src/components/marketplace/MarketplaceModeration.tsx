import React from 'react';
import { CheckCircle, XCircle, Star } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface MarketplaceModerationProps {
  navigate: (page: string) => void;
}

const items = [
  { id: '1', title: 'Specialized Road Bike', price: 'AED 4,500', seller: 'Ahmed Ali', image: 'https://images.unsplash.com/photo-1716738634956-1494117b349b?w=200', status: 'pending' },
  { id: '2', title: 'Cycling Helmet - Brand New', price: 'AED 350', seller: 'Sara Hassan', image: 'https://images.unsplash.com/photo-1707297391684-e07bd2368432?w=200', status: 'pending' },
];

export function MarketplaceModeration({ navigate }: MarketplaceModerationProps) {
  const handleApprove = (itemId: string) => {
    toast.success('Item approved');
  };

  const handleFeature = (itemId: string) => {
    toast.success('Item featured');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Marketplace Moderation</h1>
        <p style={{ color: '#666' }}>Review and manage marketplace listings</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-start gap-4">
              <img src={item.image} alt={item.title} className="w-24 h-24 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="text-lg mb-1" style={{ color: '#333' }}>{item.title}</h3>
                <p className="text-sm mb-1" style={{ color: '#666' }}>Seller: {item.seller}</p>
                <p className="text-lg mb-4" style={{ color: '#C12D32' }}>{item.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
                    style={{ backgroundColor: '#CF9F0C' }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleFeature(item.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: '#E1C06E', color: '#333' }}
                  >
                    <Star className="w-4 h-4" />
                    <span>Feature</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#C12D32' }}>
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
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
