import { ReactNode } from "react";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, FileText } from "lucide-react";

type RequiredTier = "B" | "C";

/**
 * Gates an action/composer behind a membership tier and *explains* the
 * requirement instead of letting the user hit a silent permission error.
 * Rules still enforce server-side; this is the guiding UI layer.
 *
 * - requiredTier="B": needs a verified member (email verified + Blueprint).
 * - requiredTier="C": needs company premium (approved-company owner + Pro).
 * Admins always pass.
 */
export function TierGate({
  requiredTier,
  children,
  compact = false,
}: {
  requiredTier: RequiredTier;
  children?: ReactNode;
  compact?: boolean;
}) {
  const { user, tier, hasBlueprint } = useAuth();
  const navigate = useNavigate();

  const rank = { A: 0, B: 1, C: 2, admin: 3 } as const;
  const need = requiredTier === "B" ? 1 : 2;
  if (rank[tier] >= need) return <>{children}</>;

  // Work out the most useful next step to show.
  const emailUnverified = user && !user.emailVerified;
  const needsBlueprint = user && user.emailVerified && !hasBlueprint;

  const box = (icon: ReactNode, title: string, body: string, cta?: { label: string; onClick: () => void }) => (
    <div className={`rounded-2xl border border-border-main bg-bg-main ${compact ? "p-4" : "p-6"} text-center`}>
      <div className="w-10 h-10 rounded-xl bg-bg-card border border-border-main flex items-center justify-center mx-auto mb-3 text-accent">
        {icon}
      </div>
      <p className="text-[14px] font-medium text-text-heading mb-1">{title}</p>
      <p className="text-[12px] text-text-body/70 leading-relaxed max-w-sm mx-auto">{body}</p>
      {cta && (
        <button
          onClick={cta.onClick}
          className="mt-3 inline-flex items-center gap-2 bg-text-heading text-bg-card px-4 py-2 rounded-xl text-[13px] font-medium hover:brightness-110 transition-all"
        >
          {cta.label}
        </button>
      )}
    </div>
  );

  if (requiredTier === "C") {
    return box(
      <Lock className="w-5 h-5" strokeWidth={1.75} />,
      "Company members only",
      "Creating this requires a verified company on Tankonomics. Claim your company to unlock company features."
    );
  }

  if (emailUnverified) {
    return box(
      <Mail className="w-5 h-5" strokeWidth={1.75} />,
      "Verify your email to participate",
      "Confirm your email address to post, comment, and join discussions across the network."
    );
  }

  if (needsBlueprint) {
    return box(
      <FileText className="w-5 h-5" strokeWidth={1.75} />,
      "Create your Blueprint to participate",
      "Members build a professional Blueprint before posting. It takes a couple of minutes and unlocks the full network.",
      { label: "Create my Blueprint", onClick: () => navigate("/create-resume") }
    );
  }

  return box(
    <Lock className="w-5 h-5" strokeWidth={1.75} />,
    "Members only",
    "Sign in and complete your membership to take part."
  );
}
