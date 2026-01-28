import React from "react";
import { useI18n } from "@/contexts/I18nContext";
import { getAvatarHeadUrl, getAvatarFallbackUrl } from "@/utils/avatarHelpers";

export interface FeedPost {
  id: string;
  userName: string;
  text: string;
  createdAt: string;
  hotel?: string;
  figureString?: string;
}

interface FriendsPostsFeedProps {
  posts: FeedPost[];
  onNavigateToProfile?: (username: string, hotelDomain?: string, uniqueId?: string) => void;
}

export const FriendsPostsFeed: React.FC<FriendsPostsFeedProps> = ({
  posts,
  onNavigateToProfile,
}) => {
  const { t } = useI18n();
  const hotel = "br";

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-white/60 mb-2">{t("pages.console.noPostsYet")}</p>
        <p className="text-white/40 text-sm">{t("pages.console.noPostsDescription")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const hotelDomain = (post.hotel || hotel) === "br" ? "com.br" : (post.hotel || hotel) === "tr" ? "com.tr" : post.hotel || "com.br";
        const avatarUrl = getAvatarHeadUrl(
          post.userName,
          post.hotel || hotel,
          post.figureString,
          "s"
        );

        return (
          <article
            key={post.id}
            className="rounded-lg border border-white/20 bg-white/5 overflow-hidden flex-shrink-0"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.02) 1px, rgba(255,255,255,0.02) 2px)",
              backgroundSize: "100% 2px",
            }}
          >
            {/* Header no estilo do feed de fotos: avatar + nome clicável */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-white/5">
              <button
                type="button"
                onClick={() => onNavigateToProfile?.(post.userName, hotelDomain)}
                className="flex items-center gap-2 min-w-0 rounded hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-8 h-8 flex-shrink-0 overflow-hidden rounded">
                  <img
                    src={avatarUrl}
                    alt={post.userName}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: "pixelated" }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getAvatarFallbackUrl(post.userName, "s");
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-white truncate">
                  {post.userName}
                </span>
              </button>
            </div>
            {/* Corpo do post */}
            <div className="px-3 py-3">
              <p className="text-sm text-white/90 break-words whitespace-pre-wrap">
                {post.text}
              </p>
              <p className="text-xs text-white/50 mt-2">
                {new Date(post.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
};
