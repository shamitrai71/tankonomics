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
  Building2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../App";
import { useCollection } from "../hooks/useFirestore";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  setDoc,
  doc
} from "firebase/firestore";
import { format } from "date-fns";

export default function Groups() {
  const { user, profile } = useAuth();
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
    coverUrl: ""
  });

  const isConnectedToCompany = !!profile?.companyId;

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isConnectedToCompany || !newGroup.name) return;

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
        status: "pending",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "groups"), groupData);
      
      // Auto-join as creator
      await setDoc(doc(db, "group_members", `${docRef.id}_${user.uid}`), {
        groupId: docRef.id,
        userUid: user.uid,
        role: "creator",
        joinedAt: serverTimestamp()
      });

      setShowCreateModal(false);
      setNewGroup({ name: "", description: "", isPrivate: false, iconUrl: "", coverUrl: "" });
      alert("Group creation initiated. An administrator will review your request shortly.");
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setCreating(false);
    }
  };
  
  const filteredGroups = groups.filter(g => {
    const isApproved = g.status === "approved";
    const isOwner = g.creatorUid === user?.uid;
    if (!isApproved && !isOwner) return false;

    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
      (filterStatus === "public" && !g.isPrivate) || 
      (filterStatus === "private" && g.isPrivate);
      
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
               <Users className="text-white w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Community Groups</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-xl">Collaborate with industry peers in specialized interest groups. High-integrity networks for tank storage professionals.</p>
        </div>

        <div className="flex flex-col gap-6 w-full md:w-auto">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            {(["all", "public", "private"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                  filterStatus === status 
                    ? "bg-slate-900 text-white shadow-lg" 
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Find a group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all w-full md:w-80 shadow-sm"
              />
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Group</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2.5rem]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGroups.map((group) => (
            <Link 
              key={group.id} 
              to={`/groups/${group.id}`}
              className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all overflow-hidden flex flex-col h-full"
            >
              <div className="h-32 bg-slate-100 relative">
                 {group.coverUrl ? (
                   <img src={group.coverUrl} className="w-full h-full object-cover" alt="" />
                 ) : (
                   <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />
                 )}
                 <div className="absolute -bottom-6 left-8 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-white overflow-hidden p-1">
                   {group.iconUrl ? (
                     <img src={group.iconUrl} className="w-full h-full object-contain" alt="" />
                   ) : (
                     <Users className="w-8 h-8 text-slate-300" />
                   )}
                 </div>
              </div>

              <div className="p-8 pt-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight line-clamp-1">{group.name}</h3>
                  <div className="flex items-center gap-2">
                    {group.status === "pending" && (
                      <div className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-amber-200">
                        Awaiting Approval
                      </div>
                    )}
                    {group.creatorUid === user?.uid && (
                      <div className="bg-slate-900 text-white px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-800">
                        Creator
                      </div>
                    )}
                    {group.isPrivate ? (
                      <Lock className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Globe className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6 flex-1">{group.description || "No description provided."}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                       <Users className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{group.memberCount || 1} Members</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filteredGroups.length === 0 && !loading && (
        <div className="text-center py-24 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
           {filterStatus === "all" ? <Users className="w-16 h-16 text-slate-200 mx-auto mb-6" /> : 
            filterStatus === "private" ? <Lock className="w-16 h-16 text-slate-200 mx-auto mb-6" /> : 
            <Globe className="w-16 h-16 text-slate-200 mx-auto mb-6" />}
           <p className="text-xl font-black text-slate-400 uppercase tracking-tighter">
             No {filterStatus !== "all" ? `${filterStatus} ` : ""}groups found matching your search
           </p>
           {(searchTerm || filterStatus !== "all") && (
             <button 
               onClick={() => { setSearchTerm(""); setFilterStatus("all"); }}
               className="mt-6 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline"
             >
               Clear all filters
             </button>
           )}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl relative"
            >
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-1">Create a Group</h2>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Build your professional micro-community</p>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {!isConnectedToCompany ? (
                <div className="p-10">
                  <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-6">
                      <ShieldCheck className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-black text-amber-900 uppercase tracking-tight mb-4">Identity Verification Required</h3>
                    <p className="text-sm text-amber-700 font-medium leading-relaxed mb-8">To maintain the professional integrity of groups, you must be connected to a verified company to create or join groups.</p>
                    <Link 
                      to="/profile" 
                      className="inline-flex items-center gap-2 bg-amber-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg"
                    >
                      Update Profile
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateGroup} className="p-10 space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Group Professional Name</label>
                      <input 
                        required
                        type="text" 
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                        placeholder="e.g. European Terminal Managers"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Group Mission / Description</label>
                      <textarea 
                        value={newGroup.description}
                        onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                        placeholder="Define the purpose and rules of the group..."
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium h-24 resize-none placeholder:text-slate-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Icon Asset URL</label>
                        <div className="flex gap-2">
                           {newGroup.iconUrl && (
                             <div className="w-14 h-14 rounded-xl border border-slate-100 flex-shrink-0 overflow-hidden bg-slate-50">
                               <img src={newGroup.iconUrl} className="w-full h-full object-contain" alt="" />
                             </div>
                           )}
                           <input 
                            type="text" 
                            value={newGroup.iconUrl}
                            onChange={(e) => setNewGroup({...newGroup, iconUrl: e.target.value})}
                            placeholder="https://..."
                            className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold placeholder:text-slate-300 text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Cover Asset URL</label>
                        <div className="flex gap-2">
                           {newGroup.coverUrl && (
                             <div className="w-14 h-14 rounded-xl border border-slate-100 flex-shrink-0 overflow-hidden bg-slate-50">
                               <img src={newGroup.coverUrl} className="w-full h-full object-cover" alt="" />
                             </div>
                           )}
                           <input 
                            type="text" 
                            value={newGroup.coverUrl}
                            onChange={(e) => setNewGroup({...newGroup, coverUrl: e.target.value})}
                            placeholder="https://..."
                            className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold placeholder:text-slate-300 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${newGroup.isPrivate ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'}`}>
                          {newGroup.isPrivate ? <Lock className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-tight text-slate-900">{newGroup.isPrivate ? "Private Network" : "Public Network"}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{newGroup.isPrivate ? "Invited members only" : "Visible to all members"}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newGroup.isPrivate}
                          onChange={(e) => setNewGroup({...newGroup, isPrivate: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={creating || !newGroup.name}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {creating ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Initialize Group
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
