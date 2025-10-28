
export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatMessage {
  role: Role;
  text: string;
}

export interface User {
    id: string;
    name: string;
    avatar: string;
}

export interface Like {
    userId: string;
    createdAt: number;
}

export interface Comment {
    id: string;
    userId: string;
    text: string;
    createdAt: number;
}

export interface Photo {
    id: number;
    url: string;
    caption: string;
    ownerId: string;
    taggedUserIds: string[];
    likes: Like[];
    comments: Comment[];
    createdAt: number;
}
