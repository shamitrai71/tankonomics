import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../App";
import { useCollection, createDocument, updateDocument } from "../hooks/useFirestore";
import { where, orderBy, doc, getDoc, serverTimestamp, collection, onSnapshot, query, limit } from "firebase/firestore";
import { db } from "../firebase";
import { 
  Send, 
  Search, 
  User as UserIcon, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Settings,
  MoreVertical,
  Paperclip,
  Smile,
  ShieldCheck,
  Zap,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function Messages() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [participants, setParticipants] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);

  const { data: myChats, loading: loadingChats } = useCollection<any>("chats", [
    where("participants", "array-contains", user?.uid || ""),
    orderBy("lastMessageAt", "desc")
  ]);

  const { data: myConnections } = useCollection<any>("connections", [
    where("userIds", "array-contains", user?.uid || "")
  ]);

  const { data: chatUsers } = useCollection<any>("users", [
    where("uid", "in", myChats.length > 0 ? myChats.map(c => c.participants.find((p: string) => p !== user?.uid)).slice(0, 10).filter(Boolean) : ["none"])
  ]);

  useEffect(() => {
    if (chatId) {
      const fetchChat = async () => {
        const docRef = doc(db, "chats", chatId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const chatData: any = { id: docSnap.id, ...docSnap.data() };
          setActiveChat(chatData);
          
          // Fetch participant details
          const otherId = chatData.participants.find((p: string) => p !== user?.uid);
          if (otherId) {
            const pSnap = await getDoc(doc(db, "users", otherId));
            if (pSnap.exists()) {
              setParticipants([{ ...pSnap.data(), id: pSnap.id }]);
            }
          }
        }
      };
      fetchChat();

      // Listen for messages
      const msgsRef = collection(db, "chats", chatId, "messages");
      const q = query(msgsRef, orderBy("createdAt", "asc"), limit(100));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      });

      return () => unsubscribe();
    } else {
      setActiveChat(null);
      setMessages([]);
      setParticipants([]);
    }
  }, [chatId, user?.uid]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !user) return;

    try {
      const msgData = {
        senderId: user.uid,
        senderName: user.displayName,
        content: newMessage,
        type: "text",
        createdAt: serverTimestamp()
      };
      
      await createDocument(`chats/${chatId}/messages`, msgData);
      await updateDocument("chats", chatId, {
        lastMessage: newMessage,
        lastMessageAt: serverTimestamp()
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const otherUser = participants[0];

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-bg-main">
      {/* Sidebar - Chat List */}
      <div className={`w-full md:w-80 border-r border-border-main flex flex-col bg-bg-card transition-all ${chatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-border-main">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-black text-text-heading uppercase tracking-tighter">Secure Comms</h1>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 bg-bg-main border border-border-main rounded-xl text-text-body/30 hover:text-primary hover:border-primary/30 transition-all shadow-sm active:scale-95"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body/30" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-bg-main border border-border-main rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Pending Requests */}
          {myConnections.filter(c => c.status === "pending" && c.requesterId !== user?.uid).length > 0 && (
            <div className="p-4 border-b border-border-main bg-primary/5">
              <h3 className="text-[10px] font-black uppercase text-primary tracking-widest mb-4 flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5" /> Pending Requests
              </h3>
              <div className="space-y-3">
                {myConnections.filter(c => c.status === "pending" && c.requesterId !== user?.uid).map(req => (
                  <Link 
                    key={req.id} 
                    to={`/profile/${req.requesterId}`}
                    className="flex items-center justify-between p-2.5 bg-bg-card rounded-xl border border-primary/20 shadow-sm transition-all hover:border-primary"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-bg-main rounded-lg border border-border-main overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${req.requesterId}`} alt="" />
                      </div>
                      <span className="text-[10px] font-black text-text-heading">Review Applicant</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-primary" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {loadingChats ? (
            <div className="p-8 text-center text-xs font-bold text-text-body/40">Acquiring signal...</div>
          ) : myChats.length === 0 ? (
            <div className="p-12 text-center">
              <Zap className="w-12 h-12 text-border-main mx-auto mb-4" />
              <p className="text-xs font-black text-text-body/30 uppercase tracking-widest">No active channels</p>
            </div>
          ) : (
            <div className="divide-y divide-border-main/30">
              {myChats.map((chat) => {
                const isActive = chatId === chat.id;
                const otherUid = chat.participants.find((p: string) => p !== user?.uid);
                const otherUserInList = chatUsers.find(u => u.uid === otherUid);

                return (
                  <button 
                    key={chat.id}
                    onClick={() => navigate(`/messages/${chat.id}`)}
                    className={`w-full p-4 flex items-center gap-3 transition-all hover:bg-bg-main text-left relative ${isActive ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                  >
                    <div className="w-12 h-12 bg-bg-main rounded-2xl flex-shrink-0 border border-border-main overflow-hidden">
                      <img 
                        src={otherUserInList?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUid}`} 
                        className="w-full h-full object-cover" 
                        alt="" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-black text-text-heading truncate">
                           {otherUserInList?.displayName || `Member ${otherUid?.slice(0, 5)}`}
                        </p>
                        <span className="text-[8px] font-bold text-text-body/30 uppercase">{chat.lastMessageAt ? format(new Date(chat.lastMessageAt?.seconds ? chat.lastMessageAt.seconds * 1000 : chat.lastMessageAt), 'HH:mm') : ''}</span>
                      </div>
                      <p className="text-[10px] font-bold text-text-body/50 truncate leading-tight">
                        {chat.lastMessage || "Encrypted channel open..."}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-bg-main shadow-inner relative ${!chatId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!chatId ? (
          <div className="text-center p-8 max-w-sm">
            <div className="w-20 h-20 bg-bg-card border border-border-main rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-text-heading mb-3 uppercase tracking-tighter">Protocol Secure</h2>
            <p className="text-xs font-bold text-text-body/40 leading-relaxed uppercase tracking-widest">
              Please select a verified connection to establish a secure end-to-end communication channel.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-20 bg-bg-card border-b border-border-main flex items-center justify-between px-6 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/messages')} className="md:hidden p-2 text-text-body/40">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 bg-bg-main rounded-xl border border-border-main overflow-hidden">
                   <img src={otherUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUser?.displayName}`} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                   <h2 className="text-sm font-black text-text-heading leading-none mb-1">{otherUser?.displayName || "Loading..."}</h2>
                   <div className="flex items-center gap-1.5 overflow-hidden">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[8px] font-black uppercase text-text-body/40 tracking-widest">Encrypted Direct Link</span>
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-2 relative">
                 <button 
                  onClick={() => setShowChatOptions(!showChatOptions)}
                  className={`p-2.5 rounded-xl transition-all ${showChatOptions ? 'bg-primary text-white shadow-lg' : 'text-text-body/30 hover:bg-bg-main hover:text-primary'}`}
                 >
                    <MoreVertical className="w-5 h-5" />
                 </button>

                 <AnimatePresence>
                   {showChatOptions && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-bg-card border border-border-main rounded-2xl shadow-2xl z-50 p-2"
                     >
                        <button className="w-full text-left p-3 rounded-xl hover:bg-bg-main text-xs font-bold text-text-heading flex items-center gap-2 transition-colors">
                           <UserIcon className="w-4 h-4 text-slate-400" /> View Profile
                        </button>
                        <button className="w-full text-left p-3 rounded-xl hover:bg-bg-main text-xs font-bold text-red-500 flex items-center gap-2 transition-colors">
                           <X className="w-4 h-4" /> Block User
                        </button>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="flex flex-col items-center mb-8">
                 <div className="px-4 py-1 bg-bg-card border border-border-main rounded-full shadow-sm">
                    <span className="text-[8px] font-black text-text-body/30 uppercase tracking-widest">Historical Logs Synthesized</span>
                 </div>
              </div>

              {messages.map((msg, i) => {
                const isMine = msg.senderId === user?.uid;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                       <div className={`px-4 py-3 rounded-2xl text-xs font-bold shadow-sm border ${
                         isMine 
                           ? 'bg-primary text-white border-primary/20 rounded-tr-none' 
                           : 'bg-bg-card text-text-heading border-border-main rounded-tl-none'
                       }`}>
                          {msg.content}
                       </div>
                       <span className="text-[7px] font-black text-text-body/30 uppercase tracking-tighter mt-1">
                          {msg.createdAt && format(new Date(msg.createdAt.seconds ? msg.createdAt.seconds * 1000 : msg.createdAt), 'HH:mm')}
                       </span>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 bg-bg-card border-t border-border-main">
              <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                 <button type="button" className="p-2.5 text-text-body/30 hover:text-primary transition-colors">
                    <Paperclip className="w-5 h-5" />
                 </button>
                 <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your secure message..."
                      className="w-full bg-bg-main border border-border-main rounded-2xl px-5 py-3.5 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all pr-12"
                    />
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-text-body/20 hover:text-accent">
                       <Smile className="w-5 h-5" />
                    </button>
                 </div>
                 <button 
                   type="submit"
                   disabled={!newMessage.trim()}
                   className="p-3.5 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                 >
                    <Send className="w-5 h-5" />
                 </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-bg-card border border-border-main rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <h2 className="text-2xl font-black text-text-heading mb-2 uppercase tracking-tighter">Comms Protocol</h2>
                <p className="text-xs font-bold text-text-body/40 mb-8 uppercase tracking-widest">Adjust your encrypted link preferences.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-bg-main rounded-2xl border border-border-main">
                    <div>
                      <p className="text-sm font-black text-text-heading">Push Notifications</p>
                      <p className="text-[10px] font-bold text-text-body/40 uppercase tracking-tighter">Alerts for new messages</p>
                    </div>
                    <div className="w-10 h-6 bg-primary rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-bg-main rounded-2xl border border-border-main opacity-50">
                    <div>
                      <p className="text-sm font-black text-text-heading">Dark Comms Mode</p>
                      <p className="text-[10px] font-bold text-text-body/40 uppercase tracking-tighter">Requires Pro clearance</p>
                    </div>
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                </div>

                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full mt-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 transition-all"
                >
                  Confirm Config
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
