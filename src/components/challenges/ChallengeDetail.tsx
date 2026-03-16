import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Users, CheckCircle, Calendar, TrendingUp, Award, Trophy, Bell } from 'lucide-react';
import { getChallengeById } from '../../services/challengesApi';
import { UserRole } from '../../App';
import { useTranslation } from 'react-i18next';

interface ChallengeDetailProps {
  role: UserRole;
}

export function ChallengeDetail({ role }: ChallengeDetailProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: challengeId } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Awaited<ReturnType<typeof getChallengeById>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'leaderboard' | 'notifications'>('overview');

  const canEdit = role === 'super-admin' || role === 'community-manager';

  const fetchChallenge = useCallback(async () => {
    if (!challengeId) {
      setChallenge(null);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await getChallengeById(challengeId);
      setChallenge(data);
    } catch {
      setError(t('challenges.challengeNotFound'));
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  }, [challengeId, t]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#C12D32' }} />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/challenges')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <p style={{ color: '#666' }}>{error ?? t('challenges.challengeNotFound')}</p>
      </div>
    );
  }

  const completionRate = challenge.participants > 0
    ? Math.round((challenge.completions / challenge.participants) * 100)
    : 0;

  const daysRemaining = Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const tabLabels: Record<string, string> = {
    overview: t('challenges.overview'),
    participants: `${t('challenges.participants')} (${challenge.participants})`,
    leaderboard: t('challenges.leaderboard'),
    notifications: t('challenges.notifications'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <button
            onClick={() => navigate('/challenges')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 mt-1"
          >
            <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
          </button>
          <div className="min-w-0">
            <h1 className="text-3xl mb-2" style={{ color: '#333' }}>{challenge.title}</h1>
            <p className="line-clamp-2" style={{ color: '#666' }}>{challenge.description}</p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => navigate(`/challenges/${challenge.id}/edit`)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all hover:shadow-lg flex-shrink-0"
            style={{ backgroundColor: '#C12D32' }}
          >
            <Edit className="w-5 h-5" />
            {t('challenges.editChallenge')}
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl shadow-sm" style={{ backgroundColor: '#ECC180' }}>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('challenges.participants')}</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>{challenge.participants}</p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('challenges.completions')}</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>{challenge.completions}</p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('challenges.completionRate')}</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>{completionRate}%</p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5" style={{ color: '#C12D32' }} />
            <span className="text-sm" style={{ color: '#666' }}>{t('challenges.daysRemaining')}</span>
          </div>
          <p className="text-3xl" style={{ color: '#333' }}>{daysRemaining > 0 ? daysRemaining : t('challenges.ended')}</p>
        </div>
      </div>

      {/* Challenge Info Card */}
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('challenges.challengeDetails')}</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm" style={{ color: '#999' }}>{t('challenges.type')}</p>
                <p style={{ color: '#333' }}>{t(`challenges.typeLabels.${challenge.type}`)}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#999' }}>{t('challenges.target')}</p>
                <p style={{ color: '#333' }}>{challenge.target} {challenge.unit}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#999' }}>{t('challenges.duration')}</p>
                <p style={{ color: '#333' }}>
                  {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#999' }}>{t('challenges.status')}</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#10B981' }}>
                  {t(`challenges.statusLabels.${challenge.status}`)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('challenges.reward')}</h3>
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
              <div className="flex items-center gap-3">
                <Award className="w-12 h-12" style={{ color: '#C12D32' }} />
                <div>
                  <p className="font-medium" style={{ color: '#333' }}>{challenge.rewardBadge || t('challenges.noBadgeAssigned')}</p>
                  <p className="text-sm" style={{ color: '#666' }}>{t('challenges.awardedUponCompletion')}</p>
                </div>
              </div>
            </div>

            {challenge.communityNames && challenge.communityNames.length > 0 && (
              <div className="mt-4">
                <p className="text-sm mb-2" style={{ color: '#999' }}>{t('challenges.availableInCommunities')}</p>
                <div className="flex flex-wrap gap-2">
                  {challenge.communityNames.map((name, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#ECC180', color: '#333' }}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {(['overview', 'participants', 'leaderboard', 'notifications'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 transition-colors ${activeTab === tab ? 'border-b-2' : ''}`}
              style={{
                borderColor: activeTab === tab ? '#C12D32' : 'transparent',
                color: activeTab === tab ? '#C12D32' : '#666'
              }}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h3 className="text-lg mb-4" style={{ color: '#333' }}>{t('challenges.progressOverview')}</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm" style={{ color: '#666' }}>{t('challenges.overallProgress')}</span>
                <span className="text-sm font-medium" style={{ color: '#C12D32' }}>{completionRate}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${completionRate}%`, backgroundColor: '#C12D32' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                <p className="text-2xl font-bold" style={{ color: '#C12D32' }}>{challenge.participants}</p>
                <p className="text-sm" style={{ color: '#666' }}>{t('challenges.totalJoined')}</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                <p className="text-2xl font-bold" style={{ color: '#C12D32' }}>{challenge.completions}</p>
                <p className="text-sm" style={{ color: '#666' }}>{t('challenges.completed')}</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#FFF9EF' }}>
                <p className="text-2xl font-bold" style={{ color: '#C12D32' }}>{challenge.participants - challenge.completions}</p>
                <p className="text-sm" style={{ color: '#666' }}>{t('challenges.inProgress')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'participants' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#ECC180' }} />
            <h3 className="text-lg mb-1" style={{ color: '#333' }}>{t('challenges.noParticipants')}</h3>
            <p className="text-sm" style={{ color: '#999' }}>{t('challenges.participantsHint')}</p>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: '#ECC180' }} />
            <h3 className="text-lg mb-1" style={{ color: '#333' }}>{t('challenges.noLeaderboard')}</h3>
            <p className="text-sm" style={{ color: '#999' }}>{t('challenges.leaderboardHint')}</p>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: '#ECC180' }} />
            <h3 className="text-lg mb-1" style={{ color: '#333' }}>{t('challenges.noNotifications')}</h3>
            <p className="text-sm" style={{ color: '#999' }}>{t('challenges.notificationsHint')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
