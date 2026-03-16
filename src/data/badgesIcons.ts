export interface BadgeIconOption {
  key: string;
  emoji: string;
  label: string;
}

export const BADGE_ICON_OPTIONS: BadgeIconOption[] = [
  { key: 'trophy', emoji: '🏆', label: 'Trophy' },
  { key: 'gold_medal', emoji: '🥇', label: 'Gold Medal' },
  { key: 'silver_medal', emoji: '🥈', label: 'Silver Medal' },
  { key: 'bronze_medal', emoji: '🥉', label: 'Bronze Medal' },
  { key: 'star', emoji: '⭐', label: 'Star' },
  { key: 'glowing_star', emoji: '🌟', label: 'Glowing Star' },
  { key: 'dizzy', emoji: '💫', label: 'Dizzy' },
  { key: 'fire', emoji: '🔥', label: 'Fire' },
  { key: 'lightning', emoji: '⚡', label: 'Lightning' },
  { key: 'bicyclist', emoji: '🚴', label: 'Cyclist' },
  { key: 'medal', emoji: '🏅', label: 'Medal' },
  { key: 'crown', emoji: '👑', label: 'Crown' },
  { key: 'diamond', emoji: '💎', label: 'Diamond' },
  { key: 'award', emoji: '🎖️', label: 'Award' },
  { key: 'flag_checkered', emoji: '🏁', label: 'Checkered Flag' },
];

export const getBadgeEmoji = (iconKey?: string | null): string => {
  if (!iconKey) return '🏆';

  const found = BADGE_ICON_OPTIONS.find((opt) => opt.key === iconKey);
  if (found) return found.emoji;

  // If backend sometimes already sends emoji, just return it as-is
  if (iconKey.length <= 3) {
    return iconKey;
  }

  return '🏆';
};

