import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import type { MessageResponse } from '../types';

interface ChatContextType {
  sendMessage: (conversationId: number, content: string) => void;
  incomingMessage: MessageResponse | null;
  isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated, logout } = useAuth();
  const stompClientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingMessage, setIncomingMessage] = useState<MessageResponse | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Guard: avoid duplicate connections (React StrictMode mounts twice in dev)
    if (stompClientRef.current?.active) return;

    console.log('[Chat] Connecting to WebSocket...');

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      onConnect: () => {
        console.log('[Chat] ✅ Connected');
        setIsConnected(true);

        client.subscribe('/user/queue/messages', (frame) => {
          try {
            const message: MessageResponse = JSON.parse(frame.body);
            console.log('[Chat] 📨 Message received:', message);
            setIncomingMessage(message);
          } catch (e) {
            console.error('[Chat] Failed to parse message:', e);
          }
        });
      },

      onStompError: (frame) => {
        const errMsg = frame.headers['message'] ?? '';
        console.error('[Chat] ❌ STOMP error:', errMsg);

        // If the token is expired or the user doesn't exist → force logout
        if (
          errMsg.toLowerCase().includes('jwt expired') ||
          errMsg.toLowerCase().includes('user not found') ||
          errMsg.toLowerCase().includes('unauthorized')
        ) {
          console.warn('[Chat] Token invalid — logging out');
          logout();
          window.location.href = '/login';
        }

        setIsConnected(false);
      },

      onWebSocketError: (error) => {
        console.error('[Chat] ❌ WebSocket error:', error);
        setIsConnected(false);
      },

      onDisconnect: () => {
        console.log('[Chat] 🔌 Disconnected');
        setIsConnected(false);
      },

      // Retry every 5 seconds on unexpected drop
      reconnectDelay: 5000,

      // STOMP frame logging in dev only
      debug: (msg) => {
        if (import.meta.env.DEV && !msg.startsWith('>>>')) {
          console.log('[STOMP]', msg);
        }
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [isAuthenticated, token, logout]);

  const sendMessage = useCallback((conversationId: number, content: string) => {
    if (!stompClientRef.current?.connected) {
      console.error('[Chat] Cannot send — WebSocket not connected');
      return;
    }
    stompClientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ conversationId, content }),
    });
  }, []);

  return (
    <ChatContext.Provider value={{ sendMessage, incomingMessage, isConnected }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
