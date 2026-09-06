import { Clock, ShieldAlert, LogOut } from "lucide-react";

/**
 * Full-page access gate shown in place of the entire app shell while a
 * signed-in user's account is "pending" or "rejected" — see
 * REQUIRE_APPROVAL_TO_VIEW in App.tsx for where this is wired in and how
 * to turn the whole gate off later.
 *
 * This is deliberately a *different* component from TierGate: TierGate
 * gates one action/composer inside an already-visible app (tier B/C
 * features); ApprovalGate gates the entire app shell itself (can this
 * account be here at all). Different question, different scope, so kept
 * as separate components rather than overloading TierGate with a third
 * mode.
 */
export function ApprovalGate({
  status,
  email,
  onSignOut,
}: {
  status: "pending" | "rejected";
  email?: string | null;
  onSignOut: () => void;
}) {
  const isPending = status === "pending";

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main px-4">
      <div className="max-w-md w-full text-center bg-bg-card border border-border-main rounded-2xl p-10 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-bg-main border border-border-main flex items-center justify-center mx-auto mb-4 text-accent">
          {isPending
            ? <Clock className="w-5 h-5" strokeWidth={1.75} />
            : <ShieldAlert className="w-5 h-5" strokeWidth={1.75} />}
        </div>
        <h1 className="font-display text-xl text-text-heading mb-2">
          {isPending ? "Awaiting approval" : "Access denied"}
        </h1>
        <p className="text-[13px] text-text-body/70 leading-relaxed mb-5">
          {isPending
            ? "You're signed in, but this account hasn't been approved yet. An admin needs to review it before you can see Tankonomics."
            : "This account's access request was not approved. If you think that's a mistake, contact the team directly."}
        </p>
        {email && (
          <div className="inline-block font-mono text-xs text-text-body bg-bg-main px-3 py-1.5 rounded-lg mb-5">
            {email}
          </div>
        )}
        {isPending && (
          <p className="text-[12px] text-text-body/55 mb-4">
            No need to keep checking — reopening the app after you've been
            approved will take you straight in.
          </p>
        )}
        <button
          onClick={onSignOut}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-text-body/70 hover:text-text-heading transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </div>
  );
}
