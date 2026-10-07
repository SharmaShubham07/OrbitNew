"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUserIds: string[];
  isUserOnline: (userId: string) => boolean;
  activeChatUserId: string | null;
  setActiveChatUserId: (userId: string | null) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  isChatSlideOverOpen: boolean;
  setIsChatSlideOverOpen: (open: boolean) => void;
  openChatWithUser: (user: any) => void;
  activeChatUser: any | null;
  unreadMessageCount: number;
  incrementUnreadMessages: () => void;
  resetUnreadMessages: () => void;
  unreadNotificationCount: number;
  setUnreadNotificationCount: React.Dispatch<React.SetStateAction<number>>;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({
  children,
  currentUserId,
}: {
  children: ReactNode;
  currentUserId?: string | null;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<any | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isChatSlideOverOpen, setIsChatSlideOverOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    function onConnect() {
      setIsConnected(true);
      if (currentUserId) {
        s.emit("authenticate", currentUserId);
      }
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onOnlineUsersList(users: string[]) {
      setOnlineUserIds(users);
    }

    function onUserStatusChange(data: { userId: string; status: string; onlineUserIds: string[] }) {
      if (data.onlineUserIds) {
        setOnlineUserIds(data.onlineUserIds);
      }
    }

    function onNewNotification(notification: any) {
      setUnreadNotificationCount((prev) => prev + 1);
      toast.info(notification.title || "New Notification", {
        description: notification.message,
      });
    }

    function onDirectMessageReceived(data: { conversationId: string; message: any }) {
      // If we are not currently viewing this conversation, bump unread & show toast
      if (activeConversationId !== data.conversationId) {
        setUnreadMessageCount((prev) => prev + 1);
        toast(data.message.sender?.name || "New Message", {
          description: data.message.content || "Sent an attachment",
          action: {
            label: "Reply",
            onClick: () => {
              setActiveConversationId(data.conversationId);
              setIsChatSlideOverOpen(true);
            },
          },
        });
      }
    }

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("online_users_list", onOnlineUsersList);
    s.on("user_status_change", onUserStatusChange);
    s.on("new_notification", onNewNotification);
    s.on("direct_message_received", onDirectMessageReceived);

    if (s.connected && currentUserId) {
      s.emit("authenticate", currentUserId);
      setIsConnected(true);
    }

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("online_users_list", onOnlineUsersList);
      s.off("user_status_change", onUserStatusChange);
      s.off("new_notification", onNewNotification);
      s.off("direct_message_received", onDirectMessageReceived);
    };
  }, [currentUserId, activeConversationId]);

  const isUserOnline = (userId: string) => onlineUserIds.includes(userId);

  const openChatWithUser = (user: any) => {
    setActiveChatUser(user);
    setActiveChatUserId(user.id);
    setIsChatSlideOverOpen(true);
  };

  const incrementUnreadMessages = () => setUnreadMessageCount((prev) => prev + 1);
  const resetUnreadMessages = () => setUnreadMessageCount(0);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUserIds,
        isUserOnline,
        activeChatUserId,
        setActiveChatUserId,
        activeConversationId,
        setActiveConversationId,
        isChatSlideOverOpen,
        setIsChatSlideOverOpen,
        openChatWithUser,
        activeChatUser,
        unreadMessageCount,
        incrementUnreadMessages,
        resetUnreadMessages,
        unreadNotificationCount,
        setUnreadNotificationCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
