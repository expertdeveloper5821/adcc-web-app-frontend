import React, { useState } from 'react';
import { ArrowLeft, Upload, Users, Search } from 'lucide-react';
import { addCommunity, Community, availableTeams } from '../../data/communitiesData';
import { toast } from 'sonner@2.0.3';

interface CommunityCreateProps {
  navigate: (page: string, params?: any) => void;
}

export function CommunityCreate({ navigate }: CommunityCreateProps) {
  const [formData, setFormData] = useState({
    name: '',
    city: 'Abu Dhabi',
    type: 'Club' as Community['type'],
    description: '',
    isPublic: true,
    isFeatured: false,
    adminName: '',
  });

  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [teamSearchTerm, setTeamSearchTerm] = useState('');

  const filteredTeams = availableTeams.filter(team =>
    team.toLowerCase().includes(teamSearchTerm.toLowerCase())
  );

  const toggleTeam = (team: string) => {
    if (selectedTeams.includes(team)) {
      setSelectedTeams(selectedTeams.filter(t => t !== team));
    } else {
      setSelectedTeams([...selectedTeams, team]);
    }
  };

  const handleSubmit = (status: 'Active' | 'Draft') => {
    if (!formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newCommunity: Community = {
      id: Date.now().toString(),
      ...formData,
      membersCount: 0,
      eventsCount: 0,
      status,
      logo: 'https://images.unsplash.com/photo-1584981401957-03158e43750d?w=200',
      coverImage: 'https://images.unsplash.com/photo-1707297391684-e07bd2368432?w=800',
      teams: selectedTeams,
      createdAt: new Date().toISOString(),
    };

    addCommunity(newCommunity);
    toast.success(`Community ${status === 'Active' ? 'published' : 'saved as draft'} successfully`);
    navigate('community-detail', { selectedCommunityId: newCommunity.id });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('communities')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Create Community / Cycling Team</h1>
          <p style={{ color: '#666' }}>Add a new cycling community</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Community Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Abu Dhabi Chapter"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                    style={{ focusRing: '#C12D32' }}
                  >
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Al Ain">Al Ain</option>
                    <option value="Sharjah">Sharjah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: '#666' }}>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Community['type'] })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                    style={{ focusRing: '#C12D32' }}
                  >
                    <option value="Club">Club</option>
                    <option value="Shop">Shop</option>
                    <option value="Women">Women</option>
                    <option value="Youth">Youth</option>
                    <option value="Family">Family</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the community"
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>
            </div>
          </div>

          {/* Team Selector - Pill-Based Multi-Select UI */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h2 className="text-xl mb-4" style={{ color: '#333' }}>Assign Category (Teams)</h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#999' }} />
              <input
                type="text"
                placeholder="Search teams..."
                value={teamSearchTerm}
                onChange={(e) => setTeamSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                style={{ focusRing: '#C12D32' }}
              />
            </div>

            {/* Team Pills */}
            <div className="flex flex-wrap gap-2">
              {filteredTeams.map((team) => {
                const isSelected = selectedTeams.includes(team);
                return (
                  <button
                    key={team}
                    onClick={() => toggleTeam(team)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md"
                    style={{
                      backgroundColor: isSelected ? '#C12D32' : '#ECC180',
                      color: isSelected ? '#fff' : '#333',
                    }}
                  >
                    {team}
                  </button>
                );
              })}
            </div>

            {/* Selected Teams Count */}
            {selectedTeams.length > 0 && (
              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                <div className="text-sm" style={{ color: '#666' }}>
                  Selected: <span style={{ color: '#C12D32' }}>{selectedTeams.length} team{selectedTeams.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>

          {/* Community Image */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h2 className="text-xl mb-6" style={{ color: '#333' }}>Community Images</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Logo</label>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload community logo</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG - Square format recommended</p>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Cover Image</label>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#ECC180' }}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#999' }} />
                  <p className="text-sm" style={{ color: '#666' }}>Upload cover image</p>
                  <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG - Wide format 16:9</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Assignment */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h2 className="text-xl mb-6" style={{ color: '#333' }}>Admin Assignment</h2>
            
            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Community Manager</label>
              <input
                type="text"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                placeholder="Enter manager name or select from users"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                style={{ focusRing: '#C12D32' }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Visibility */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>Visibility</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4"
                  style={{ accentColor: '#C12D32' }}
                />
                <span className="text-sm" style={{ color: '#666' }}>Public Community</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4"
                  style={{ accentColor: '#C12D32' }}
                />
                <span className="text-sm" style={{ color: '#666' }}>Featured Community</span>
              </label>
            </div>

            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
              <p className="text-xs" style={{ color: '#666' }}>
                Featured communities appear on the homepage and in recommended sections
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <button
              onClick={() => handleSubmit('Active')}
              className="w-full px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: '#C12D32' }}
            >
              Publish Community
            </button>
            <button
              onClick={() => handleSubmit('Draft')}
              className="w-full px-4 py-3 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: '#ECC180', color: '#333' }}
            >
              Save as Draft
            </button>
            <button
              onClick={() => navigate('communities')}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
              style={{ color: '#666' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
