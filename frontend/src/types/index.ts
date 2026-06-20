export interface User {
    username: string;
    email: string;
    role: 'ARTIST' | 'COLLECTOR' | 'VIEWER' | 'ADMIN';
}

export interface AuthResponse {
    token: string;
}

export interface Artwork {
    id: number;
    artistName: string;
    artistProfileUrl?: string;
    title: string;
    medium: string;
    description: string;
    imageUrl: string;
    price: number;
    forSale: boolean;
    createdAt: string;
}

export interface UserProfile {
    username: string;
    name?: string;
    role: string;
    status: string | null;
    bio: string | null;
    profilePictureUrl: string | null;
    followerCount: number;
    followingCount: number;
    artworkCount: number;
}

// ─── Messaging Types ───────────────────────────────────────────────────────────

export interface MessageResponse {
    id: number;
    conversationId: number;
    senderId: number;
    senderUsername: string;
    senderAvatarUrl: string | null;
    content: string;
    sentAt: string;
    isRead: boolean;
}

export interface ConversationResponse {
    id: number;
    otherUserId: number;
    otherUsername: string;
    otherUserAvatarUrl: string | null;
    lastMessageContent: string | null;
    lastMessageAt: string;
    unreadCount: number;
}

// ─── Comment Types ─────────────────────────────────────────────────────────────

export interface CommentResponse {
    id: number;
    artworkId: number;
    authorId: number;
    authorUsername: string;
    authorAvatarUrl: string | null;
    content: string;
    createdAt: string;
}
