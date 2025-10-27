// Interfaces centralizadas para dados do Habbo
// Evita duplicação e garante consistência

export interface HabboBadge {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface GuestbookEntry {
  id: string;
  author_habbo_name: string;
  message: string;
  created_at: string;
}

export interface GuestbookSubmitResult {
  success: boolean;
  entry?: GuestbookEntry;
  error?: string;
}

export interface HabboData {
  id: string;
  supabase_user_id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  motto: string;
  figure_string: string;
  is_online: boolean;
  member_since?: string;
  current_level?: number;
  total_experience?: number;
  star_gem_count?: number;
  last_access_time?: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HabboUser {
  id: string;
  name: string;
  motto: string;
  online: boolean;
  memberSince: string;
  selectedBadges: HabboBadge[];
  badges: HabboBadge[];
  figureString: string;
  profileVisible: boolean;
  uniqueId?: string;
  currentLevel?: number;
  totalExperience?: number;
  starGemCount?: number;
  lastAccessTime?: string;
}

export interface HabboAccount {
  id: string;
  habbo_username: string;
  habbo_name?: string;
  supabase_user_id?: string;
  habbo_id?: string;
  motto?: string;
  figure_string?: string;
  is_online?: boolean;
}

export interface Widget {
  id: string;
  widget_type: string;
  x: number;
  y: number;
  z_index: number;
  width: number;
  height: number;
  is_visible: boolean;
  config?: WidgetConfig;
}

export interface Sticker {
  id: string;
  sticker_id: string;
  x: number;
  y: number;
  z_index: number;
  scale: number;
  rotation: number;
  sticker_src: string;
  category: string;
}

export interface Background {
  background_type: 'color' | 'cover' | 'repeat' | 'image';
  background_value: string;
}

// Tipos para props de componentes
export interface HomeCanvasProps {
  widgets: Widget[];
  stickers: Sticker[];
  background: Background;
  habboData: HabboData;
  guestbook: GuestbookEntry[];
  isEditMode: boolean;
  isOwner: boolean;
  currentUser?: { id: string; habbo_name: string };
  onWidgetPositionChange: (widgetId: string, x: number, y: number) => void;
  onStickerPositionChange: (stickerId: string, x: number, y: number) => void;
  onStickerRemove: (stickerId: string) => void;
  onStickerBringToFront?: (stickerId: string) => void;
  onStickerSendToBack?: (stickerId: string) => void;
  onWidgetRemove?: (widgetId: string) => void;
  onOpenAssetsModal?: (type: 'stickers' | 'widgets' | 'backgrounds') => void;
  onToggleEditMode?: () => void;
  onSave?: () => void;
  onBackgroundChange?: (type: 'color' | 'cover' | 'repeat' | 'image', value: string) => void;
  onStickerAdd?: (stickerId: string, stickerSrc: string, category: string) => void;
  onWidgetAdd?: (widgetType: string) => Promise<boolean>;
  onGuestbookSubmit?: (message: string) => Promise<GuestbookSubmitResult>;
  onGuestbookDelete?: (entryId: string) => Promise<void>;
}

export interface HomeWidgetProps {
  widget: Widget;
  habboData: HabboData;
  guestbook: GuestbookEntry[];
  isEditMode: boolean;
  isOwner: boolean;
  onRemove: (widgetId: string) => void;
  onPositionChange: (widgetId: string, x: number, y: number) => void;
  onUpdateConfig?: (widgetId: string, config: WidgetConfig) => void;
  onGuestbookSubmit?: (message: string) => Promise<void>;
  onGuestbookDelete?: (entryId: string) => Promise<void>;
  currentUser?: { id: string; habbo_name: string };
}

// Tipos para sistema de fotos aprimorado
export type PhotoType = 'SELFIE' | 'PHOTO' | 'USER_CREATION';

export interface PhotoLike {
  id: string;
  photo_id: string;
  user_id: string;
  habbo_name: string;
  created_at: string;
}

export interface EnhancedPhoto {
  id: string;
  photo_id: string;
  userName: string;
  imageUrl: string;
  date: string;
  likes: PhotoLike[];
  likesCount: number;
  userLiked: boolean;
  type: PhotoType;
  contentWidth?: number;
  contentHeight?: number;
  caption?: string;
  roomName?: string;
  s3_url?: string;
  preview_url?: string;
  taken_date?: string;
  photo_type?: string;
  timestamp?: number;
}

export interface PhotoCardProps {
  photo: EnhancedPhoto;
  onUserClick: (userName: string) => void;
  onLikesClick: (photoId: string) => void;
  onCommentsClick: (photoId: string) => void;
  showDivider?: boolean;
  className?: string;
}