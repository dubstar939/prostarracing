import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket) return;
    this.socket = io();
    
    this.socket.on("connect", () => {
      console.log("Connected to server");
    });
  }

  joinRoom(roomId: string, playerInfo: any) {
    this.socket?.emit("join-room", roomId, playerInfo);
  }

  setReady(roomId: string) {
    this.socket?.emit("player-ready", roomId);
  }

  onStartCountdown(callback: () => void) {
    this.socket?.on("start-countdown", callback);
  }

  updateState(roomId: string, state: any) {
    this.socket?.emit("update-state", roomId, state);
  }

  onRoomUpdate(callback: (players: any) => void) {
    this.socket?.on("room-update", callback);
  }

  onPlayerMoved(callback: (player: any) => void) {
    this.socket?.on("player-moved", callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  get id() {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();
