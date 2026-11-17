/**
 * Surveys — short polls answered by members.
 *
 * Card: question, organiser (company or member), response count, your
 * status (Open / Answered) and the options. Results are shown once you have
 * answered, with your choice marked. Each vote is stored under the member's
 * account; the rules let only the voter and admins read it, and only totals
 * are shown. Surveys have no closing date yet, so every survey is Open.
 */

import { PageHeader } from "../components/PageHeader";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../App";
import { usePageCopy } from "../lib/pageCopy";
import { useCollection, createDocument, updateDocument } from "../hooks/useFirestore";
import { orderBy, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Users,
  TrendingUp,
  Plus,
  BarChart3,
  Search,
  X,
  Building2,
  User,
  Check,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "../lib/dialogs";

export default function Surveys() {
  const copy = usePageCopy("surveys");
  const location = useLocation();
  const [highlightId, setHighlightId] = useState<string | null>((location.state as any)?.highlightId || null);

  // Deep-link from global search: scroll the matched survey into view and
  // briefly ring-highlight it, then clear so it doesn't re-trigger on revisit.
  useEffect(() => {
    if (!highlightId) return;
    const el = document.getElementById(`survey-${highlightId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(() => setHighlightId(null), 2500);
    return () => clearTimeout(t);
  }, [highlightId]);

  const { user, isAdmin, isCompanyOwner, ownedCompanies } = useAuth();
  const { data: surveys, loading } = useCollection<any>("surveys", [orderBy("createdAt", "desc")]);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredSurveys = surveys.filter(
    (survey: any) =>
      !searchTerm ||
      survey.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.options?.some((o: any) => (o.text || "").toLowerCase().includes(searchTerm.toLowerCase())),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingOnId, setVotingOnId] = useState<string | null>(null);
  // The member's own answer per survey (one read per survey listed; the rules
  // allow a member to read only their own vote).
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!user || !surveys.length) return;
    let cancelled = false;
    const missing = surveys.filter((sv: any) => !(sv.id in myVotes));
    Promise.all(missing.map((sv: any) =>
      getDoc(doc(db, `surveys/${sv.id}/votes`, user.uid))
        .then((d) => [sv.id, d.exists() ? (d.data() as any).optionIndex : -1] as const)
        .catch(() => [sv.id, -1] as const)))
      .then((rows) => { if (!cancelled && rows.length) setMyVotes((prev) => ({ ...prev, ...Object.fromEntries(rows) })); });
    return () => { cancelled = true; };
  }, [user?.uid, surveys.map((sv: any) => sv.id).join(",")]);
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
        setMyVotes((prev) => ({ ...prev, [surveyId]: (voteDoc.data() as any).optionIndex }));
        toast("You have already answered this survey.");
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
      setMyVotes((prev) => ({ ...prev, [surveyId]: optionIndex }));
    } catch (err) {
      console.error("Vote failed:", err);
      toast("Your answer could not be saved. Please try again.", "error");
    } finally {
      setVotingOnId(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="page-frame py-6 md:py-8">
        {/* Heading */}
        <PageHeader title={copy.title} description={copy.subtitle}>
          {(isAdmin || isCompanyOwner) && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 rounded-xl text-[14px] font-medium hover:brightness-110 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" strokeWidth={1.75} />
              Create survey
            </button>
          )}
        </PageHeader>

        {/* Create modal */}
        <AnimatePresence>
          {isCreating && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreating(false)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.96, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 12 }} className="bg-bg-card border border-border-main rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
                <div className="px-6 py-5 border-b border-border-main flex items-baseline justify-between">
                  <div>
                    <h2 className="font-display text-xl text-text-heading">Create a survey</h2>
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
                      Publish survey
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative w-full sm:w-72 mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/40" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search surveys…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 bg-bg-card border border-border-main rounded-xl text-[13px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md hover:bg-bg-main flex items-center justify-center text-text-body/50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Surveys list */}
        <div className="space-y-4">
          {loading ? (
            [1, 2].map((i) => <div key={i} className="h-48 bg-bg-card border border-border-main rounded-xl animate-pulse" />)
          ) : surveys.length === 0 ? (
            <div className="bg-bg-card border border-dashed border-border-main rounded-xl py-10 text-center">
              <p className="text-[15px] font-medium text-text-heading">No surveys have been published yet.</p>
            </div>
          ) : filteredSurveys.length === 0 ? (
            <div className="bg-bg-card border border-dashed border-border-main rounded-xl py-10 text-center">
              <p className="text-[15px] font-medium text-text-heading">No surveys match “{searchTerm}”.</p>
              <button onClick={() => setSearchTerm("")} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-medium">Clear search</button>
            </div>
          ) : (
            filteredSurveys.map((survey: any) => {
              const total = survey.totalVotes || 0;
              const mine = myVotes[survey.id];
              const answered = mine !== undefined && mine >= 0;
              const isVoting = votingOnId === survey.id;
              return (
                <article
                  key={survey.id}
                  id={`survey-${survey.id}`}
                  className={`bg-bg-card border rounded-xl p-5 md:p-6 transition-all ${
                    highlightId === survey.id ? "border-accent ring-4 ring-accent/15" : "border-border-main"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap text-[12px] text-text-body">
                    <span className={`inline-flex px-2 py-0.5 rounded-full font-medium ${answered ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                      {answered ? "Answered" : "Open"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      {survey.companyName ? <Building2 className="w-3.5 h-3.5" strokeWidth={1.75} /> : <User className="w-3.5 h-3.5" strokeWidth={1.75} />}
                      {survey.companyName || "A member"}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" strokeWidth={1.75} />{total} {total === 1 ? "response" : "responses"}</span>
                  </div>
                  <h3 className="text-[18px] font-semibold text-text-heading mt-3 mb-4 leading-snug">{survey.question}</h3>

                  <div className="space-y-2" role={answered ? undefined : "group"} aria-label={answered ? undefined : "Choose an answer"}>
                    {survey.options.map((option: any, index: number) => {
                      const pct = total ? Math.round(((option.votes || 0) / total) * 100) : 0;
                      if (answered) {
                        const isMine = mine === index;
                        return (
                          <div key={index} className={`relative overflow-hidden rounded-lg border ${isMine ? "border-accent" : "border-border-main"}`}>
                            <div className={`absolute inset-y-0 left-0 ${isMine ? "bg-accent/15" : "bg-bg-main"}`} style={{ width: `${pct}%` }} />
                            <div className="relative px-4 py-2.5 flex items-center justify-between gap-3">
                              <span className="text-[14px] text-text-heading min-w-0 truncate inline-flex items-center gap-2">
                                {isMine && <Check className="w-4 h-4 text-accent shrink-0" strokeWidth={2.5} aria-label="Your answer" />}
                                {option.text}
                              </span>
                              <span className="text-[13px] font-medium text-text-heading tabular-nums shrink-0">{pct}%</span>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <button
                          key={index}
                          onClick={() => handleVote(survey.id, index)}
                          disabled={isVoting || !user}
                          className="w-full text-left px-4 py-2.5 rounded-lg border border-border-main text-[14px] text-text-heading hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-60"
                        >
                          {option.text}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[12px] text-text-body mt-4">
                    {answered ? "" : "Results are shown after you answer. "}Results are shown as totals. Your individual answer is not displayed to other members.
                  </p>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
