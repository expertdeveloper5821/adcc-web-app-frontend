import React, { useEffect, useMemo, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Edit, GripVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

export interface ContentSetting {
  _id: string;
  group: string;
  key: string;
  label: string;
  title?: string;
  description?: string;
  image?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface GetContentSettingsParams {
  group?: string;
  key?: string;
  active?: boolean;
}

type UpdateContentSettingPayload = Partial<
  Pick<ContentSetting, 'title' | 'description' | 'image' | 'active'>
> & {
  imageFile?: File;
};

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const message =
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      axiosError.message;
    return typeof message === 'string' ? message : fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
};

const normalizeContentSettings = (rawResponse: unknown): ContentSetting[] => {
  if (!rawResponse || typeof rawResponse !== 'object') return [];

  const response = rawResponse as Record<string, unknown>;
  const payload = (response.data as Record<string, unknown> | undefined) ?? response;
  const candidates =
    (payload.settings as unknown[]) ??
    (payload.items as unknown[]) ??
    (response.settings as unknown[]) ??
    [];

  if (!Array.isArray(candidates)) return [];

  return candidates
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      _id: String(item._id ?? item.id ?? item.key ?? ''),
      group: String(item.group ?? ''),
      key: String(item.key ?? ''),
      label: String(item.label ?? ''),
      title: typeof item.title === 'string' ? item.title : undefined,
      description: typeof item.description === 'string' ? item.description : undefined,
      image: typeof item.image === 'string' ? item.image : undefined,
      active: typeof item.active === 'boolean' ? item.active : undefined,
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : undefined,
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : undefined,
    }))
    .filter((item) => item.group && item.key && item.label);
};

