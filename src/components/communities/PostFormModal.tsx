import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Upload } from 'lucide-react';

type PostType = 'Announcement' | 'Highlight' | 'Awareness';

export interface PostFormData {
  title: string;
  postType: PostType;
  caption?: string;
}

export interface PostFormModalProps {
  mode: 'create' | 'edit';
  initialData?: PostFormData & { existingImage?: string };
  isSubmitting: boolean;
  onSubmit: (data: PostFormData, imageFile?: File) => void;
  onClose: () => void;
}

export function PostFormModal({ mode, initialData, isSubmitting, onSubmit, onClose }: PostFormModalProps) {
  const { t } = useTranslation();

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [postType, setPostType] = useState<PostType>(initialData?.postType ?? 'Announcement');
  const [caption, setCaption] = useState(initialData?.caption ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const existingImage = initialData?.existingImage ?? null;
  const isEdit = mode === 'edit';

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit(
      { title: title.trim(), postType, caption: caption.trim() || undefined },
      imageFile || undefined,
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col bg-white overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 z-10">
          <h3 className="text-xl font-semibold" style={{ color: '#333' }}>
            {isEdit
              ? t('communities.detail.feed.editPost', 'Edit Post')
              : t('communities.detail.feed.createPost')}
          </h3>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>
              {t('communities.detail.feed.postTitle', 'Post Title')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C12D32]"
              placeholder={t('communities.detail.feed.postTitlePlaceholder', 'Enter post title...')}
            />
          </div>

          {/* Post Type */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>
              {t('communities.detail.feed.postType', 'Post Type')}
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
              placeholder={t('communities.detail.feed.captionPlaceholder', 'Write your post caption...')}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm mb-2" style={{ color: '#666' }}>
              {t('communities.detail.feed.uploadMedia', 'Upload Media')}
            </label>
            {imageFile ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow"
                >
                  <Trash2 className="w-4 h-4" style={{ color: '#C12D32' }} />
                </button>
              </div>
            ) : existingImage ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={existingImage}
                  alt="Current"
                  className="w-full h-48 object-cover"
                />
                <label className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/80 hover:bg-white rounded-lg shadow cursor-pointer text-sm" style={{ color: '#333' }}>
                  {t('communities.detail.feed.changeImage', 'Change Image')}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            ) : (
              <label className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer block" style={{ borderColor: '#ECC180' }}>
                <Upload className="w-12 h-12 mx-auto mb-3" style={{ color: '#999' }} />
                <p style={{ color: '#666' }}>{t('communities.detail.feed.uploadHint', 'Click to upload image')}</p>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </label>
            )}
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
                ? t('communities.detail.feed.updatePost', 'Update Post')
                : t('communities.detail.feed.publishPost', 'Publish Post')}
          </button>
        </div>
      </div>
    </div>
  );
}
