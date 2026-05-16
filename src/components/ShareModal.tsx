/**
 * ShareModal — share-this-post overlay.
 *
 * Restyled to the new design language. Same props, same URL generation logic.
 */

import { motion } from "framer-motion";
import { X as CloseIcon, Copy, Twitter, Linkedin, Facebook, Share2, Check, Link2 } from "lucide-react";
import { useState } from "react";

interface ShareModalProps {
  post: any;
  onClose: () => void;
  type?: "post" | "forum" | "group";
  groupId?: string;
}

export default function ShareModal({ post, onClose, type = "post", groupId }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    const origin = window.location.origin;
    if (type === "forum") return `${origin}/forums/${post.id}`;
    if (type === "group" && groupId) return `${origin}/groups/${groupId}?post=${post.id}`;
    return `${origin}/post/${post.id}`;
  };

  const shareUrl = getShareUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: "LinkedIn",
      icon: Linkedin,
      iconColor: "text-[#0077b5]",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      iconColor: "text-text-heading",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.content.substring(0, 100))}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      iconColor: "text-[#1877f2]",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        className="bg-bg-card border border-border-main rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-border-main flex items-baseline justify-between">
          <div>
            <p className="eyebrow tabular text-text-body/55 flex items-center gap-2">
              <Share2 className="w-3 h-3" strokeWidth={1.75} />
              Distribute
            </p>
            <h2 className="font-display text-xl text-text-heading mt-1">Share this post</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-body/60">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="eyebrow tabular text-text-body/55 mb-3">External platforms</p>
            <div className="grid grid-cols-3 gap-2">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 bg-bg-main border border-border-main rounded-xl hover:border-text-heading transition-all"
                >
                  <link.icon className={`w-5 h-5 ${link.iconColor}`} strokeWidth={1.75} />
                  <span className="eyebrow tabular text-text-body group-hover:text-text-heading">{link.name}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow tabular text-text-body/55 mb-2 flex items-center gap-2">
              <Link2 className="w-3 h-3" strokeWidth={1.75} />
              Direct link
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-bg-main border border-border-main rounded-xl px-4 py-2.5 text-[12px] font-mono tabular text-text-body/70 truncate select-all">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 bg-text-heading text-bg-card rounded-xl text-[12px] font-medium hover:brightness-110 transition-all flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
