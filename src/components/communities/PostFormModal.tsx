import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type PostType = 'Announcement' | 'Highlight' | 'Awareness';

export interface PostFormData {
  title: string;
  postType: PostType;
  caption?: string;
}

export interface PostFormModalProps {
  mode: 'create' | 'edit';
  initialData?: PostFormData;
  isSubmitting: boolean;
  onSubmit: (data: PostFormData) => void;
  onClose: () => void;
}

export function PostFormModal({ mode, initialData, isSubmitting, onSubmit, onClose }: PostFormModalProps) {
  const { t } = useTranslation();

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [postType, setPostType] = useState<PostType>(initialData?.postType ?? 'Announcement');
  const [caption, setCaption] = useState(initialData?.caption ?? '');

  const isEdit = mode === 'edit';

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), postType, caption: caption.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col bg-white overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 z-10">
          <h3 className="text-xl font-semibold" style={{ color: '#333' }}>
            {isEdit
              ? t('communities.detail.feed.editPost', 'Edit Announcement')
              : t('communities.detail.feed.createPost')}
          </h3>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>
              {t('communities.detail.feed.postTitle', 'Announcement Title')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
              placeholder={t('communities.detail.feed.postTitlePlaceholder', 'Enter announcement title...')}
            />
          </div>

          {/* Announcement Type */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>
              {t('communities.detail.feed.postType', 'Announcement Type')}
            </label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
            >
              <option value="Announcement">{t('communities.detail.feed.types.announcement', 'Announcement')}</option>
              <option value="Highlight">{t('communities.detail.feed.types.highlight', 'Highlight')}</option>
              <option value="Awareness">{t('communities.detail.feed.types.awareness', 'Awareness')}</option>
            </select>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>
              {t('communities.detail.feed.caption', 'Caption')}
            </label>
            <textarea
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
              placeholder={t('communities.detail.feed.captionPlaceholder', 'Write your announcement caption...')}
            />
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl"
            style={{ backgroundColor: '#ECC180', color: '#333' }}
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            disabled={isSubmitting || !title.trim()}
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl text-white disabled:opacity-50"
            style={{ backgroundColor: '#C12D32' }}
          >
            {isSubmitting
              ? t('common.saving', 'Saving...')
              : isEdit
                ? t('communities.detail.feed.updatePost', 'Update')
                : t('communities.detail.feed.publishPost', 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
}
