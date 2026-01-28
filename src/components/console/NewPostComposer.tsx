import React, { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { PenLine } from "lucide-react";

interface NewPostComposerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export const NewPostComposer: React.FC<NewPostComposerProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { t } = useI18n();
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText("");
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Header - mesmo design do CommentsModal */}
      <div
        className="bg-yellow-400 border-2 border-black border-b-0 rounded-t-lg relative overflow-hidden flex-shrink-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "8px 8px",
        }}
      >
        <div className="pixel-pattern absolute inset-0 opacity-20"></div>
        <div className="p-2 relative z-10 flex items-center justify-between">
          <div
            className="flex items-center gap-2 text-white font-bold text-xs"
            style={{
              textShadow:
                "2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000",
            }}
          >
            <PenLine className="w-4 h-4 text-white flex-shrink-0" />
            <span>{t("pages.console.newPost")}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded p-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Conteúdo - textarea e botão */}
      <div
        className="bg-gray-900 relative flex flex-col flex-1 border-2 border-t-0 border-black rounded-b-lg"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)",
          backgroundSize: "100% 2px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="relative z-10 p-3 flex flex-col gap-3"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("pages.console.newPostPlaceholder")}
            maxLength={2000}
            rows={4}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 text-sm resize-none disabled:opacity-50"
            disabled={false}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("pages.console.publish")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
