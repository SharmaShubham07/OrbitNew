import { createServer } from "http";
import next from "next";
import { Server, Socket } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store online users: userId -> Set of socket IDs
const onlineUsers = new Map<string, Set<string>>();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Make io available globally if needed by server actions
  (global as any).io = io;

  io.on("connection", (socket: Socket) => {
    let currentUserId: string | null = null;

    // User authentication / identification
    socket.on("authenticate", (userId: string) => {
      if (!userId) return;
      currentUserId = userId;
      socket.join(`user_${userId}`);

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId)!.add(socket.id);

      // Broadcast online status to everyone
      io.emit("user_status_change", {
        userId,
        status: "online",
        onlineUserIds: Array.from(onlineUsers.keys()),
      });

      // Send initial list of online users to this socket
      socket.emit("online_users_list", Array.from(onlineUsers.keys()));
    });

    // Join conversation room
    socket.on("join_conversation", (conversationId: string) => {
      if (conversationId) {
        socket.join(`conversation_${conversationId}`);
      }
    });

    // Leave conversation room
    socket.on("leave_conversation", (conversationId: string) => {
      if (conversationId) {
        socket.leave(`conversation_${conversationId}`);
      }
    });

    // Handle typing indicators
    socket.on("typing", ({ conversationId, userId, userName }: { conversationId: string; userId: string; userName: string }) => {
      socket.to(`conversation_${conversationId}`).emit("user_typing", {
        conversationId,
        userId,
        userName,
      });
    });

    socket.on("stop_typing", ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      socket.to(`conversation_${conversationId}`).emit("user_stop_typing", {
        conversationId,
        userId,
      });
    });

    // Handle real-time direct message broadcast
    socket.on("send_message", (data: { conversationId: string; message: any; recipientId: string }) => {
      const { conversationId, message, recipientId } = data;
      // Emit to conversation room (for open chats)
      io.to(`conversation_${conversationId}`).emit("new_message", {
        conversationId,
        message,
      });

      // Also emit to recipient's personal user room (for unread badges / toast notifications)
      if (recipientId) {
        io.to(`user_${recipientId}`).emit("direct_message_received", {
          conversationId,
          message,
        });
      }
    });

    // Handle real-time notification broadcast
    socket.on("send_notification", (data: { recipientId: string; notification: any }) => {
      const { recipientId, notification } = data;
      if (recipientId) {
        io.to(`user_${recipientId}`).emit("new_notification", notification);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      if (currentUserId && onlineUsers.has(currentUserId)) {
        const userSockets = onlineUsers.get(currentUserId)!;
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(currentUserId);
          io.emit("user_status_change", {
            userId: currentUserId,
            status: "offline",
            onlineUserIds: Array.from(onlineUsers.keys()),
          });
        }
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> 🪐 Orbit Server ready on http://${hostname}:${port}`);
    console.log(`> ⚡ Socket.IO real-time engine attached`);
  });
});
