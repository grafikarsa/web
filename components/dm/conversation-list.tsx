'use client';

import { useDM } from '@/components/providers/dm-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAuthStore } from '@/lib/stores/auth-store';

export function ConversationList() {
    const {
        conversations,
        activeConversationId,
        setActiveConversationId,
        onlineUsers
    } = useDM();
    const { user } = useAuthStore();

    if (conversations.length === 0) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                Belum ada percakapan. Mulai chat baru!
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col gap-2 p-2">
                {conversations.map((conv) => {
                    // Determine other participant
                    const otherUser = conv.participants.find(p => p.id !== user?.id) || conv.participants[0];
                    const isContextUserOnline = onlineUsers.has(otherUser.id);
                    const isActive = activeConversationId === conv.id;

                    return (
                        <button
                            key={conv.id}
                            onClick={() => setActiveConversationId(conv.id)}
                            className={cn(
                                "flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50",
                                isActive && "bg-muted"
                            )}
                        >
                            <div className="relative">
                                <Avatar>
                                    <AvatarImage src={otherUser.avatar_url} />
                                    <AvatarFallback>{otherUser.nama[0]}</AvatarFallback>
                                </Avatar>
                                {isContextUserOnline && (
                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                                )}
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">{otherUser.nama}</span>
                                    {conv.last_message && (
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true, locale: id })}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="truncate text-sm text-muted-foreground max-w-[140px]">
                                        {conv.last_message?.content || 'Mulai percakapan'}
                                    </p>
                                    {conv.unread_count > 0 && (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                            {conv.unread_count}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
