import api from './api';

export interface CommunityPost {
  _id: string;
  communityId: string | { _id: string; title: string; titleAr?: string; status?: boolean };
  title: string;
  postType: 'Announcement' | 'Highlight' | 'Awareness';
  caption?: string;
  image?: string;
  createdBy: string | { _id: string; fullName: string; profileImage?: string };
  createdAt: string;
  updatedAt: string;
}

export interface GetCommunityPostsResponse {
  posts: CommunityPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Get community posts
export const getCommunityPosts = async (
  communityId: string,
  params?: { page?: number; limit?: number; postType?: string }
): Promise<GetCommunityPostsResponse> => {
  const response = await api.get<any>(`/v1/communities/${communityId}/community-posts`, {
    params: { page: params?.page ?? 1, limit: params?.limit ?? 20, postType: params?.postType },
  });
  const data = response.data?.data || response.data;
  return {
    posts: data?.posts || [],
    pagination: data?.pagination || { page: 1, limit: 20, total: 0, pages: 1 },
  };
};

// Create community post
export const createCommunityPost = async (
  communityId: string,
  postData: { title: string; postType: string; caption?: string },
  imageFile?: File
): Promise<CommunityPost> => {
  const formData = new FormData();
  formData.append('title', postData.title);
  formData.append('postType', postData.postType);
  if (postData.caption) formData.append('caption', postData.caption);
  if (imageFile) formData.append('image', imageFile);

  const response = await api.post<any>(`/v1/communities/${communityId}/community-posts`, formData);
  return response.data?.data || response.data;
};

// Update community post
export const updateCommunityPost = async (
  communityId: string,
  postId: string,
  postData: { title?: string; postType?: string; caption?: string },
  imageFile?: File
): Promise<CommunityPost> => {
  const formData = new FormData();
  if (postData.title) formData.append('title', postData.title);
  if (postData.postType) formData.append('postType', postData.postType);
  if (postData.caption !== undefined) formData.append('caption', postData.caption);
  if (imageFile) formData.append('image', imageFile);

  const response = await api.patch<any>(`/v1/communities/${communityId}/community-posts/${postId}`, formData);
  return response.data?.data || response.data;
};

// Delete community post
export const deleteCommunityPost = async (
  communityId: string,
  postId: string
): Promise<void> => {
  await api.delete(`/v1/communities/${communityId}/community-posts/${postId}`);
};
