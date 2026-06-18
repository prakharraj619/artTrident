import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import type { MessageResponse } from '../types';

interface ChatContextType {
  // Function to send a message over WebSocket
  sendMessage: (conversationId: number, content: string) => void;
  // New messages arriving in real time (all components can listen to this)
  incomingMessage: MessageResponse | null;
  // Whether the WebSocket connection is live
  isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated } = useAuth();
  // useRef stores the STOMP client without causing re-renders when it changes
  const stompClientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingMessage, setIncomingMessage] = useState<MessageResponse | null>(null);

  useEffect(() => {
    // Only connect if the user is logged in and has a JWT token
    if (!isAuthenticated || !token) {
      // If they log out, disconnect and clean up
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    /**
     * 🎓 HOW THIS WORKS (React side):
     *
     * 1. We create a new STOMP Client pointing at our Spring Boot WebSocket endpoint (/ws)
     * 2. On connect, we SUBSCRIBE to our personal queue: /user/queue/messages
     *    - This is like saying "listen for any messages the server pushes specifically to me"
     *    - Spring Boot knows which user is "me" because of the JWT we pass in connectHeaders
     * 3. When the server calls messagingTemplate.convertAndSendToUser(email, "/queue/messages", msg),
     *    this subscription fires and gives us the new message in real time
     */
    const client = new Client({
      // SockJS is a fallback transport — it tries WebSocket first, then HTTP long-polling
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

      // Pass the JWT token during the STOMP CONNECT handshake
      // This is read by WebSocketConfig's ChannelInterceptor on the backend
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      // Called when the connection is established successfully
      onConnect: () => {
        console.log('[Chat] WebSocket connected ✅');
        setIsConnected(true);

        // Subscribe to our personal message queue
        // The /user prefix is resolved by Spring to /user/{our-email}/queue/messages
        client.subscribe('/user/queue/messages', (stompMessage) => {
          const message: MessageResponse = JSON.parse(stompMessage.body);
          console.log('[Chat] New message received:', message);
          // Setting this triggers any component using useChat() to re-render with the new message
          setIncomingMessage(message);
        });
      },

      onStompError: (frame) => {
        console.error('[Chat] STOMP error:', frame);
        setIsConnected(false);
      },

      onDisconnect: () => {
        console.log('[Chat] WebSocket disconnected');
        setIsConnected(false);
      },

      // Auto-reconnect every 5 seconds if disconnected
      reconnectDelay: 5000,
    });

    // Activate (connect) the client
    client.activate();
    stompClientRef.current = client;

    // Cleanup: disconnect when the component unmounts (e.g. user logs out)
    return () => {
      client.deactivate();
    };
  }, [isAuthenticated, token]); // Re-run if auth state changes

  /**
   * Send a message over the WebSocket connection.
   * This sends to /app/chat.send on the backend (handled by @MessageMapping("/chat.send")).
   */
  const sendMessage = useCallback((conversationId: number, content: string) => {
    if (!stompClientRef.current?.connected) {
      console.error('[Chat] Cannot send — not connected');
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