export const getContentSettings = async (
  params: GetContentSettingsParams
): Promise<ContentSetting[]> => {
  try {
    const response = await api.get('/v1/settings/content/list', {
      params: {
        group: params.group,
        key: params.key,
        active: params.active === undefined ? undefined : String(params.active),
      },
    });
    return normalizeContentSettings(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load content settings'));
  }
};

export const updateContentSetting = async (
  key: string,
  payload: UpdateContentSettingPayload
): Promise<void> => {
  try {
    const formData = new FormData();

    if (payload.title !== undefined) formData.append('title', payload.title);
    if (payload.description !== undefined) formData.append('description', payload.description);
    if (payload.imageFile) {
      formData.append('image', payload.imageFile);
    } else if (payload.image !== undefined) {
      formData.append('image', payload.image);
    }
    if (payload.active !== undefined) formData.append('active', String(payload.active));

    await api.patch(`/v1/settings/content/${key}`, formData);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update content setting'));
  }
};

export const deleteContentSetting = async (key: string): Promise<void> => {
  try {
    if (!key) throw new Error('Content key is required');
    await api.delete(`/v1/settings/content/${key}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete content setting'));
  }
};

interface ItemFormState {
  title: string;
  description: string;
  image: string;
  active: boolean;
}

const fileToDataUrl = async (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Failed to read image file'));
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

export function CMS() {
  const { t } = useTranslation();
  const [allItems, setAllItems] = useState<ContentSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<ContentSetting | null>(null);
  const [editForm, setEditForm] = useState<ItemFormState>({
    title: '',
    description: '',
    image: '',
    active: true,
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreviewUrl, setEditImagePreviewUrl] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!editImageFile) {
      setEditImagePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(editImageFile);
    setEditImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [editImageFile]);

  const availableGroups = useMemo(() => {
    return Array.from(new Set(allItems.map((item) => item.group))).filter(Boolean);
  }, [allItems]);

  const groupedItems = useMemo(() => {
    const grouped: Record<string, ContentSetting[]> = {};
    for (const group of availableGroups) grouped[group] = [];
    for (const item of allItems) {
      if (!grouped[item.group]) grouped[item.group] = [];
      grouped[item.group].push(item);
    }
    return grouped;
  }, [allItems, availableGroups]);

  const fetchAllGroupsSettings = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getContentSettings({});
      setAllItems(data);
    } catch (error) {
      const message = getApiErrorMessage(error, t('cms.toasts.loadError'));
      setErrorMessage(message);
      setAllItems([]);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchAllGroupsSettings();
  }, []);

  const openEditForm = (item: ContentSetting) => {
    setSelectedItem(item);
    setEditForm({
      title: item.title ?? '',
      description: item.description ?? '',
      image: item.image ?? '',
      active: item.active ?? true,
    });
    setEditImageFile(null);
    setEditImagePreviewUrl(null);
  };

  const closeEditForm = () => {
    setSelectedItem(null);
    setEditForm({ title: '', description: '', image: '', active: true });
    setEditImageFile(null);
    setEditImagePreviewUrl(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;

    const patchPayload: UpdateContentSettingPayload = {};

    if ((selectedItem.title ?? '') !== editForm.title) patchPayload.title = editForm.title;
    if ((selectedItem.description ?? '') !== editForm.description) {
      patchPayload.description = editForm.description;
    }
    if (editImageFile) {
      patchPayload.imageFile = editImageFile;
    } else if ((selectedItem.image ?? '') !== editForm.image) {
      patchPayload.image = editForm.image;
    }
    if ((selectedItem.active ?? true) !== editForm.active) patchPayload.active = editForm.active;

    if (Object.keys(patchPayload).length === 0) {
      toast.info(t('cms.toasts.noEditableChanges'));
      return;
    }

    setIsSavingEdit(true);
    try {
      await updateContentSetting(selectedItem.key, patchPayload);
      toast.success(t('cms.toasts.updateSuccess'));
      closeEditForm();
      await fetchAllGroupsSettings();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cms.toasts.saveError')));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleActive = async (item: ContentSetting) => {
    setTogglingKey(item.key);
    try {
      await updateContentSetting(item.key, { active: !(item.active ?? false) });
      toast.success(t('cms.toasts.updateSuccess'));
      await fetchAllGroupsSettings();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cms.toasts.saveError')));
    } finally {
      setTogglingKey(null);
    }
  };

  const handleDelete = async (item: ContentSetting) => {
    const confirmed = window.confirm(`${t('cms.deleteMessage')}\n(${item.key})`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteContentSetting(item.key);
      toast.success(t('cms.toasts.deleteSuccess'));
      await fetchAllGroupsSettings();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('cms.toasts.deleteError')));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>
          {t('cms.title')}
        </h1>
        <p style={{ color: '#666' }}>
          {t('cms.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div
            className="animate-spin rounded-full h-10 w-10 border-b-2"
            style={{ borderColor: '#C12D32' }}
          />
        </div>
      ) : errorMessage ? (
        <div className="py-8 text-sm" style={{ color: '#C12D32' }}>
          {errorMessage}
        </div>
      ) : (
        <div className="space-y-6">
          {availableGroups.map((group) => {
            const groupData = groupedItems[group] ?? [];
            return (
              <div key={group} className="p-6 rounded-2xl shadow-sm bg-white">
                <h2 className="text-xl mb-6 capitalize" style={{ color: '#333' }}>
                  {group.replace(/-/g, ' ')}
                </h2>

                {groupData.length === 0 ? (
                  <div className="py-6 text-sm" style={{ color: '#666' }}>
                    {t('cms.noSectionItems')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupData.map((item) => (
                      <div
                        key={item._id || item.key}
                        className="p-4 rounded-xl flex items-center gap-4"
                        style={{ backgroundColor: '#F3EEE7' }}
                      >
                        <GripVertical className="w-5 h-5" style={{ color: '#999' }} />
                        <div className="flex-1">
                          <div className="text-sm mb-1" style={{ color: '#333' }}>
                            {  item.label || item.title }
                          </div>
                          <div className="text-xs mb-1" style={{ color: '#666' }}>
                            {item.description || item.label}
                          </div>
                          {/* <div className="text-[11px]" style={{ color: '#999' }}>
                            key: {item.key} | label: {item.label}
                          </div> */}
                        </div>
                        <button
                          onClick={() => handleToggleActive(item)}
                          disabled={togglingKey === item.key}
                          className="px-3 py-1 rounded-full text-xs text-white disabled:opacity-60"
                          style={{ backgroundColor: item.active ? '#CF9F0C' : '#8A8A8A' }}
                        >
                          {togglingKey === item.key
                            ? t('cms.saving')
                            : item.active
                              ? t('cms.active')
                              : t('cms.inactive')}
                        </button>
                        <button
                          onClick={() => openEditForm(item)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                          aria-label={`Edit ${item.key}`}
                        >
                          <Edit className="w-4 h-4" style={{ color: '#666' }} />
                        </button>
                        {/* <button
                          onClick={() => handleDelete(item)}
                          disabled={isDeleting}
                          className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-60"
                          aria-label={`Delete ${item.key}`}
                        >
                          <Trash2 className="w-4 h-4" style={{ color: '#C12D32' }} />
                        </button> */}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0  z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl h-screen overflow-auto rounded-2xl  bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg" style={{ color: '#333' }}>
                {t('cms.editSection')}: {selectedItem.label || selectedItem.key || selectedItem.title}
              </h3>
              <button onClick={closeEditForm} className="text-sm" style={{ color: '#666' }}>
                {t('cms.cancel')}
              </button>
            </div>
        

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div className="space-y-1">
                <label className="block text-xs font-medium" style={{ color: '#666' }}>
                  Group
                </label>
                <input
                  value={selectedItem.group}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100"
                  aria-label="group-readonly"
                />
              </div> */}
              {/* <div className="space-y-1">
                <label className="block text-xs font-medium" style={{ color: '#666' }}>
                  Key
                </label>
                <input
                  value={selectedItem.key}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100"
                  aria-label="key-readonly"
                />
              </div> */}
              {/* <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-medium" style={{ color: '#666' }}>
                  Label
                </label>
                <input
                  value={selectedItem.label}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100"
                  aria-label="label-readonly"
                />
              </div> */}

              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-medium" style={{ color: '#666' }}>
                  {t('cms.fields.title')}
                </label>
                <input
                  value={editForm.title}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder={t('cms.fields.titlePlaceholder')}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-medium" style={{ color: '#666' }}>
                  {t('cms.imagePreview')}
                </label>
                <div className="w-full border rounded-lg p-2" style={{ backgroundColor: '#FAF7F2' }}>
                  <img
                    src={editImagePreviewUrl || selectedItem?.image || ''}
                    alt=""
                    className="w-full h-40 object-cover rounded-md"
                    style={{ display: selectedItem?.image || editImagePreviewUrl ? 'block' : 'none' }}
                  />
                  {!selectedItem?.image && !editImagePreviewUrl ? (
                    <div className="text-xs" style={{ color: '#999' }}>
                      {t('cms.imageNotAvailable')}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-medium" style={{ color: '#666' }}>
                  {t('cms.uploadImage')}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setEditImageFile(file);
                  }}
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                />
                {editImageFile ? (
                  <p className="text-xs" style={{ color: '#666' }}>
                    {t('cms.selectedFile')}: {editImageFile.name}
                  </p>
                ) : null}
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-medium" style={{ color: '#666' }}>
                  {t('cms.fields.description')}
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder={t('cms.fields.descriptionPlaceholder')}
                  rows={4}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editForm.active}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, active: event.target.checked }))}
                  />
                  {t('cms.active')}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeEditForm}
                className="px-4 py-2 rounded-lg border"
                style={{ color: '#666' }}
              >
                {t('cms.cancel')}
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-4 py-2 rounded-lg text-white disabled:opacity-60"
                style={{ backgroundColor: '#C12D32' }}
              >
                {isSavingEdit ? t('cms.saving') : t('cms.update')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
