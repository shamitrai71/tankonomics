/**
 * Messages — secure direct communication between connected members.
 *
 * Restyled. All data wiring preserved verbatim:
 *   - useCollection chats, connections, chatUsers
 *   - useEffect with onSnapshot listener for live message stream
 *   - handleSendMessage with createDocument + updateDocument
 *   - Pending connection requests panel
 */

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
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Settings,
  MoreVertical,
  Paperclip,
  Smile,
  ShieldCheck,
  X,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function Messages() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [participants, setParticipants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);

  const { data: myChats, loading: loadingChats } = useCollection<any>("chats", [
    where("participants", "array-contains", user?.uid || ""),
    orderBy("lastMessageAt", "desc"),
  ]);

  const { data: myConnections } = useCollection<any>("connections", [
    where("userIds", "array-contains", user?.uid || ""),
  ]);

  const { data: chatUsers } = useCollection<any>("users", [
    where(
      "uid",
      "in",
      myChats.length > 0
        ? myChats.map((c) => c.participants.find((p: string) => p !== user?.uid)).slice(0, 10).filter(Boolean)
        : ["none"],
    ),
  ]);

  useEffect(() => {
    if (chatId) {
      const fetchChat = async () => {
        const docRef = doc(db, "chats", chatId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const chatData: any = { id: docSnap.id, ...docSnap.data() };
          setActiveChat(chatData);
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

      const msgsRef = collection(db, "chats", chatId, "messages");
      const q = query(msgsRef, orderBy("createdAt", "asc"), limit(100));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
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
      await createDocument(`chats/${chatId}/messages`, {
        senderId: user.uid,
        senderName: user.displayName,
        content: newMessage,
        type: "text",
        createdAt: serverTimestamp(),
      });
      await updateDocument("chats", chatId, {
        lastMessage: newMessage,
        lastMessageAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const otherUser = participants[0];
  const filteredChats = searchTerm
    ? myChats.filter((chat) => {
        const otherUid = chat.participants.find((p: string) => p !== user?.uid);
        const otherUserInList = chatUsers.find((u) => u.uid === otherUid);
        return (
          otherUserInList?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : myChats;

  const pendingRequests = myConnections.filter((c) => c.status === "pending" && c.requesterId !== user?.uid);

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-bg-main">
      {/* Sidebar — chat list */}
      <aside className={`w-full md:w-96 border-r border-border-main flex flex-col bg-bg-card transition-all ${chatId ? "hidden md:flex" : "flex"}`}>
        <div className="px-6 py-5 border-b border-border-main">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="eyebrow tabular text-text-body/55">Direct messages</p>
              <h1 className="font-display text-2xl text-text-heading mt-0.5">Inbox</h1>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="w-9 h-9 bg-bg-main border border-border-main rounded-xl text-text-body/60 hover:text-text-heading hover:border-text-heading transition-all flex items-center justify-center"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-body/40" strokeWidth={1.75} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations…"
              className="w-full bg-bg-main border border-border-main rounded-xl pl-9 pr-3 py-2.5 text-[13px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Pending requests */}
          {pendingRequests.length > 0 && (
            <div className="p-4 border-b border-border-main bg-accent/5">
              <p className="eyebrow tabular text-accent mb-3 flex items-center gap-2">
                <UserPlus className="w-3 h-3" strokeWidth={1.75} />
                {pendingRequests.length} pending {pendingRequests.length === 1 ? "request" : "requests"}
              </p>
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <Link
                    key={req.id}
                    to={`/profile/${req.requesterId}`}
                    className="flex items-center justify-between p-2.5 bg-bg-card border border-accent/20 rounded-xl hover:border-accent transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-bg-main rounded-lg border border-border-main overflow-hidden shrink-0">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${req.requesterId}`} alt="" className="w-full h-full" />
                      </div>
                      <span className="text-[12px] font-medium text-text-heading truncate">Review request</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-accent shrink-0" strokeWidth={1.75} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {loadingChats ? (
            <div className="p-8 text-center eyebrow tabular text-text-body/40 animate-pulse">LOADING CHANNELS…</div>
          ) : filteredChats.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-10 h-10 text-text-body/25 mx-auto mb-3" strokeWidth={1.5} />
              <p className="eyebrow tabular text-text-body/55 mb-1">NO CONVERSATIONS</p>
              <p className="text-[13px] text-text-body/65">
                {searchTerm ? "No results match your search." : "Connect with members to start messaging."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-main">
              {filteredChats.map((chat) => {
                const isActive = chatId === chat.id;
                const otherUid = chat.participants.find((p: string) => p !== user?.uid);
                const otherUserInList = chatUsers.find((u) => u.uid === otherUid);

                return (
                  <button
                    key={chat.id}
                    onClick={() => navigate(`/messages/${chat.id}`)}
                    className={`w-full p-4 flex items-center gap-3 transition-all text-left relative ${
                      isActive ? "bg-bg-main" : "hover:bg-bg-main"
                    }`}
                  >
                    {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r" />}
                    <div className="w-11 h-11 bg-bg-main rounded-xl border border-border-main overflow-hidden shrink-0">
                      <img
                        src={otherUserInList?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUid}`}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-[14px] font-medium text-text-heading truncate">
                          {otherUserInList?.displayName || `Member ${otherUid?.slice(0, 5)}`}
                        </p>
                        <span className="eyebrow tabular text-text-body/45 shrink-0">
                          {chat.lastMessageAt
                            ? format(
                                new Date(chat.lastMessageAt?.seconds ? chat.lastMessageAt.seconds * 1000 : chat.lastMessageAt),
                                "HH:mm",
                              )
                            : ""}
                        </span>
                      </div>
                      <p className="text-[12px] text-text-body/60 truncate">
                        {chat.lastMessage || "New conversation…"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <main className={`flex-1 flex flex-col bg-bg-main relative ${!chatId ? "hidden md:flex items-center justify-center" : "flex"}`}>
        {!chatId ? (
          <div className="text-center p-8 max-w-sm">
            <div className="w-16 h-16 bg-bg-card border border-border-main rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-7 h-7 text-text-heading" strokeWidth={1.75} />
            </div>
            <p className="eyebrow tabular text-accent mb-2">SECURE COMMS</p>
            <h2 className="font-display text-3xl text-text-heading mb-3">Select a conversation</h2>
            <p className="text-[14px] text-text-body leading-relaxed">
              Choose a connection from the inbox to open a direct, end-to-end channel.
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="h-20 bg-bg-card border-b border-border-main flex items-center justify-between px-6 z-10">
              <div className="flex items-center gap-4 min-w-0">
                <button onClick={() => navigate("/messages")} className="md:hidden p-2 text-text-body/60 hover:text-text-heading transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-11 h-11 bg-bg-main rounded-xl border border-border-main overflow-hidden shrink-0">
                  <img
                    src={otherUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUser?.displayName}`}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[15px] font-medium text-text-heading leading-tight truncate">{otherUser?.displayName || "Loading…"}</h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full soft-pulse" />
                    <span className="eyebrow tabular text-text-body/55">DIRECT CHANNEL</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={() => setShowChatOptions(!showChatOptions)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    showChatOptions ? "bg-text-heading text-bg-card" : "text-text-body/55 hover:text-text-heading hover:bg-bg-main"
                  }`}
                  aria-label="Chat options"
                >
                  <MoreVertical className="w-4 h-4" strokeWidth={1.75} />
                </button>
                <AnimatePresence>
                  {showChatOptions && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowChatOptions(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-bg-card border border-border-main rounded-xl shadow-xl z-30 overflow-hidden"
                      >
                        <Link
                          to={`/profile/${otherUser?.id}`}
                          onClick={() => setShowChatOptions(false)}
                          className="w-full text-left px-4 py-2.5 text-[13px] text-text-body hover:bg-bg-main hover:text-text-heading flex items-center gap-2 transition-all"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-text-body/55" strokeWidth={1.75} /> View profile
                        </Link>
                        <button className="w-full text-left px-4 py-2.5 text-[13px] text-rust hover:bg-rust/5 flex items-center gap-2 transition-all border-t border-border-main">
                          <X className="w-3.5 h-3.5" strokeWidth={1.75} /> Block user
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div className="flex flex-col items-center mb-6">
                <div className="px-3 py-1 bg-bg-card border border-border-main rounded-full">
                  <span className="eyebrow tabular text-text-body/45">CONVERSATION OPENED</span>
                </div>
              </div>

              {messages.map((msg) => {
                const isMine = msg.senderId === user?.uid;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                          isMine
                            ? "bg-text-heading text-bg-card rounded-tr-sm"
                            : "bg-bg-card text-text-body border border-border-main rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="eyebrow tabular text-text-body/40 mt-1 px-1">
                        {msg.createdAt && format(new Date(msg.createdAt.seconds ? msg.createdAt.seconds * 1000 : msg.createdAt), "HH:mm")}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Message composer */}
            <div className="px-6 py-4 bg-bg-card border-t border-border-main">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button type="button" className="w-10 h-10 text-text-body/40 hover:text-text-heading hover:bg-bg-main rounded-xl flex items-center justify-center transition-all">
                  <Paperclip className="w-4 h-4" strokeWidth={1.75} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Send a message…"
                    className="w-full bg-bg-main border border-border-main rounded-xl pl-4 pr-11 py-3 text-[14px] text-text-heading placeholder:text-text-body/40 outline-none focus:border-text-heading transition-all"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-body/40 hover:text-accent transition-colors">
                    <Smile className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-10 h-10 bg-text-heading text-bg-card rounded-xl flex items-center justify-center hover:brightness-110 disabled:opacity-40 transition-all"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </form>
            </div>
          </>
        )}
      </main>

      {/* Settings modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-md bg-bg-card border border-border-main rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-border-main flex items-baseline justify-between">
                <div>
                  <p className="eyebrow tabular text-text-body/55">Preferences</p>
                  <h2 className="font-display text-2xl text-text-heading mt-1">Inbox settings</h2>
                </div>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-body/60">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between p-4 bg-bg-main rounded-xl border border-border-main">
                  <div>
                    <p className="text-[14px] font-medium text-text-heading">Push notifications</p>
                    <p className="eyebrow tabular text-text-body/55 mt-0.5">Alerts for new messages</p>
                  </div>
                  <div className="w-11 h-6 bg-text-heading rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-bg-card rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-bg-main rounded-xl border border-border-main opacity-50">
                  <div>
                    <p className="text-[14px] font-medium text-text-heading">Read receipts</p>
                    <p className="eyebrow tabular text-text-body/55 mt-0.5">Pro feature</p>
                  </div>
                  <span className="eyebrow tabular text-accent">Pro</span>
                </div>
              </div>
              <div className="p-4 border-t border-border-main">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-2.5 bg-text-heading text-bg-card rounded-xl font-medium text-[14px] hover:brightness-110 transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
