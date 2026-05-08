import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { useCollection, createDocument, updateDocument } from "../hooks/useFirestore";
import { orderBy, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { 
  BarChart3, 
  HelpCircle, 
  CheckCircle2, 
  Users,
  TrendingUp,
  Plus,
  BarChart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Surveys() {
  const { user, profile, isAdmin, isCompanyOwner, ownedCompanies } = useAuth();
  const { data: surveys, loading } = useCollection<any>("surveys", [orderBy("createdAt", "desc")]);
  const [isCreating, setIsCreating] = useState(false);
  const [newSurvey, setNewSurvey] = useState({
    question: "",
    options: [
      { text: "", votes: 0 },
      { text: "", votes: 0 }
    ],
    companyId: "",
    companyName: "",
    companyLogo: ""
  });

  useEffect(() => {
    if (isCreating && ownedCompanies.length === 1 && !newSurvey.companyId) {
      setNewSurvey(prev => ({
        ...prev,
        companyId: ownedCompanies[0].id,
        companyName: ownedCompanies[0].name,
        companyLogo: ownedCompanies[0].logo
      }));
    }
  }, [isCreating, ownedCompanies]);

  const handleCreateSurvey = async () => {
    if (!newSurvey.question.trim() || newSurvey.options.some(o => !o.text.trim())) return;
    await createDocument("surveys", {
      ...newSurvey,
      authorUid: user?.uid,
      totalVotes: 0,
      createdAt: serverTimestamp()
    });
    setNewSurvey({
      question: "",
      options: [
        { text: "", votes: 0 },
        { text: "", votes: 0 }
      ],
      companyId: "",
      companyName: "",
      companyLogo: ""
    });
    setIsCreating(false);
  };

  const handleVote = async (surveyId: string, optionIndex: number) => {
    if (!user) return;
    
    // Check if already voted
    const voteDoc = await getDoc(doc(db, `surveys/${surveyId}/votes`, user.uid));
    if (voteDoc.exists()) {
      alert("You have already participated in this pulse check.");
      return;
    }

    // Cast vote
    await setDoc(doc(db, `surveys/${surveyId}/votes`, user.uid), {
      optionIndex,
      voterUid: user.uid,
      createdAt: serverTimestamp()
    });

    // Update totals
    const surveyRef = doc(db, "surveys", surveyId);
    const surveySnap = await getDoc(surveyRef);
    if (surveySnap.exists()) {
      const data = surveySnap.data();
      const updatedOptions = [...data.options];
      updatedOptions[optionIndex].votes = (updatedOptions[optionIndex].votes || 0) + 1;
      await updateDocument("surveys", surveyId, {
        options: updatedOptions,
        totalVotes: (data.totalVotes || 0) + 1
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="text-slate-900" />
            Industry Pulse
          </h1>
          <p className="text-gray-500">Real-time surveys and data on market sentiment within the terminal industry.</p>
        </div>
        {(isAdmin || isCompanyOwner) && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 hover:translate-y-[-2px] transition-all"
          >
            <Plus className="w-4 h-4" /> Create Pulse Check
          </button>
        )}
      </div>

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Pulse Check</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 block">Survey Question</label>
                  <input 
                    type="text"
                    value={newSurvey.question}
                    onChange={(e) => setNewSurvey({...newSurvey, question: e.target.value})}
                    placeholder="What would you like to ask the industry?"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 block">Response Options</label>
                  {newSurvey.options.map((opt, i) => (
                    <input 
                      key={i}
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...newSurvey.options];
                        newOpts[i].text = e.target.value;
                        setNewSurvey({...newSurvey, options: newOpts});
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-medium"
                    />
                  ))}
                  {newSurvey.options.length < 5 && (
                    <button 
                      onClick={() => setNewSurvey({...newSurvey, options: [...newSurvey.options, { text: "", votes: 0 }]})}
                      className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-900 transition-colors"
                    >
                      + Add Option
                    </button>
                  )}
                </div>

                {ownedCompanies.length > 0 && (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 block">Post as Company</label>
                    <div className="flex flex-wrap gap-2">
                       {ownedCompanies.map(company => (
                         <button 
                            key={company.id}
                            onClick={() => setNewSurvey({...newSurvey, companyId: company.id, companyName: company.name, companyLogo: company.logo})}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-2 ${newSurvey.companyId === company.id ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-gray-500 border-gray-100"}`}
                         >
                            {company.name}
                         </button>
                       ))}
                       <button 
                          onClick={() => setNewSurvey({...newSurvey, companyId: "", companyName: "", companyLogo: ""})}
                          className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${!newSurvey.companyId ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-gray-500 border-gray-100"}`}
                       >
                          Individual
                       </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateSurvey}
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
                  >
                    Deploy Survey
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
             [1, 2].map(i => <div key={i} className="h-64 bg-white border border-gray-200 rounded-2xl animate-pulse"></div>)
        ) : surveys.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-20 text-center">
             <TrendingUp className="w-16 h-16 text-gray-200 mx-auto mb-4" />
             <h3 className="font-bold text-slate-900">No active pulse checks</h3>
             <p className="text-gray-500">Industry surveys will appear here shortly.</p>
          </div>
        ) : (
          surveys.map((survey: any) => (
            <motion.div 
              key={survey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Active Survey</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Users className="w-3 h-3" /> {survey.totalVotes || 0} Responses
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 leading-tight">
                    {survey.question}
                  </h3>
                  
                  <div className="space-y-3">
                    {survey.options.map((option: any, index: number) => {
                      const percentage = survey.totalVotes ? Math.round((option.votes || 0) / survey.totalVotes * 100) : 0;
                      return (
                        <button 
                          key={index}
                          onClick={() => handleVote(survey.id, index)}
                          className="w-full text-left relative group overflow-hidden"
                        >
                          <div className="relative z-10 px-4 py-3 border border-gray-200 rounded-xl group-hover:border-slate-900 transition-colors flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               <div className="w-6 h-6 border-2 border-gray-200 rounded-full flex items-center justify-center group-hover:border-slate-900 group-hover:bg-slate-900 transition-all">
                                 <div className="w-2 h-2 bg-white rounded-full scale-0 group-active:scale-100 transition-transform"></div>
                               </div>
                               <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{option.text}</span>
                             </div>
                             <span className="text-xs font-black text-slate-400 group-hover:text-slate-900 transition-colors">{percentage}%</span>
                          </div>
                          <div 
                            className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                            style={{ width: `${percentage}%`, zIndex: 0 }}
                          ></div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="w-full md:w-64 bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center border border-gray-100">
                   <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                      <BarChart className="w-8 h-8 text-slate-900" />
                   </div>
                   <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-tighter">Live Insight</h4>
                   <p className="text-xs text-gray-400 text-center font-medium">Trends indicate an increase in {survey.options[0]?.text.toLowerCase()} interest this quarter.</p>
                   <div className="mt-6 flex items-center gap-2">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="w-2 h-8 bg-slate-200 rounded-full overflow-hidden flex flex-col justify-end">
                         <div className="w-full bg-slate-900" style={{ height: `${i * 20 + 20}%` }}></div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-slate-900 opacity-[0.02] rounded-full"></div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
