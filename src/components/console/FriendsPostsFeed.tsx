import React, { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { getAvatarHeadUrl, getAvatarFallbackUrl, getAvatarUrl } from "@/utils/avatarHelpers";
import { Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { validateComment, sanitizeComment, POST_CONFIG } from "@/utils/postValidation";
import { toast } from "sonner";
import { getHotelFlag } from "@/utils/hotelHelpers";

export interface FeedPost {
  id: string;
  userName: string;
  text: string;
  createdAt: string;
  hotel?: string;
  figureString?: string;
  likesCount?: number;
  commentsCount?: number;
  userLiked?: boolean;
  comments?: PostComment[];
}

export interface PostComment {
  id: string;
  postId: string;
  userName: string;
  text: string;
  createdAt: string;
  hotel?: string;
  figureString?: string;
}

interface FriendsPostsFeedProps {
  posts: FeedPost[];
  onNavigateToProfile?: (username: string, hotelDomain?: string, uniqueId?: string) => void;
  onLikePost?: (postId: string) => void;
  onViewPost?: (post: FeedPost) => void;
  onDeletePost?: (postId: string) => void;
  onAddComment?: (postId: string, text: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  currentUserName?: string;
}

export const FriendsPostsFeed: React.FC<FriendsPostsFeedProps> = ({
  posts,
  onNavigateToProfile,
  onLikePost,
  onViewPost,
  onDeletePost,
  onAddComment,
  onDeleteComment,
  currentUserName,
}) => {
  const { t } = useI18n();
  const { habboAccount } = useAuth();
  const hotel = "br";
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-white/60 mb-2">{t("pages.console.noPostsYet")}</p>
        <p className="text-white/40 text-sm">{t("pages.console.noPostsDescription")}</p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post, index) => {
        const hotelDomain = (post.hotel || hotel) === "br" ? "com.br" : (post.hotel || hotel) === "tr" ? "com.tr" : post.hotel || "com.br";
        // Usar figurestring completa (não apenas cabeça)
        const avatarUrl = getAvatarUrl(
          post.userName,
          post.hotel || hotel,
          post.figureString,
          {
            size: 'm',
            direction: 2,
            headDirection: 2,
            gesture: 'std',
            action: 'std'
          }
        );

        return (
          <React.Fragment key={post.id}>
            {/* Divisor tracejado entre posts (não antes do primeiro) */}
            {index > 0 && (
              <div className="border-t border-dashed border-white/20 my-2"></div>
            )}
            {/* Post clicável - abre visualização individual */}
            <div
              onClick={() => onViewPost?.(post)}
              className="cursor-pointer hover:bg-white/5 rounded p-2 -m-2 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Avatar completo - ocupa seção esquerda, alinhado à esquerda */}
                <div className="flex-shrink-0 w-12 h-24 overflow-hidden flex items-center justify-start">
                  <img
                    src={avatarUrl}
                    alt={post.userName}
                    className="h-full w-auto object-contain"
                    style={{ imageRendering: "pixelated" }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const fallbackUrl = post.figureString
                        ? `https://www.habbo.${hotelDomain === 'com.br' ? 'com.br' : hotelDomain}/habbo-imaging/avatarimage?user=${encodeURIComponent(post.userName)}&size=m&direction=2&head_direction=2&gesture=std&action=std`
                        : getAvatarFallbackUrl(post.userName, "m");
                      target.src = fallbackUrl;
                    }}
                  />
                </div>
                {/* Conteúdo à direita */}
                <div className="flex-1 min-w-0">
                  {/* Header: nome clicável + bandeira + botão deletar (se dono) */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToProfile?.(post.userName, hotelDomain);
                      }}
                      className="text-sm font-semibold text-white hover:underline truncate"
                    >
                      {post.userName}
                    </button>
                    <div className="flex items-center gap-2">
                      {/* Bandeira do país */}
                      <div className="flex items-center justify-center">
                        <img
                          src={getHotelFlag(post.hotel)}
                          alt={post.hotel || 'br'}
                          className="h-5 w-auto object-contain"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                      {/* Botão deletar (se dono) */}
                      {currentUserName && currentUserName.toLowerCase() === post.userName.toLowerCase() && onDeletePost && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePost(post.id);
                          }}
                          className="w-5 h-5 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                          title={t("pages.console.deletePost")}
                        >
                          <img
                            src="/assets/deletetrash.gif"
                            alt={t("pages.console.deletePost")}
                            className="max-w-full max-h-full object-contain"
                            style={{ imageRendering: "pixelated" }}
                            onMouseOver={(e) => {
                              e.currentTarget.src = "/assets/deletetrash1.gif";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.src = "/assets/deletetrash.gif";
                            }}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Texto do post */}
                  <p className="text-sm text-white/90 break-words whitespace-pre-wrap mb-2">
                    {post.text}
                  </p>
                  {/* Ações: Like e Comentários com Data */}
                  <div className="flex items-center justify-between gap-4 mt-2">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLikePost?.(post.id);
                        }}
                        className={cn(
                          "flex items-center gap-1 text-white/60 hover:text-white transition-colors",
                          post.userLiked && "text-red-400 hover:text-red-300"
                        )}
                      >
                        <Heart className={cn("w-4 h-4", post.userLiked && "fill-current")} />
                        <span className="text-sm">{post.likesCount || 0}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComments(post.id);
                        }}
                        className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{post.commentsCount || 0}</span>
                      </button>
                    </div>
                    {/* Data */}
                    <p className="text-xs text-white/50">
                      {new Date(post.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {/* Comentários expandidos */}
                  {expandedComments.has(post.id) && (
                    <div className="mt-4 pt-3 border-t border-dashed border-white/20">
                      <h3 className="text-sm font-semibold text-white mb-3">
                        {t("pages.console.comments")} ({post.commentsCount || 0})
                      </h3>
                      {/* Lista de comentários */}
                      {post.comments && post.comments.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {post.comments
                            .slice(-3)
                            .reverse()
                            .map((comment) => {
                              const commentHotelDomain =
                                (comment.hotel || hotel) === "br"
                                  ? "com.br"
                                  : (comment.hotel || hotel) === "tr"
                                  ? "com.tr"
                                  : comment.hotel || "com.br";
                              const commentAvatarUrl = getAvatarHeadUrl(
                                comment.userName,
                                comment.hotel || hotel,
                                comment.figureString,
                                "s"
                              );
                              return (
                                <div key={comment.id} className="flex items-start gap-3">
                                  <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded">
                                    <img
                                      src={getAvatarHeadUrl(
                                        comment.userName,
                                        comment.hotel || hotel,
                                        comment.figureString,
                                        "m"
                                      )}
                                      alt={comment.userName}
                                      className="w-full h-full object-cover"
                                      style={{ imageRendering: "pixelated" }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = getAvatarFallbackUrl(comment.userName, "m");
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onNavigateToProfile?.(comment.userName, commentHotelDomain);
                                          }}
                                          className="text-sm font-semibold text-white hover:underline truncate"
                                        >
                                          {comment.userName}
                                        </button>
                                        <span className="text-xs text-white/50">
                                          {new Date(comment.createdAt).toLocaleDateString("pt-BR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </div>
                                      {/* Botão deletar comentário (autor OU dono do post) */}
                                      {onDeleteComment && currentUserName && (
                                        (currentUserName.toLowerCase() === comment.userName.toLowerCase() ||
                                          currentUserName.toLowerCase() === post.userName.toLowerCase()) && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onDeleteComment(post.id, comment.id);
                                            }}
                                            className="w-5 h-5 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
                                            title={t("pages.console.deleteComment")}
                                          >
                                            <img
                                              src="/assets/deletetrash.gif"
                                              alt={t("pages.console.deleteComment")}
                                              className="max-w-full max-h-full object-contain"
                                              style={{ imageRendering: "pixelated" }}
                                              onMouseOver={(e) => {
                                                e.currentTarget.src = "/assets/deletetrash1.gif";
                                              }}
                                              onMouseOut={(e) => {
                                                e.currentTarget.src = "/assets/deletetrash.gif";
                                              }}
                                            />
                                          </button>
                                        )
                                      )}
                                    </div>
                                    <p className="text-sm text-white/90 break-words whitespace-pre-wrap">
                                      {comment.text}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          {post.commentsCount && post.commentsCount > 3 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewPost?.(post);
                              }}
                              className="text-sm text-white/60 hover:text-white transition-colors mt-2"
                            >
                              Ver todos os {post.commentsCount} comentários
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-white/60 text-sm py-6 mb-4">
                          {t("pages.console.noCommentsYet")}
                        </div>
                      )}
                      {/* Campo de comentário */}
                      {habboAccount && onAddComment && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const text = commentTexts[post.id]?.trim();
                            if (text) {
                              const validation = validateComment(text);
                              if (!validation.isValid) {
                                toast.error(validation.error || "Erro ao validar comentário");
                                return;
                              }
                              const sanitized = sanitizeComment(text);
                              onAddComment(post.id, sanitized);
                              setCommentTexts((prev) => ({ ...prev, [post.id]: "" }));
                            }
                          }}
                          className="flex flex-col gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded">
                              <img
                                src={
                                  habboAccount?.habbo_name
                                    ? getAvatarHeadUrl(
                                        habboAccount.habbo_name,
                                        habboAccount.hotel || "br",
                                        habboAccount.figure_string,
                                        "m"
                                      )
                                    : getAvatarHeadUrl("", "br", "hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-", "m")
                                }
                                alt={habboAccount.habbo_name}
                                className="w-full h-full object-cover"
                                style={{ imageRendering: "pixelated" }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = getAvatarFallbackUrl(habboAccount?.habbo_name || "", "m");
                                }}
                              />
                            </div>
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                placeholder={t("pages.console.addComment")}
                                maxLength={POST_CONFIG.MAX_LENGTH}
                                value={commentTexts[post.id] || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Limitar a 300 caracteres
                                  if (value.length <= POST_CONFIG.MAX_LENGTH) {
                                    setCommentTexts((prev) => ({ ...prev, [post.id]: value }));
                                  }
                                }}
                                className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 text-sm disabled:opacity-50"
                                disabled={false}
                              />
                              {(commentTexts[post.id]?.trim() || "") && (
                                <button
                                  type="submit"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 transition-all"
                                  title={t("pages.console.sendComment")}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M22 2L11 13" />
                                    <path d="M22 2l-7 20-4-9-9-4z" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                          {/* Contador de caracteres - exibe apenas após 100 caracteres */}
                          {(commentTexts[post.id]?.length || 0) >= 100 && (
                            <div className="flex justify-end mt-1 ml-14">
                              <span
                                className={cn(
                                  "text-xs",
                                  (commentTexts[post.id]?.length || 0) > POST_CONFIG.MAX_LENGTH * 0.9
                                    ? "text-red-400"
                                    : (commentTexts[post.id]?.length || 0) > POST_CONFIG.MAX_LENGTH * 0.7
                                    ? "text-yellow-400"
                                    : "text-white/50"
                                )}
                              >
                                {commentTexts[post.id]?.length || 0}/{POST_CONFIG.MAX_LENGTH}
                              </span>
                            </div>
                          )}
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
