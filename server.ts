import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Allow embedding in iframes (e.g., Google Sites)
  app.use((req, res, next) => {
    res.removeHeader("X-Frame-Options");
    res.setHeader("Content-Security-Policy", "frame-ancestors *");
    next();
  });

  // Game state
  const rooms = new Map<string, any>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId, playerInfo) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { players: {} });
      }
      
      const room = rooms.get(roomId);
      room.players[socket.id] = {
        id: socket.id,
        ...playerInfo,
        z: 0,
        x: 0,
        speed: 0,
        lap: 1,
        ready: false
      };

      io.to(roomId).emit("room-update", room.players);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("player-ready", (roomId) => {
      const room = rooms.get(roomId);
      if (room && room.players[socket.id]) {
        room.players[socket.id].ready = true;
        io.to(roomId).emit("room-update", room.players);

        const allReady = Object.values(room.players).every((p: any) => p.ready);
        if (allReady && Object.keys(room.players).length > 0) {
          io.to(roomId).emit("start-countdown");
        }
      }
    });

    socket.on("update-state", (roomId, state) => {
      const room = rooms.get(roomId);
      if (room && room.players[socket.id]) {
        room.players[socket.id] = { ...room.players[socket.id], ...state };
        socket.to(roomId).emit("player-moved", room.players[socket.id]);
      }
    });

    socket.on("disconnecting", () => {
      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) {
          const room = rooms.get(roomId);
          if (room) {
            delete room.players[socket.id];
            io.to(roomId).emit("room-update", room.players);
          }
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
