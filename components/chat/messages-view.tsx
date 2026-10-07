"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSocket } from "@/components/providers/socket-provider";
import { formatTimeAgo } from "@/lib/utils";
import {
  Search,
  Send,
  Paperclip,
  Loader2,
  FileText,
  X,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function MessagesView({ currentUser }: { currentUser?: any }) {
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get("conversationId");

  const { socket, isUserOnline, resetUnreadMessages } = useSocket();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConvId);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [attachment, setAttachment] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (!activeConversationId && data.conversations?.length > 0) {
          setActiveConversationId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => {
    loadConversations();
    resetUnreadMessages();
  }, []);

  useEffect(() => {
    if (initialConvId) {
      setActiveConversationId(initialConvId);
    }
  }, [initialConvId]);

  // Load active conversation messages
  useEffect(() => {
    if (!activeConversationId) return;

    async function loadMessages() {
      setLoadingMsgs(true);
      try {
        const res = await fetch(`/api/messages?conversationId=${activeConversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
        if (socket) {
          socket.emit("join_conversation", activeConversationId);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoadingMsgs(false);
      }
    }

    loadMessages();
  }, [activeConversationId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherUserTyping]);

  // Socket listener for new messages & typing
  useEffect(() => {
    if (!socket || !activeConversationId) return;

    function onNewMessage(data: { conversationId: string; message: any }) {
      if (data.conversationId === activeConversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
      // Update snippet in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.conversationId
            ? { ...c, lastMessage: data.message, lastMessageAt: data.message.createdAt }
            : c
        )
      );
    }

    function onUserTyping(data: { conversationId: string; userId: string }) {
      if (data.conversationId === activeConversationId && data.userId !== currentUser?.id) {
        setOtherUserTyping(true);
      }
    }

    function onUserStopTyping(data: { conversationId: string; userId: string }) {
      if (data.conversationId === activeConversationId && data.userId !== currentUser?.id) {
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
  }, [socket, activeConversationId, currentUser?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (socket && activeConversationId) {
      socket.emit("typing", {
        conversationId: activeConversationId,
        userId: currentUser?.id,
        userName: currentUser?.name || "You",
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", {
          conversationId: activeConversationId,
          userId: currentUser?.id,
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
        setAttachment(data);
        toast.success("Attachment ready");
      } else {
        toast.error("Upload failed");
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

    const activeConv = conversations.find((c) => c.id === activeConversationId);
    const targetUserId = activeConv?.otherUser?.id;

    setSending(true);
    const payload = {
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
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setInputText("");
        setAttachment(null);

        if (socket) {
          socket.emit("send_message", {
            conversationId: activeConversationId,
            message: data.message,
            recipientId: targetUserId,
          });
          socket.emit("stop_typing", {
            conversationId: activeConversationId,
            userId: currentUser?.id,
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

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const otherUser = activeConv?.otherUser;
  const isOnline = otherUser?.id ? isUserOnline(otherUser.id) : false;

  const filteredConversations = conversations.filter(
    (c) =>
      c.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 max-w-6xl mx-auto py-6 px-4 flex gap-6 h-[calc(100vh-2rem)]">
      {/* Left List: Conversations */}
      <div className="w-full md:w-80 xl:w-96 flex flex-col rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-xl">
        {/* Header & Search */}
        <div className="p-4 border-b border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Direct Messages</span>
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold">
              Encrypted Orbit
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Conversation List Items */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {loadingConvs ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4 text-xs text-muted-foreground">
              No conversations found. Connect with peers on Orbit to chat!
            </div>
          ) : (
            filteredConversations.map((c) => {
              const active = c.id === activeConversationId;
              const online = isUserOnline(c.otherUser?.id);

              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl text-left transition-all",
                    active
                      ? "bg-cyan-500/15 border border-cyan-500/30 text-foreground"
                      : "hover:bg-white/[0.04] text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        c.otherUser?.image ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.otherUser?.username}`
                      }
                      alt={c.otherUser?.name}
                      className="w-11 h-11 rounded-full object-cover border border-white/10"
                    />
                    {online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background shadow-[0_0_8px_#10b981]" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-heading font-bold text-xs text-foreground truncate">
                        {c.otherUser?.name}
                      </span>
                      {c.lastMessage && (
                        <span className="text-[10px] text-muted-foreground">
                          {formatTimeAgo(c.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] truncate text-muted-foreground">
                      {c.lastMessage?.content || "Started a conversation"}
                    </p>
                  </div>

                  {c.unreadCount > 0 && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Chat Panel: Active Thread */}
      <div className="hidden md:flex flex-1 flex-col rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-xl">
        {activeConv ? (
          <>
            {/* Thread Header */}
            <div className="p-4 bg-background/80 border-b border-white/10 flex items-center justify-between">
              <Link
                href={`/in/${otherUser?.username}`}
                className="flex items-center gap-3 group"
              >
                <div className="relative">
                  <img
                    src={
                      otherUser?.image ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.username}`
                    }
                    alt={otherUser?.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                  />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background shadow-[0_0_8px_#10b981]" />
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-foreground group-hover:text-cyan-400 transition-colors">
                      {otherUser?.name}
                    </span>
                    {otherUser?.primaryDomain?.emoji && (
                      <span className="text-xs">{otherUser.primaryDomain.emoji}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {isOnline ? (
                      <span className="text-emerald-400 font-semibold">Online</span>
                    ) : (
                      "Offline"
                    )}{" "}
                    · {otherUser?.headline || `@${otherUser?.username}`}
                  </span>
                </div>
              </Link>

              <Link
                href={`/in/${otherUser?.username}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs text-cyan-300 font-medium border border-white/10 transition-colors"
              >
                <span>View Orbit Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Thread Message Stream */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
              {loadingMsgs ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xl mb-2">
                    🪐
                  </div>
                  <p className="font-heading font-semibold text-sm text-foreground">
                    Direct Orbit Channel
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Send high-signal messages, code snippets, and attachments.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === currentUser?.id;

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[75%] ${
                        isMe ? "self-end items-end" : "self-start items-start"
                      }`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
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
                                className="rounded-xl max-h-60 object-cover border border-white/10"
                              />
                            ) : (
                              <a
                                href={m.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 hover:bg-black/40 text-cyan-300 transition-colors"
                              >
                                <FileText className="w-4 h-4 flex-shrink-0" />
                                <span className="underline font-medium truncate">
                                  {m.fileName || "View Attachment"}
                                </span>
                              </a>
                            )}
                          </div>
                        )}
                        {m.content && <span>{m.content}</span>}
                      </div>
                      <span className="text-[10px] text-muted-foreground/70 mt-1 px-1">
                        {formatTimeAgo(m.createdAt)}
                      </span>
                    </div>
                  );
                })
              )}

              {otherUserTyping && (
                <div className="self-start flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/[0.05] text-xs text-cyan-400 border border-white/5">
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
              <div className="px-6 py-2 bg-cyan-500/10 border-t border-cyan-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-cyan-300">
                  <Paperclip className="w-4 h-4" />
                  <span>{attachment.name}</span>
                </div>
                <button
                  onClick={() => setAttachment(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Thread Input Composer */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-background/80 border-t border-white/10 flex items-center gap-3"
            >
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
                className="p-2.5 rounded-2xl text-muted-foreground hover:text-cyan-400 hover:bg-white/5 transition-colors"
                title="Attach file or image"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Paperclip className="w-5 h-5" />
                )}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Write your professional message..."
                className="flex-1 bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />

              <button
                type="submit"
                disabled={(!inputText.trim() && !attachment) || sending}
                className="p-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <h3 className="font-heading font-bold text-base text-foreground">
              Select a Conversation
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Choose an active peer connection from the left to start messaging in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
