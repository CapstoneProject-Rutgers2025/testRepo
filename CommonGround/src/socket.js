import { io } from 'socket.io-client';

const BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://testrepo-hkzu.onrender.com"
    : "http://localhost:3000";

const socket = io(BASE_URL, {
  transports: ['websocket', 'polling'], 
  withCredentials: true,    // Include credentials for CORS
});

export default socket;