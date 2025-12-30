export const formatTimeAgo = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInSeconds = Math.floor((now - messageDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
};

export const detectURL = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex);
};

export const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'pdf': return { icon: 'document-text', color: '#E53935' };
        case 'doc':
        case 'docx': return { icon: 'document', color: '#1976D2' };
        case 'xls':
        case 'xlsx': return { icon: 'grid', color: '#2E7D32' };
        case 'ppt':
        case 'pptx': return { icon: 'easel', color: '#F57C00' };
        case 'zip':
        case 'rar': return { icon: 'archive', color: '#795548' };
        case 'mp3':
        case 'wav': return { icon: 'musical-notes', color: '#9C27B0' };
        case 'mp4':
        case 'mov': return { icon: 'videocam', color: '#00BCD4' };
        default: return { icon: 'document-attach', color: '#607D8B' };
    }
};

export const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const MESSAGE_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    VOICE: 'voice',
    DOCUMENT: 'document',
    LINK: 'link',
};

export const REACTIONS = [
    { emoji: '👍', name: 'like' },
    { emoji: '❤️', name: 'love' },
    { emoji: '🔥', name: 'fire' },
    { emoji: '😂', name: 'laugh' },
    { emoji: '😮', name: 'wow' },
    { emoji: '🎉', name: 'celebrate' },
];
