import { io } from "socket.io-client";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const SOCKET_URL = API_BASE_URL || "http://localhost:5000";

let socket = null;

// Connect to Socket.IO
export const connectSocket = () => {
    if (socket && socket.connected) return socket;

    socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        withCredentials: true
    });

    socket.on("connect", () => {
        console.log("🔌 Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
    });

    return socket;
};

export const getSocket = () => {
    if (!socket) return connectSocket();
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Listen for real-time queue updates
export const onQueueUpdate = (callback) => {
    const s = getSocket();
    s.on("queue:update", callback);
    return () => s.off("queue:update", callback);
};

// API: Join Queue
export const joinQueue = async (service, guestName, guestMobile, eventId, eventName) => {
    const response = await axios.post(`${API_BASE_URL}/api/queue/join`, {
        service,
        guestName,
        guestMobile,
        eventId,
        eventName
    });
    return response.data;
};

// API: Get my queue status
export const getQueueStatus = async (tokenNumber) => {
    const safeToken = encodeURIComponent(tokenNumber);
    const response = await axios.get(`${API_BASE_URL}/api/queue/status/${safeToken}`);
    return response.data;
};

// API: Get ML predictions
export const getMLPredictions = async (tokenNumber, service) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/ml/predict/waiting-time`, {
            tokenNumber,
            service
        });
        return response.data;
    } catch {
        return null;
    }
};
