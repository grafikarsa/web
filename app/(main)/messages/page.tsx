export const metadata = {
    title: 'Pesan | Grafikarsa',
    description: 'Chat dengan pengguna lain',
};

import { ChatWindow } from '@/components/dm/chat-window';
import { ConversationList } from '@/components/dm/conversation-list';
import { Card } from '@/components/ui/card';

export default function MessagesPage() {
    return (
        <div className="h-[calc(100vh-80px)] p-4 flex gap-4">
            {/* Sidebar List */}
            <Card className="w-80 flex-shrink-0 flex flex-col overflow-hidden">
                <div className="p-4 border-b">
                    <h2 className="font-semibold text-lg">Pesan</h2>
                </div>
                <ConversationList />
            </Card>

            {/* Main Chat Area */}
            <Card className="flex-1 overflow-hidden">
                <ChatWindow />
            </Card>
        </div>
    );
}
