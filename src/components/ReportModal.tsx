import { useState } from "react";
import { motion } from "framer-motion";
import { Flag, X as CloseIcon, AlertTriangle, Check } from "lucide-react";
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
        reason: reason,
        reporterUid: user?.uid,
        reporterName: user?.displayName,
        status: "pending",
        createdAt: serverTimestamp()
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500" /> Report Content
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <CloseIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Report Received</h3>
              <p className="text-slate-500 text-sm">Thank you. Our moderators will review this content shortly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed font-medium">
                  Reporting is for content that violates industry standards, includes harassment, spam, or is technically misleading.
                </p>
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Reason for reporting</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this content should be reviewed..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:bg-white focus:ring-4 focus:ring-slate-100 outline-none h-32 resize-none transition-all font-medium"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border-2 border-slate-100 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReport}
                  disabled={!reason.trim() || isSubmitting}
                  className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
