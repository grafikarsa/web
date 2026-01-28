'use client';

import { useDM } from '@/components/providers/dm-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Send, Image as ImageIcon, MoreVertical, Phone, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function ChatWindow() {
    const {
        activeConversation,
        messages,
        sendMessage,
        sendTyping,
        isTyping,
        onlineUsers,
        isLoadingMessages
    } = useDM();
    const { user } = useAuthStore();
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>(undefined);

    const otherUser = activeConversation?.participants.find(p => p.id !== user?.id);
    const isOnline = otherUser ? onlineUsers.has(otherUser.id) : false;
    const isPartnerTyping = otherUser ? isTyping[otherUser.id] : false;

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isPartnerTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        await sendMessage(inputValue);
        setInputValue('');
        sendTyping(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);

        sendTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => sendTyping(false), 3000);
    };

    if (!activeConversation) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Pilih percakapan untuk memulai chat
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={otherUser?.avatar_url} />
                        <AvatarFallback>{otherUser?.nama[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold">{otherUser?.nama}</h3>
                        <p className="text-xs text-muted-foreground">
                            {isOnline ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Add buttons/menu here */}
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-4">
                    {messages.map((msg, idx) => {
                        const isMe = msg.sender_id === user?.id;
                        const showAvatar = !isMe && (idx === 0 || messages[idx - 1].sender_id !== msg.sender_id);

                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex gap-2 max-w-[70%]",
                                    isMe ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                {!isMe && (
                                    <div className="w-8">
                                        {showAvatar && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={otherUser?.avatar_url} />
                                                <AvatarFallback>{otherUser?.nama[0]}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                )}

                                <div className={cn(
                                    "rounded-lg p-3",
                                    isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    {msg.message_type === 'image' ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={msg.content} alt="Image" className="rounded-md max-w-full" />
                                    ) : (
                                        <p className="text-sm">{msg.content}</p>
                                    )}
                                    <span className="mt-1 block text-[10px] opacity-70">
                                        {format(new Date(msg.created_at), 'HH:mm')}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {isPartnerTyping && (
                        <div className="flex gap-2 text-sm text-muted-foreground items-center">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={otherUser?.avatar_url} />
                            </Avatar>
                            Writing...
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Button type="button" variant="ghost" size="icon">
                        <ImageIcon className="h-5 w-5" />
                    </Button>
                    <Input
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Ketik pesan..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon">
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
