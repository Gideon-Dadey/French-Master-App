import io from 'socket.io-client';
import { Platform } from 'react-native';

const getSocketUrl = () => {
    const PRODUCTION_SOCKET_URL = 'https://api.frenchmastergh.com';
    const DEVELOPMENT_SOCKET_URL = 'http://192.168.190.80:5001';

    if (__DEV__) {
        if (Platform.OS === 'ios') {
            return 'http://localhost:5001';
        }
        return DEVELOPMENT_SOCKET_URL;
    }
    return PRODUCTION_SOCKET_URL;
};

const SOCKET_URL = getSocketUrl();

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                transports: ['websocket'],
                reconnection: true,
            });

            this.socket.on('connect', () => {
                console.log('Connected to socket server');
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from socket server');
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinGroup(groupId) {
        if (this.socket) {
            this.socket.emit('join_group', groupId);
        }
    }

    leaveGroup(groupId) {
        if (this.socket) {
            this.socket.emit('leave_group', groupId);
        }
    }

    emitTyping(groupId, userName) {
        if (this.socket) {
            this.socket.emit('typing', { groupId, userName });
        }
    }

    // Call Signaling
    emitCall(groupId, callerName, type = 'voice') {
        if (this.socket) {
            this.socket.emit('call_user', { groupId, callerName, type });
        }
    }

    emitAcceptCall(to, accepterName) {
        if (this.socket) {
            this.socket.emit('accept_call', { to, accepterName });
        }
    }

    emitRejectCall(to) {
        if (this.socket) {
            this.socket.emit('reject_call', { to });
        }
    }

    onIncomingCall(callback) {
        if (this.socket) {
            this.socket.on('incoming_call', callback);
        }
    }

    onCallAccepted(callback) {
        if (this.socket) {
            this.socket.on('call_accepted', callback);
        }
    }

    onCallRejected(callback) {
        if (this.socket) {
            this.socket.on('call_rejected', callback);
        }
    }

    onNewMessage(callback) {
        if (this.socket) {
            this.socket.on('new_message', callback);
        }
    }

    onUserTyping(callback) {
        if (this.socket) {
            this.socket.on('user_typing', callback);
        }
    }

    removeListener(eventName) {
        if (this.socket) {
            this.socket.off(eventName);
        }
    }
}

const socketService = new SocketService();
export default socketService;
