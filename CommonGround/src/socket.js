import { io } from 'socket.io-client';

const BASE_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_RENDER_URL || "https://testrepo-hkzu.onrender.com"
    : import.meta.env.VITE_LOCAL_URL || "http://localhost:3000";

const socket = io(BASE_URL, {
  transports: ['websocket'], // Force WebSocket transport
  withCredentials: true,    // Include credentials for CORS
});

export default socket;