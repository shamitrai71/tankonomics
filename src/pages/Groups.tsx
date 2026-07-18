/**
 * Groups — micro-communities of verified members.
 *
 * Restyled. All data wiring preserved verbatim:
 *   - useCollection groups
 *   - handleCreateGroup (creates with pending status, auto-joins creator)
 *   - Verification gate: must be connected to a verified company
 *   - Search + public/private filter
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  ArrowRight,
  Globe,
  Lock,
  X,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../App";
import { useCollection } from "../hooks/useFirestore";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";

export default function Groups() {
  const { user, profile, isAdmin } = useAuth();
  const { data: groups, loading } = useCollection<any>("groups");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "public" | "private">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    isPrivate: false,
    iconUrl: "",
    coverUrl: "",
  });

  // Admins always have full group-management rights. Other users must be
  // connected to a verified company to create or join a group.
  const canCreateGroup = isAdmin || !!profile?.companyId;

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canCreateGroup || !newGroup.name) return;

    setCreating(true);
    try {
      const groupData = {
        name: newGroup.name,
        description: newGroup.description,
        isPrivate: newGroup.isPrivate,
        iconUrl: newGroup.iconUrl,
        coverUrl: newGroup.coverUrl,
        creatorUid: user.uid,
        creatorName: profile?.displayName || user.displayName,
        admins: [],
        memberCount: 1,
        // Admin-created groups are auto-approved; member submissions await review.
        status: isAdmin ? "approved" : "pending",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "groups"), groupData);
      await setDoc(doc(db, "group_members", `${docRef.id}_${user.uid}`), {
        groupId: docRef.id,
        userUid: user.uid,
        role: "creator",
        joinedAt: serverTimestamp(),
      });

      setShowCreateModal(false);
      setNewGroup({ name: "", description: "", isPrivate: false, iconUrl: "", coverUrl: "" });
      alert(isAdmin
        ? "Group created and published."
        : "Group creation initiated. An administrator will review your request shortly.");
    } catch (err) {
      console.error("Error creating group:", err);
    } finally {
      setCreating(false);
    }
  };

  const filteredGroups = groups.filter((g) => {
    const isApproved = g.status === "approved";
    const isOwner = g.creatorUid === user?.uid;
    if (!isApproved && !isOwner) return false;

    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "public" && !g.isPrivate) ||
      (filterStatus === "private" && g.isPrivate);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Heading */}
        <header className="mb-10 md:mb-12 relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="relative">
            <div className="absolute -top-4 -left-4 right-0 h-24 bp-grid-paper opacity-50 pointer-events-none" />
            <div className="relative">
              <div className="eyebrow tabular text-accent inline-flex items-center gap-2 mb-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent soft-pulse" />
                COMMUNITY GROUPS
              </div>
              <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] text-text-heading leading-[0.98]">
                Specialist networks.
              </h1>
              <p className="text-text-body text-[15px] mt-3 max-w-xl">
                Focused networks for tank-storage specialists — join an existing one or propose a new group.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-text-heading text-bg-card px-5 py-3 rounded-xl text-[14px] font-medium hover:brightness-110 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" strokeWidth={1.75} />
            Create group
          </button>
        </header>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex bg-bg-card border border-border-main rounded-xl p-1 w-fit">
            {(["all", "public", "private"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-lg eyebrow tabular transition-all ${
                  filterStatus === status ? "bg-text-heading text-bg-card" : "text-text-body/55 hover:text-text-body"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/40" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Find a group…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-bg-card border border-border-main rounded-xl text-[14px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
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
        </div>

        {/* Group grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-bg-card border border-border-main rounded-2xl animate-pulse" />)}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-20 bg-bg-card border border-dashed border-border-main rounded-2xl">
            {filterStatus === "all" ? (
              <Users className="w-12 h-12 text-text-body/25 mx-auto mb-4" strokeWidth={1.5} />
            ) : filterStatus === "private" ? (
              <Lock className="w-12 h-12 text-text-body/25 mx-auto mb-4" strokeWidth={1.5} />
            ) : (
              <Globe className="w-12 h-12 text-text-body/25 mx-auto mb-4" strokeWidth={1.5} />
            )}
            <p className="eyebrow tabular text-text-body/55 mb-1">NO MATCH</p>
            <h3 className="font-display text-2xl text-text-heading mb-2">
              No {filterStatus !== "all" ? `${filterStatus} ` : ""}groups found
            </h3>
            <p className="text-text-body text-[14px]">Try adjusting your search or filter.</p>
            {(searchTerm || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-text-heading text-bg-card rounded-xl text-[13px] font-medium"
              >
                Reset filters
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <Link
                key={group.id}
                to={`/groups/${group.id}`}
                className="group bg-bg-card border border-border-main rounded-2xl hover:border-text-heading transition-all overflow-hidden flex flex-col"
              >
                {/* Cover */}
                <div className="h-28 bg-bg-main relative border-b border-border-main">
                  {group.coverUrl ? (
                    <img src={group.coverUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bp-grid-paper opacity-70" />
                  )}
                  <div className="absolute -bottom-5 left-5 w-12 h-12 bg-bg-card rounded-xl border border-border-main flex items-center justify-center overflow-hidden p-1.5 shadow-md">
                    {group.iconUrl ? (
                      <img src={group.iconUrl} className="w-full h-full object-contain" alt="" />
                    ) : (
                      <Users className="w-5 h-5 text-text-body/40" strokeWidth={1.5} />
                    )}
                  </div>
                </div>

                <div className="p-5 pt-7 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                    <h3 className="font-display text-lg text-text-heading leading-tight line-clamp-1 group-hover:text-accent transition-colors flex-1 min-w-0">
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {group.isPrivate ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded eyebrow tabular bg-bg-main border border-border-main text-text-body/60">
                          <Lock className="w-2.5 h-2.5" strokeWidth={2} />
                          Private
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded eyebrow tabular bg-accent/10 text-accent border border-accent/20">
                          <Globe className="w-2.5 h-2.5" strokeWidth={2} />
                          Public
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    {group.status === "pending" && (
                      <span className="eyebrow tabular px-1.5 py-0.5 rounded bg-rust/10 text-rust border border-rust/20">
                        Pending approval
                      </span>
                    )}
                    {group.creatorUid === user?.uid && (
                      <span className="eyebrow tabular px-1.5 py-0.5 rounded bg-text-heading text-bg-card">
                        Creator
                      </span>
                    )}
                  </div>

                  <p className="text-[13px] text-text-body line-clamp-2 mb-5 flex-1 leading-relaxed">
                    {group.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border-main">
                    <span className="eyebrow tabular text-text-body/55 flex items-center gap-1.5">
                      <Users className="w-3 h-3" strokeWidth={1.75} />
                      {group.memberCount || 1} {(group.memberCount || 1) === 1 ? "MEMBER" : "MEMBERS"}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-bg-main border border-border-main flex items-center justify-center text-text-body/50 group-hover:bg-text-heading group-hover:border-text-heading group-hover:text-bg-card group-hover:translate-x-0.5 transition-all">
                      <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="bg-bg-card border border-border-main rounded-2xl shadow-2xl w-full max-w-xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-5 border-b border-border-main flex items-baseline justify-between shrink-0">
                <div>
                  <p className="eyebrow tabular text-accent">NEW GROUP</p>
                  <h2 className="font-display text-2xl text-text-heading mt-1">Create a group</h2>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-body/60">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!canCreateGroup ? (
                <div className="p-6">
                  <div className="p-6 bg-rust/5 border border-rust/20 rounded-2xl flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-bg-card border border-border-main rounded-xl flex items-center justify-center mb-4 text-rust">
                      <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <p className="eyebrow tabular text-rust mb-2">COMPANY LINK REQUIRED</p>
                    <h3 className="font-display text-xl text-text-heading mb-3">Connect your profile to a verified company first</h3>
                    <p className="text-[13px] text-text-body leading-relaxed mb-5 max-w-sm">
                      To maintain the professional integrity of groups, you must be connected to a verified company before creating or joining one.
                    </p>
                    <Link
                      to="/profile"
                      className="inline-flex items-center gap-2 bg-text-heading text-bg-card px-5 py-3 rounded-xl text-[14px] font-medium hover:brightness-110 transition-all"
                    >
                      Update profile
                      <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateGroup} className="p-6 space-y-5 overflow-y-auto">
                  <label className="block">
                    <span className="eyebrow tabular text-text-body/60 mb-2 block">Group name</span>
                    <input
                      required
                      type="text"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      placeholder="e.g. European Terminal Managers"
                      className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[15px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                    />
                  </label>

                  <label className="block">
                    <span className="eyebrow tabular text-text-body/60 mb-2 block">Mission / description</span>
                    <textarea
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      placeholder="Define the purpose and rules of the group…"
                      className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl text-[14px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading h-24 resize-none transition-all"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="eyebrow tabular text-text-body/60 mb-2 block">Icon URL</span>
                      <div className="flex gap-2">
                        {newGroup.iconUrl && (
                          <div className="w-12 h-12 rounded-lg border border-border-main bg-bg-main shrink-0 overflow-hidden p-1">
                            <img src={newGroup.iconUrl} className="w-full h-full object-contain" alt="" />
                          </div>
                        )}
                        <input
                          type="text"
                          value={newGroup.iconUrl}
                          onChange={(e) => setNewGroup({ ...newGroup, iconUrl: e.target.value })}
                          placeholder="https://…"
                          className="flex-1 px-3 py-3 bg-bg-main border border-border-main rounded-xl text-[12px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="eyebrow tabular text-text-body/60 mb-2 block">Cover URL</span>
                      <div className="flex gap-2">
                        {newGroup.coverUrl && (
                          <div className="w-12 h-12 rounded-lg border border-border-main bg-bg-main shrink-0 overflow-hidden">
                            <img src={newGroup.coverUrl} className="w-full h-full object-cover" alt="" />
                          </div>
                        )}
                        <input
                          type="text"
                          value={newGroup.coverUrl}
                          onChange={(e) => setNewGroup({ ...newGroup, coverUrl: e.target.value })}
                          placeholder="https://…"
                          className="flex-1 px-3 py-3 bg-bg-main border border-border-main rounded-xl text-[12px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-bg-main rounded-xl border border-border-main">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-bg-card ${newGroup.isPrivate ? "bg-rust" : "bg-accent"}`}>
                        {newGroup.isPrivate ? <Lock className="w-4 h-4" strokeWidth={1.75} /> : <Globe className="w-4 h-4" strokeWidth={1.75} />}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-text-heading">{newGroup.isPrivate ? "Private network" : "Public network"}</p>
                        <p className="eyebrow tabular text-text-body/55 mt-0.5">{newGroup.isPrivate ? "Invited members only" : "Visible to all members"}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newGroup.isPrivate}
                        onChange={(e) => setNewGroup({ ...newGroup, isPrivate: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-border-main rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-bg-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-text-heading" />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={creating || !newGroup.name}
                    className="w-full py-3 bg-text-heading text-bg-card rounded-xl font-medium text-[14px] flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {creating ? (
                      <div className="w-4 h-4 border-2 border-bg-card border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" strokeWidth={1.75} />
                        Submit for review
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
