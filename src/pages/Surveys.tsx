/**
 * Surveys — industry pulse checks.
 *
 * Restyled. All data wiring preserved verbatim:
 *   - useCollection surveys
 *   - handleCreateSurvey (creates with empty votes)
 *   - handleVote (writes vote subdoc + updates totals)
 *   - Company posting context preserved
 */

import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { useCollection, createDocument, updateDocument } from "../hooks/useFirestore";
import { orderBy, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Users,
  TrendingUp,
  Plus,
  BarChart3,
  Building2,
  User,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Surveys() {
  const { user, isAdmin, isCompanyOwner, ownedCompanies } = useAuth();
  const { data: surveys, loading } = useCollection<any>("surveys", [orderBy("createdAt", "desc")]);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingOnId, setVotingOnId] = useState<string | null>(null);
  const [newSurvey, setNewSurvey] = useState({
    question: "",
    options: [
      { text: "", votes: 0 },
      { text: "", votes: 0 },
    ],
    companyId: "",
    companyName: "",
    companyLogo: "",
  });

  useEffect(() => {
    if (isCreating && ownedCompanies.length === 1 && !newSurvey.companyId) {
      setNewSurvey((prev) => ({
        ...prev,
        companyId: ownedCompanies[0].id,
        companyName: ownedCompanies[0].name,
        companyLogo: ownedCompanies[0].logo,
      }));
    }
  }, [isCreating, ownedCompanies]);

  const handleCreateSurvey = async () => {
    if (!newSurvey.question.trim() || newSurvey.options.some((o) => !o.text.trim()) || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createDocument("surveys", {
        ...newSurvey,
        authorUid: user?.uid,
        totalVotes: 0,
        createdAt: serverTimestamp(),
      });
      setNewSurvey({
        question: "",
        options: [
          { text: "", votes: 0 },
          { text: "", votes: 0 },
        ],
        companyId: "",
        companyName: "",
        companyLogo: "",
      });
      setIsCreating(false);
    } catch (err) {
      console.error("Survey create failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (surveyId: string, optionIndex: number) => {
    if (!user || votingOnId) return;
    setVotingOnId(surveyId);
    try {
      const voteDoc = await getDoc(doc(db, `surveys/${surveyId}/votes`, user.uid));
      if (voteDoc.exists()) {
        alert("You have already participated in this pulse check.");
        return;
      }
      await setDoc(doc(db, `surveys/${surveyId}/votes`, user.uid), {
        optionIndex,
        voterUid: user.uid,
        createdAt: serverTimestamp(),
      });
      const surveyRef = doc(db, "surveys", surveyId);
      const surveySnap = await getDoc(surveyRef);
      if (surveySnap.exists()) {
        const data = surveySnap.data();
        const updatedOptions = [...data.options];
        updatedOptions[optionIndex].votes = (updatedOptions[optionIndex].votes || 0) + 1;
        await updateDocument("surveys", surveyId, {
          options: updatedOptions,
          totalVotes: (data.totalVotes || 0) + 1,
        });
      }
    } catch (err) {
      console.error("Vote failed:", err);
    } finally {
      setVotingOnId(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-5xl mx-auto py-8 md:py-12 px-4 md:px-6">
        {/* Heading */}
        <header className="mb-10 md:mb-12 relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="relative">
            <div className="absolute -top-4 -left-4 right-0 h-24 bp-grid-paper opacity-50 pointer-events-none" />
            <div className="relative">
              <div className="eyebrow tabular text-accent inline-flex items-center gap-2 mb-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
                INDUSTRY PULSE
              </div>
              <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] text-text-heading leading-[0.98]">
                Pulse checks on the market.
              </h1>
              <p className="text-text-body text-[15px] mt-3 max-w-xl">
                Real-time surveys and sentiment data from the global tank &amp; terminal community.
              </p>
            </div>
          </div>
          {(isAdmin || isCompanyOwner) && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center justify-center gap-2 bg-text-heading text-bg-card px-5 py-3 rounded-xl text-[14px] font-medium hover:brightness-110 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" strokeWidth={1.75} />
              Create pulse check
            </button>
          )}
        </header>

        {/* Create modal */}
        <AnimatePresence>
          {isCreating && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreating(false)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.96, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 12 }} className="bg-bg-card border border-border-main rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
                <div className="px-6 py-5 border-b border-border-main flex items-baseline justify-between">
                  <div>
                    <p className="eyebrow tabular text-accent">NEW PULSE CHECK</p>
                    <h2 className="font-display text-2xl text-text-heading mt-1">Ask the industry</h2>
                  </div>
                  <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-body/60">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <label className="block">
                    <span className="eyebrow tabular text-text-body/60 mb-2 block">Survey question</span>
                    <input
                      type="text"
                      value={newSurvey.question}
                      onChange={(e) => setNewSurvey({ ...newSurvey, question: e.target.value })}
                      placeholder="What would you like to ask the industry?"
                      className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[15px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                    />
                  </label>

                  <div>
                    <span className="eyebrow tabular text-text-body/60 mb-2 block">Response options</span>
                    <div className="space-y-2">
                      {newSurvey.options.map((opt, i) => (
                        <input
                          key={i}
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = [...newSurvey.options];
                            newOpts[i].text = e.target.value;
                            setNewSurvey({ ...newSurvey, options: newOpts });
                          }}
                          placeholder={`Option ${i + 1}`}
                          className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                        />
                      ))}
                    </div>
                    {newSurvey.options.length < 5 && (
                      <button
                        onClick={() => setNewSurvey({ ...newSurvey, options: [...newSurvey.options, { text: "", votes: 0 }] })}
                        className="mt-2 inline-flex items-center gap-1.5 eyebrow tabular text-text-body/55 hover:text-accent transition-colors"
                      >
                        <Plus className="w-3 h-3" strokeWidth={1.75} />
                        Add option
                      </button>
                    )}
                  </div>

                  {ownedCompanies.length > 0 && (
                    <div>
                      <span className="eyebrow tabular text-text-body/60 mb-2 block">Post as</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setNewSurvey({ ...newSurvey, companyId: "", companyName: "", companyLogo: "" })}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium border transition-all ${
                            !newSurvey.companyId
                              ? "bg-text-heading text-bg-card border-text-heading"
                              : "bg-bg-main border-border-main text-text-body hover:border-text-heading"
                          }`}
                        >
                          <User className="w-3.5 h-3.5" strokeWidth={1.75} />
                          Individual
                        </button>
                        {ownedCompanies.map((company) => (
                          <button
                            key={company.id}
                            onClick={() => setNewSurvey({ ...newSurvey, companyId: company.id, companyName: company.name, companyLogo: company.logo })}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium border transition-all ${
                              newSurvey.companyId === company.id
                                ? "bg-text-heading text-bg-card border-text-heading"
                                : "bg-bg-main border-border-main text-text-body hover:border-text-heading"
                            }`}
                          >
                            {company.logo ? (
                              <img src={company.logo} className="w-3.5 h-3.5 rounded object-contain" alt="" />
                            ) : (
                              <Building2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                            )}
                            {company.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2 border-t border-border-main">
                    <button onClick={() => setIsCreating(false)} className="flex-1 py-2.5 text-[13px] text-text-body hover:text-text-heading">
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateSurvey}
                      disabled={!newSurvey.question.trim() || newSurvey.options.some((o) => !o.text.trim()) || isSubmitting}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-text-heading text-bg-card py-2.5 rounded-xl text-[14px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={2.5} />}
                      Deploy survey
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Surveys list */}
        <div className="space-y-4">
          {loading ? (
            [1, 2].map((i) => <div key={i} className="h-64 bg-bg-card border border-border-main rounded-2xl animate-pulse" />)
          ) : surveys.length === 0 ? (
            <div className="bg-bg-card border border-dashed border-border-main rounded-2xl py-20 text-center">
              <TrendingUp className="w-12 h-12 text-text-body/25 mx-auto mb-4" strokeWidth={1.5} />
              <p className="eyebrow tabular text-text-body/55 mb-1">NO ACTIVE SURVEYS</p>
              <h3 className="font-display text-2xl text-text-heading mb-2">Pulse checks coming soon</h3>
              <p className="text-text-body text-[14px]">Industry surveys will appear here when administrators publish them.</p>
            </div>
          ) : (
            surveys.map((survey: any) => (
              <motion.div
                key={survey.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-card border border-border-main rounded-2xl overflow-hidden hover:border-text-heading transition-all"
              >
                <div className="grid grid-cols-1 md:grid-cols-[1fr_220px]">
                  {/* Main content */}
                  <div className="p-6 md:p-7">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded eyebrow tabular bg-accent/10 text-accent border border-accent/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
                        Active survey
                      </span>
                      <span className="eyebrow tabular text-text-body/55 flex items-center gap-1.5">
                        <Users className="w-3 h-3" strokeWidth={1.75} />
                        {survey.totalVotes || 0} {(survey.totalVotes || 0) === 1 ? "RESPONSE" : "RESPONSES"}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl text-text-heading mb-5 leading-tight">{survey.question}</h3>

                    <div className="space-y-2">
                      {survey.options.map((option: any, index: number) => {
                        const percentage = survey.totalVotes ? Math.round(((option.votes || 0) / survey.totalVotes) * 100) : 0;
                        const isVoting = votingOnId === survey.id;
                        return (
                          <button
                            key={index}
                            onClick={() => handleVote(survey.id, index)}
                            disabled={isVoting}
                            className="w-full text-left relative group/opt overflow-hidden disabled:opacity-70"
                          >
                            {/* Result bar background */}
                            <div
                              className="absolute inset-0 bg-bg-main rounded-xl transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                            {/* Content */}
                            <div className="relative px-4 py-3 border border-border-main rounded-xl group-hover/opt:border-text-heading transition-colors flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-5 h-5 border border-border-main rounded-full flex items-center justify-center group-hover/opt:border-accent transition-colors shrink-0">
                                  <span className="w-2 h-2 rounded-full bg-accent scale-0 group-hover/opt:scale-100 transition-transform" />
                                </span>
                                <span className="text-[14px] font-medium text-text-heading truncate">{option.text}</span>
                              </div>
                              <span className="eyebrow tabular text-text-body/65 group-hover/opt:text-text-heading transition-colors shrink-0">{percentage}%</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Side panel */}
                  <div className="bg-bg-main border-t md:border-t-0 md:border-l border-border-main p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-bg-card border border-border-main rounded-xl flex items-center justify-center text-text-heading mb-3">
                      <BarChart3 className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <p className="eyebrow tabular text-text-body/55 mb-1">Live insight</p>
                    {survey.options[0]?.text && (
                      <p className="text-[12px] text-text-body/75 leading-relaxed">
                        Trends suggest growing interest in <span className="text-text-heading font-medium">{survey.options[0].text.toLowerCase()}</span> this quarter.
                      </p>
                    )}
                    <div className="mt-4 flex items-end gap-1.5 h-12">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-1.5 bg-border-main rounded-full overflow-hidden flex flex-col justify-end" style={{ height: "100%" }}>
                          <div className="w-full bg-accent rounded-full" style={{ height: `${i * 18 + 25}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
