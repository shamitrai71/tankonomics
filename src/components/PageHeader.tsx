/**
 * PageHeader — the shared top of every main section: a title, one line of
 * description, and the section's main action(s) passed as children.
 */
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-[28px] font-semibold text-text-heading leading-tight">{title}</h1>
        {description && <p className="text-[15px] text-text-body mt-1.5 max-w-2xl">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3 shrink-0">{children}</div>}
    </header>
  );
}
