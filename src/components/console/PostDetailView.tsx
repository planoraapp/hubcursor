import React, { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { getAvatarHeadUrl, getAvatarFallbackUrl, getAvatarUrl } from "@/utils/avatarHelpers";
import { Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeedPost, PostComment } from "./FriendsPostsFeed";
import { useAuth } from "@/hooks/useAuth";
import { validateComment, sanitizeComment, POST_CONFIG } from "@/utils/postValidation";
import { toast } from "sonner";
import { getHotelFlag } from "@/utils/hotelHelpers";

// Função para formatar data de posts (sempre com hora completa na visualização individual)
const formatPostDate = (dateString: string | Date): string => {
  const postDate = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (!postDate || Number.isNaN(postDate.getTime())) {
    return dateString.toString();
  }

  return postDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface PostDetailViewProps {
  post: FeedPost;
  onBack: () => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onDeletePost?: (postId: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onNavigateToProfile?: (username: string, hotelDomain?: string, uniqueId?: string) => void;
}

export const PostDetailView: React.FC<PostDetailViewProps> = ({
  post,
  onBack,
  onLikePost,
  onAddComment,
  onDeletePost,
  onDeleteComment,
  onNavigateToProfile,
}) => {
  const { t } = useI18n();
  const { habboAccount } = useAuth();
  const [commentText, setCommentText] = useState("");
  const hotel = post.hotel || "br";
  const hotelDomain = hotel === "br" ? "com.br" : hotel === "tr" ? "com.tr" : hotel || "com.br";
  // Usar figurestring completa (não apenas cabeça)
  const avatarUrl = getAvatarUrl(
    post.userName,
    hotel,
    post.figureString,
    {
      size: 'm',
      direction: 2,
      headDirection: 2,
      gesture: 'std',
      action: 'std'
    }
  );

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && habboAccount) {
      const validation = validateComment(commentText);
      if (!validation.isValid) {
        toast.error(validation.error || "Erro ao validar comentário");
        return;
      }
      const sanitized = sanitizeComment(commentText);
      onAddComment(post.id, sanitized);
      setCommentText("");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Botão de voltar */}
      <div className="mb-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-lg border border-white/30 bg-transparent hover:bg-white hover:text-gray-800 transition-colors"
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
            className="w-3 h-3"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="truncate">Voltar</span>
        </button>
      </div>

      {/* Post */}
      <div className="mb-6 pb-4 border-b border-dashed border-white/20">
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
                  ? `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?user=${encodeURIComponent(post.userName)}&size=m&direction=2&head_direction=2&gesture=std&action=std`
                  : `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?user=${encodeURIComponent(post.userName)}&size=m&direction=2&head_direction=2&gesture=std&action=std`;
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
                onClick={() => onNavigateToProfile?.(post.userName, hotelDomain)}
                className="text-sm font-semibold text-white hover:underline truncate"
              >
                {post.userName}
              </button>
              <div className="flex items-center gap-2">
                {/* Bandeira do país - mantida na visualização individual */}
                <div className="flex items-center justify-center">
                  <img
                    src={getHotelFlag(hotel)}
                    alt={hotel}
                    className="h-5 w-auto object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                {/* Botão deletar (se dono) */}
                {habboAccount && habboAccount.habbo_name && habboAccount.habbo_name.toLowerCase() === post.userName.toLowerCase() && onDeletePost && (
                  <button
                    type="button"
                    onClick={() => {
                      onDeletePost(post.id);
                      onBack();
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
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onLikePost(post.id)}
                  className={cn(
                    "flex items-center gap-1 text-white/60 hover:text-white transition-colors",
                    post.userLiked && "text-red-400 hover:text-red-300"
                  )}
                >
                  <Heart className={cn("w-4 h-4", post.userLiked && "fill-current")} />
                  <span className="text-sm">{post.likesCount || 0}</span>
                </button>
                <div className="flex items-center gap-1 text-white/60">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{post.commentsCount || 0}</span>
                </div>
              </div>
              {/* Data - sempre com hora completa na visualização individual */}
              <p className="text-xs text-white/50">
                {formatPostDate(post.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comentários */}
      <div className="flex-1 min-h-0 flex flex-col">
        <h3 className="text-sm font-semibold text-white mb-3">
          {t("pages.console.comments")} ({post.commentsCount || 0})
        </h3>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 mb-4">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => {
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
                "m"
              );
              return (
                <div key={comment.id} className="flex items-start gap-3">
                  <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded">
                    <img
                      src={commentAvatarUrl}
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
                          onClick={() =>
                            onNavigateToProfile?.(comment.userName, commentHotelDomain)
                          }
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
                      {onDeleteComment && habboAccount && (
                        (habboAccount.username.toLowerCase() === comment.userName.toLowerCase() ||
                          habboAccount.username.toLowerCase() === post.userName.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => onDeleteComment(post.id, comment.id)}
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
            })
          ) : (
            <div className="text-center text-white/60 text-sm py-6">
              {t("pages.console.noCommentsYet")}
            </div>
          )}
        </div>

        {/* Campo de comentário */}
        {habboAccount && (
          <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
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
                value={commentText}
                onChange={(e) => {
                  const value = e.target.value;
                  // Limitar a 300 caracteres
                  if (value.length <= POST_CONFIG.MAX_LENGTH) {
                    setCommentText(value);
                  }
                }}
                className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 text-sm disabled:opacity-50"
                disabled={false}
              />
              {commentText.trim() && (
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
            {/* Contador de caracteres - exibe apenas após 100 caracteres */}
            {commentText.length >= 100 && (
              <div className="flex justify-end mt-1 ml-14">
                <span
                  className={cn(
                    "text-xs",
                    commentText.length > POST_CONFIG.MAX_LENGTH * 0.9
                      ? "text-red-400"
                      : commentText.length > POST_CONFIG.MAX_LENGTH * 0.7
                      ? "text-yellow-400"
                      : "text-white/50"
                  )}
                >
                  {commentText.length}/{POST_CONFIG.MAX_LENGTH}
                </span>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
