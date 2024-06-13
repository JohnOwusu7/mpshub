import io, { Socket } from 'socket.io-client';
import { API_CONFIG } from './Api/apiConfig';

const socket = io(API_CONFIG.socketUrl);

export const connectWebSocket = (): Socket => {
    return socket;
};
