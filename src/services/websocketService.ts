import { Client, StompSubscription, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Priority order for WS URL:
// 1. NEXT_PUBLIC_WS_URL (Absolute override)
// 2. /ws (Relative proxy via Next.js - RECOMMENDED for local/prod)
// 3. NEXT_PUBLIC_BE_API_URL/ws (Absolute fallback)
const getWsUrl = () => {
    if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
    if (typeof window !== 'undefined') return '/ws';
    return (process.env.NEXT_PUBLIC_BE_API_URL || 'http://localhost:8080') + '/ws';
};

const RAW_WS_URL = getWsUrl();
const BROKER_URL = RAW_WS_URL.replace(/^ws:\/\/|^wss:\/\//, (match) => match === 'ws://' ? 'http://' : 'https://');

console.log('[WS] Initializing with URL:', BROKER_URL, '(Original:', RAW_WS_URL, ')');

export type MessageHandler = (message: any) => void;

class WebSocketService {
    private client: Client;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private pendingSubscriptions: Array<{ topic: string, callback: MessageHandler }> = [];
    private pendingMessages: Array<{ destination: string, body: any }> = [];
    public isConnected: boolean = false;

    constructor() {
        this.client = new Client({
            webSocketFactory: () => new SockJS(BROKER_URL),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                // Reduce noise in production
                // console.log('[WS Debug]:', str);
            },
        });

        this.client.onConnect = (frame: IFrame) => {
            console.log('Connected to WebSocket');
            this.isConnected = true;
            this.processPendingSubscriptions();
            this.processPendingMessages();
        };

        this.client.onDisconnect = () => {
            console.log('Disconnected from WebSocket');
            this.isConnected = false;
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.client.onWebSocketClose = () => {
            this.isConnected = false;
        };
    }

    connect() {
        if (!this.client.active) {
            this.client.activate();
        }
    }

    disconnect() {
        if (this.client.active) {
            this.client.deactivate();
        }
        this.isConnected = false;
    }

    subscribe(topic: string, callback: MessageHandler) {
        if (this.isConnected) {
            this.doSubscribe(topic, callback);
        } else {
            console.log('WebSocket not connected. Queuing subscription for:', topic);
            // Check if already in queue to avoid duplicates
            if (!this.pendingSubscriptions.some(sub => sub.topic === topic)) {
                this.pendingSubscriptions.push({ topic, callback });
            }
            // Ensure we are trying to connect
            this.connect();
        }
    }

    private doSubscribe(topic: string, callback: MessageHandler) {
        if (this.subscriptions.has(topic)) {
            return; // Already subscribed
        }

        try {
            const sub = this.client.subscribe(topic, (message) => {
                if (message.body) {
                    callback(JSON.parse(message.body));
                }
            });
            this.subscriptions.set(topic, sub);
        } catch (error) {
            console.error("Error subscribing to topic:", topic, error);
        }
    }

    private processPendingSubscriptions() {
        if (this.pendingSubscriptions.length > 0) {
            console.log(`Processing ${this.pendingSubscriptions.length} pending subscriptions...`);
            this.pendingSubscriptions.forEach(sub => {
                this.doSubscribe(sub.topic, sub.callback);
            });
            this.pendingSubscriptions = [];
        }
    }

    private processPendingMessages() {
        if (this.pendingMessages.length > 0) {
            console.log(`Processing ${this.pendingMessages.length} pending messages...`);
            this.pendingMessages.forEach(msg => {
                this.sendMessage(msg.destination, msg.body);
            });
            this.pendingMessages = [];
        }
    }

    unsubscribe(topic: string) {
        // Remove from active subscriptions
        const sub = this.subscriptions.get(topic);
        if (sub) {
            sub.unsubscribe();
            this.subscriptions.delete(topic);
        }

        // Remove from pending queue if exists
        this.pendingSubscriptions = this.pendingSubscriptions.filter(s => s.topic !== topic);
    }

    sendMessage(destination: string, body: any) {
        if (this.isConnected && this.client.active) {
            console.log(`[WS] Publishing message to ${destination}`, body);
            this.client.publish({
                destination: destination,
                body: JSON.stringify(body),
            });
        } else {
            console.log('[WS] Not connected. Queuing message for:', destination);
            this.pendingMessages.push({ destination, body });
            this.connect();
        }
    }
}

export const webSocketService = new WebSocketService();
