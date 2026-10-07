"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { X, Send, Paperclip, Loader2, Image as ImageIcon, FileText, Minimize2 } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import { toast } from "sonner";

export function ChatSlideOver({ currentUserId }: { currentUserId?: string }) {
  const {
    socket,
    isChatSlideOverOpen,
    setIsChatSlideOverOpen,
    activeChatUser,
    activeConversationId,
    setActiveConversationId,
    isUserOnline,
  } = useSocket();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; name: string; type: string } | null>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [conversation, setConversation] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch or create conversation when activeChatUser or activeConversationId changes
  useEffect(() => {
    if (!isChatSlideOverOpen) return;

    async function initChat() {
      setLoading(true);
      try {
        let convId = activeConversationId;

        if (!convId && activeChatUser?.id) {
          const res = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetUserId: activeChatUser.id }),
          });

          if (res.ok) {
            const data = await res.json();
            convId = data.conversation.id;
            setConversation(data.conversation);
            setActiveConversationId(convId);
          } else {
            const err = await res.json();
            toast.error(err.error || "Cannot open chat");
            setIsChatSlideOverOpen(false);
            return;
          }
        }

        if (convId) {
          const msgRes = await fetch(`/api/messages?conversationId=${convId}`);
          if (msgRes.ok) {
            const data = await msgRes.json();
            setMessages(data.messages || []);
          }
          if (socket) {
            socket.emit("join_conversation", convId);
          }
        }
      } catch (err) {
        console.error("Chat init error:", err);
      } finally {
        setLoading(false);
      }
    }

    initChat();
  }, [isChatSlideOverOpen, activeChatUser, activeConversationId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  // Listen for socket events
  useEffect(() => {
    if (!socket || !activeConversationId) return;

    function onNewMessage(data: { conversationId: string; message: any }) {
      if (data.conversationId === activeConversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    }

    function onUserTyping(data: { conversationId: string; userId: string }) {
      if (data.conversationId === activeConversationId && data.userId !== currentUserId) {
        setOtherUserTyping(true);
      }
    }

    function onUserStopTyping(data: { conversationId: string; userId: string }) {
      if (data.conversationId === activeConversationId && data.userId !== currentUserId) {
        setOtherUserTyping(false);
      }
    }

    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onUserTyping);
    socket.on("user_stop_typing", onUserStopTyping);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onUserTyping);
      socket.off("user_stop_typing", onUserStopTyping);
    };
  }, [socket, activeConversationId, currentUserId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (socket && activeConversationId) {
      socket.emit("typing", {
        conversationId: activeConversationId,
        userId: currentUserId,
        userName: "You",
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", {
          conversationId: activeConversationId,
          userId: currentUserId,
        });
      }, 1500);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB limit");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAttachment({
          url: data.url,
          name: data.name,
          type: data.type,
        });
        toast.success("Attachment added");
      } else {
        const err = await res.json();
        toast.error(err.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachment) || !activeConversationId || sending) return;

    const targetUserId = activeChatUser?.id || conversation?.otherUser?.id;

    setSending(true);
    const messagePayload = {
      conversationId: activeConversationId,
      content: inputText.trim(),
      fileUrl: attachment?.url,
      fileName: attachment?.name,
      fileType: attachment?.type,
    };

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messagePayload),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setInputText("");
        setAttachment(null);

        // Emit via Socket.IO
        if (socket) {
          socket.emit("send_message", {
            conversationId: activeConversationId,
            message: data.message,
            recipientId: targetUserId,
          });
          socket.emit("stop_typing", {
            conversationId: activeConversationId,
            userId: currentUserId,
          });
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to send message");
      }
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!isChatSlideOverOpen) return null;

  const otherUser = activeChatUser || conversation?.otherUser;
  const isOnline = otherUser?.id ? isUserOnline(otherUser.id) : false;

  return (
    <div className="fixed bottom-0 right-4 md:right-8 w-full max-w-[360px] md:max-w-[400px] h-[520px] max-h-[85vh] rounded-t-3xl glass-dropdown flex flex-col z-50 shadow-2xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="p-4 bg-background/90 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={otherUser?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.username || "user"}`}
              alt={otherUser?.name || "User"}
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background shadow-[0_0_8px_#10b981]" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-heading font-semibold text-sm text-foreground truncate">
              {otherUser?.name || "Chat"}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              {isOnline ? (
                <span className="text-emerald-400 font-medium">Online</span>
              ) : (
                <span>Offline</span>
              )}
              {otherUser?.primaryDomain?.emoji && `· ${otherUser.primaryDomain.emoji}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsChatSlideOverOpen(false)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2">
              🪐
            </div>
            <p className="text-xs font-semibold text-foreground">Direct Orbit Line</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Connected peer! Send a message to start collaborating.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUserId;

            return (
              <div
                key={m.id}
                className={`flex flex-col max-w-[80%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-cyan-500/10"
                      : "bg-white/[0.07] text-foreground border border-white/5 rounded-bl-none"
                  }`}
                >
                  {m.fileUrl && (
                    <div className="mb-2">
                      {m.fileType === "IMAGE" ? (
                        <img
                          src={m.fileUrl}
                          alt="Attachment"
                          className="rounded-xl max-h-48 object-cover border border-white/10"
                        />
                      ) : (
                        <a
                          href={m.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 p-2 rounded-xl bg-black/20 hover:bg-black/30 text-cyan-300 transition-colors"
                        >
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate underline font-medium">{m.fileName || "View Document"}</span>
                        </a>
                      )}
                    </div>
                  )}
                  {m.content && <span>{m.content}</span>}
                </div>
                <span className="text-[9px] text-muted-foreground/70 mt-1 px-1">
                  {formatTimeAgo(m.createdAt)}
                </span>
              </div>
            );
          })
        )}

        {otherUserTyping && (
          <div className="self-start flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/[0.05] text-[11px] text-cyan-400 border border-white/5">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce delay-100">●</span>
            <span className="animate-bounce delay-200">●</span>
            <span className="text-muted-foreground ml-1">typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachment && (
        <div className="px-4 py-2 bg-cyan-500/10 border-t border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-cyan-300 truncate">
            <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{attachment.name}</span>
          </div>
          <button
            onClick={() => setAttachment(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Footer / Input */}
      <form onSubmit={handleSendMessage} className="p-3 bg-background/90 border-t border-white/10 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,application/pdf"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 rounded-xl text-muted-foreground hover:text-cyan-400 hover:bg-white/5 transition-colors"
          title="Attach file or image"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />

        <button
          type="submit"
          disabled={(!inputText.trim() && !attachment) || sending}
          className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-semibold transition-all active:scale-95"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
