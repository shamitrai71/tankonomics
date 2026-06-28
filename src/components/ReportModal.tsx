/**
 * ReportModal — flag-content overlay.
 *
 * Restyled. Same props, same Firestore write logic.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Flag, X as CloseIcon, AlertTriangle, Check, Loader2 } from "lucide-react";
import { useAuth } from "../App";
import { createDocument } from "../hooks/useFirestore";
import { serverTimestamp } from "firebase/firestore";

interface ReportModalProps {
  item: any;
  type: string;
  path: string;
  onClose: () => void;
}

export default function ReportModal({ item, type, path, onClose }: ReportModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReport = async () => {
    if (!reason.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createDocument("reports", {
        targetId: item.id || "unknown",
        targetType: type,
        targetPath: path,
        reason,
        reporterUid: user?.uid,
        reporterName: user?.displayName,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error("Report error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <p className="eyebrow tabular text-rust flex items-center gap-2">
              <Flag className="w-3 h-3" strokeWidth={1.75} />
              Flag content
            </p>
            <h2 className="font-display text-xl text-text-heading mt-1">Report this {type}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-body/60">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/20">
                <Check className="w-6 h-6" strokeWidth={2} />
              </div>
              <p className="eyebrow tabular text-accent mb-2">REPORT QUEUED</p>
              <h3 className="font-display text-2xl text-text-heading mb-2">Report received</h3>
              <p className="text-[14px] text-text-body">Our moderators will review this content shortly.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 bg-rust/5 border border-rust/20 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-rust shrink-0 mt-0.5" strokeWidth={1.75} />
                <p className="text-[13px] text-text-body leading-relaxed">
                  Reporting is for content that violates industry standards, includes harassment, spam, or is technically misleading.
                </p>
              </div>

              <label className="block">
                <span className="eyebrow tabular text-text-body/60 mb-2 block">Reason for reporting</span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this content should be reviewed…"
                  className="w-full bg-bg-main border border-border-main rounded-xl p-4 text-[14px] text-text-heading placeholder:text-text-body/40 focus:border-text-heading outline-none h-28 resize-none transition-all"
                />
              </label>

              <div className="flex gap-3 pt-2 border-t border-border-main">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 text-[13px] text-text-body hover:text-text-heading"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={!reason.trim() || isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-rust text-white py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" strokeWidth={1.75} />}
                  Submit report
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
