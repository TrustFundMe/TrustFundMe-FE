import { Client, StompSubscription, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Use gateway URL via proxy to avoid CORS, or environment variable
const BROKER_URL = process.env.NEXT_PUBLIC_WS_URL || '/api-backend/ws';

export type MessageHandler = (message: any) => void;

class WebSocketService {
    private client: Client;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private pendingSubscriptions: Array<{ topic: string, callback: MessageHandler }> = [];
    private isConnected: boolean = false;

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
            this.client.publish({
                destination: destination,
                body: JSON.stringify(body),
            });
        } else {
            console.error('WebSocket is not connected. Cannot send message to:', destination);
        }
    }
}

export const webSocketService = new WebSocketService();
