/**
 * SafeImage — an image that never shows a broken frame. When there is no
 * source, or the source fails to load, it draws a neutral placeholder of the
 * same size with an icon instead.
 */
import { useState, type ReactNode } from "react";
import { ImageOff } from "lucide-react";

export function SafeImage({
  src,
  alt = "",
  className = "",
  fallback,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  fallback?: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-bg-main text-text-body/40 ${className}`} aria-hidden="true">
        {fallback ?? <ImageOff className="w-6 h-6" strokeWidth={1.5} />}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
