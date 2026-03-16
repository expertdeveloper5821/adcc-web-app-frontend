import { api } from "./api";

export type BadgeCategory =
  | "Distance"
  | "Event"
  | "Social"
  | "Achievement"
  | "Special";
export type BadgeRarity = "Common" | "Rare" | "Epic" | "Legendary";

// Frontend badge shape used by badges screens
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // backend stores icon key, we map to emoji in UI
  category: BadgeCategory;
  timesAwarded: number;
  rarity: BadgeRarity;
  requirements: string;
  image: string;
  active: boolean;
}

// Shape coming back from the API – keep it flexible
interface BadgeApi {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  icon?: string;
  category?: string;
  timesAwarded?: number;
  rarity?: string;
  requirements?: string;
  image?: string;
  active?: boolean;
}

function mapBadgeApiToBadge(raw: BadgeApi): Badge | null {
  const id = raw._id || raw.id;
  if (!id) return null;

  const category = (raw.category as BadgeCategory) || "Achievement";
  const rarity = (raw.rarity as BadgeRarity) || "Common";

  return {
    id,
    // Backend uses "name"; keep "name" in UI
    name: raw.name ?? "",
    description: raw.description ?? "",
    icon: raw.icon ?? "trophy",
    category,
    timesAwarded: typeof raw.timesAwarded === "number" ? raw.timesAwarded : 0,
    rarity,
    requirements: raw.requirements ?? "",
    image:
      raw.image ??
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=200",
    active: raw.active ?? true,
  };
}

const extractBadgesArray = (body: unknown): BadgeApi[] => {
  const b = body as
    | BadgeApi[]
    | { data?: BadgeApi[] | { badges?: BadgeApi[] }; badges?: BadgeApi[] };

  if (Array.isArray(b)) {
    return b;
  }

  if (Array.isArray(b?.data as BadgeApi[])) {
    return (b.data as BadgeApi[]) ?? [];
  }

  const data = b.data as { badges?: BadgeApi[] } | undefined;
  if (data && Array.isArray(data.badges)) {
    return data.badges;
  }

  if (Array.isArray(b.badges)) {
    return b.badges;
  }

  return [];
};

export const getAllBadges = async (): Promise<Badge[]> => {
  const response = await api.get("/v1/badges");
  const list = extractBadgesArray(response.data);

  return list.map(mapBadgeApiToBadge).filter((b): b is Badge => b !== null);
};

export const getBadgeById = async (id: string): Promise<Badge> => {
  const response = await api.get(`/v1/badges/${id}`);
  const body = response.data as { data?: BadgeApi } | BadgeApi;

  const raw = (body as any).data ?? body;
  const mapped = mapBadgeApiToBadge(raw as BadgeApi);

  if (!mapped) {
    throw new Error("Badge not found");
  }

  return mapped;
};

export interface SaveBadgePayload {
  name: string;
  description: string;
  requirements: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  timesAwarded: number;
}

function buildBadgeFormData(payload: Partial<SaveBadgePayload>): FormData {
  const formData = new FormData();

  if (payload.name !== undefined) {
    formData.append("name", payload.name);
  }
  if (payload.description !== undefined) {
    formData.append("description", payload.description);
  }
  if (payload.requirements !== undefined) {
    formData.append("requirements", payload.requirements);
  }
  if (payload.icon !== undefined) {
    formData.append("icon", payload.icon);
  }
  if (payload.category !== undefined) {
    formData.append("category", payload.category);
  }
  if (payload.rarity !== undefined) {
    formData.append("rarity", payload.rarity);
  }
  if (payload.timesAwarded !== undefined) {
    formData.append("timesAwarded", String(payload.timesAwarded));
  }

  return formData;
}

export const createBadgeApi = async (
  payload: SaveBadgePayload,
): Promise<Badge> => {
  const formData = buildBadgeFormData(payload);
  console.log(payload, "payload");

  console.log(formData, "formData");
  const response = await api.post("/v1/badges", formData);
  const body = response.data as { data?: BadgeApi } | BadgeApi;
  const raw = (body as any).data ?? body;
  const mapped = mapBadgeApiToBadge(raw as BadgeApi);
  if (!mapped) {
    throw new Error("Failed to create badge");
  }
  return mapped;
};

export const updateBadgeApi = async (
  id: string,
  payload: Partial<SaveBadgePayload>,
): Promise<Badge> => {
  const formData = buildBadgeFormData(payload);
  const response = await api.patch(`/v1/badges/${id}`, formData);
  const body = response.data as { data?: BadgeApi } | BadgeApi;
  const raw = (body as any).data ?? body;
  const mapped = mapBadgeApiToBadge(raw as BadgeApi);
  if (!mapped) {
    throw new Error("Failed to update badge");
  }
  return mapped;
};

export const deleteBadgeApi = async (id: string): Promise<void> => {
  await api.delete(`/v1/badges/${id}`);
};
