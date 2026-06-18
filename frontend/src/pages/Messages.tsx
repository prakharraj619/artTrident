import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import apiClient from '../api/client';
import type { ConversationResponse, MessageResponse } from '../types';
import { Send, MessageSquare, Wifi, WifiOff, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// ─── Avatar helper ────────────────────────────────────────────────────────────
function Avatar({ url, username, size = 'md' }: { url?: string | null; username: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = username.slice(0, 2).toUpperCase();
  if (url) return <img src={url} alt={username} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white flex-shrink-0`} />;
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const { sendMessage, incomingMessage, isConnected } = useChat();

  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load conversations on mount
  useEffect(() => {
    apiClient.get<ConversationResponse[]>('/messages/conversations')
      .then(res => setConversations(res.data))
      .catch(console.error)
      .finally(() => setIsLoadingConversations(false));
  }, []);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;
    setIsLoadingMessages(true);
    apiClient.get<{ content: MessageResponse[] }>(`/messages/conversations/${selectedConversation.id}/messages`)
      .then(res => {
        setMessages(res.data.content);
        // Mark conversation as read in the sidebar
        setConversations(prev => prev.map(c =>
          c.id === selectedConversation.id ? { ...c, unreadCount: 0 } : c
        ));
      })
      .catch(console.error)
      .finally(() => setIsLoadingMessages(false));
  }, [selectedConversation]);

  // Auto scroll when messages change
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Handle incoming real-time messages from WebSocket
  useEffect(() => {
    if (!incomingMessage) return;

    // If the message belongs to the currently open conversation, add it to the thread
    if (selectedConversation && incomingMessage.conversationId === selectedConversation.id) {
      setMessages(prev => {
        // Avoid duplicate messages (server sends back to sender too)
        if (prev.some(m => m.id === incomingMessage.id)) return prev;
        return [...prev, incomingMessage];
      });
    }

    // Update the conversation sidebar's last message preview
    setConversations(prev => prev.map(c => {
      if (c.id === incomingMessage.conversationId) {
        const isCurrentlyOpen = selectedConversation?.id === c.id;
        return {
          ...c,
          lastMessageContent: incomingMessage.content,
          lastMessageAt: incomingMessage.sentAt,
          unreadCount: isCurrentlyOpen ? 0 : c.unreadCount + 1,
        };
      }
      return c;
    }).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()));
  }, [incomingMessage, selectedConversation]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedConversation) return;
    sendMessage(selectedConversation.id, inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="flex h-screen bg-neutral-50 font-['Inter',sans-serif]">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 bg-white border-r border-neutral-200 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-500" />
            <h1 className="font-semibold text-neutral-900 text-lg">Messages</h1>
            {totalUnread > 0 && (
              <span className="bg-sky-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalUnread}
              </span>
            )}
          </div>
          {/* Connection indicator */}
          <div className={`flex items-center gap-1.5 text-xs font-medium ${isConnected ? 'text-emerald-500' : 'text-rose-400'}`}>
            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isConnected ? 'Live' : 'Offline'}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-neutral-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-neutral-100 rounded w-24" />
                    <div className="h-2.5 bg-neutral-100 rounded w-36" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
                <MessageSquare className="w-7 h-7 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-700">No messages yet</p>
              <p className="text-xs text-neutral-400 mt-1">Visit an artist's profile and click "Message"</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                id={`conversation-${conv.id}`}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left border-b border-neutral-50
                  ${selectedConversation?.id === conv.id ? 'bg-sky-50 border-l-2 border-l-sky-400' : ''}`}
              >
                <div className="relative">
                  <Avatar url={conv.otherUserAvatarUrl} username={conv.otherUsername} />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sky-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'}`}>
                      {conv.otherUsername}
                    </span>
                    <span className="text-[10px] text-neutral-400 ml-2 flex-shrink-0">
                      {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-neutral-600 font-medium' : 'text-neutral-400'}`}>
                    {conv.lastMessageContent ?? 'No messages yet'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Chat Panel ──────────────────────────────────────────────────── */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="px-6 py-4 bg-white border-b border-neutral-200 flex items-center gap-3 shadow-sm">
            <Avatar url={selectedConversation.otherUserAvatarUrl} username={selectedConversation.otherUsername} size="lg" />
            <div>
              <p className="font-semibold text-neutral-900">{selectedConversation.otherUsername}</p>
              <p className="text-xs text-neutral-400">Artist</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-100 to-teal-100 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-sky-500" />
                </div>
                <p className="font-medium text-neutral-700">Start the conversation!</p>
                <p className="text-sm text-neutral-400 mt-1">Say hi to {selectedConversation.otherUsername} 👋</p>
              </div>
            ) : (
              messages.map(msg => {
                const isOwn = msg.senderUsername === user?.username;
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isOwn && <Avatar url={msg.senderAvatarUrl} username={msg.senderUsername} size="sm" />}
                    <div className={`max-w-[65%] group`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                        ${isOwn
                          ? 'bg-sky-500 text-white rounded-br-sm'
                          : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-sm'
                        }`}>
                        {msg.content}
                      </div>
                      <p className={`text-[10px] text-neutral-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {formatDistanceToNow(new Date(msg.sentAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="px-6 py-4 bg-white border-t border-neutral-200">
            <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
              <textarea
                id="message-input"
                rows={1}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${selectedConversation.otherUsername}...`}
                className="flex-1 bg-transparent resize-none text-sm text-neutral-800 placeholder:text-neutral-400 outline-none py-1"
              />
              <button
                id="send-message-btn"
                onClick={handleSend}
                disabled={!inputText.trim() || !isConnected}
                className="w-9 h-9 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            {!isConnected && (
              <p className="text-xs text-rose-400 mt-2 text-center">
                Reconnecting to real-time server...
              </p>
            )}
          </div>
        </div>
      ) : (
        // Empty state when no conversation is selected
        <div className="flex-1 flex flex-col items-center justify-center text-center bg-neutral-50">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-100 to-teal-100 flex items-center justify-center mb-5 shadow-inner">
            <User className="w-10 h-10 text-sky-500" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-800">Your Messages</h2>
          <p className="text-neutral-400 text-sm mt-2 max-w-xs">
            Select a conversation from the left, or visit an artist's profile to start a new one.
          </p>
        </div>
      )}
    </div>
  );
}
