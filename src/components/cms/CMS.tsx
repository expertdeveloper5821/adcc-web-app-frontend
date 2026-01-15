import React from 'react';
import { Plus, GripVertical, Edit, Trash2 } from 'lucide-react';

interface CMSProps {
  navigate: (page: string) => void;
}

const sections = [
  { id: '1', title: 'Hero Banner', type: 'Image + Text', status: 'Active' },
  { id: '2', title: 'Featured Events', type: 'Event Grid', status: 'Active' },
  { id: '3', title: 'Community Highlights', type: 'Image Gallery', status: 'Active' },
  { id: '4', title: 'Track Showcase', type: 'Carousel', status: 'Active' },
];

export function CMS({ navigate }: CMSProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Content Manager</h1>
          <p style={{ color: '#666' }}>Manage homepage and app content</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-lg text-white" style={{ backgroundColor: '#C12D32' }}>
          <Plus className="w-5 h-5" />
          <span>Add Section</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <h2 className="text-xl mb-6" style={{ color: '#333' }}>Homepage Sections</h2>
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.id} className="p-4 rounded-xl flex items-center gap-4" style={{ backgroundColor: '#FFF9EF' }}>
              <GripVertical className="w-5 h-5 cursor-move" style={{ color: '#999' }} />
              <div className="flex-1">
                <div className="text-sm mb-1" style={{ color: '#333' }}>{section.title}</div>
                <div className="text-xs" style={{ color: '#666' }}>{section.type}</div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#CF9F0C' }}>
                {section.status}
              </span>
              <button className="p-2 hover:bg-white rounded-lg transition-colors">
                <Edit className="w-4 h-4" style={{ color: '#666' }} />
              </button>
              <button className="p-2 hover:bg-white rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" style={{ color: '#C12D32' }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
