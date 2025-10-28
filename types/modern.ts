export interface SessionUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    is_admin?: boolean;
}

export interface DbUser {
    id: string;
    name: string | null;
    avatar_url: string | null;
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
    user: DbUser;
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
    user: DbUser;
}
