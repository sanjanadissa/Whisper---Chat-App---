import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";

interface Message {
  id: number;
  content: string;
  timeSend: string;
  read: boolean;
  delivered: boolean;
  senderPhone?: string;
  chatId?: number;
}

interface Chat {
  id: number;
  messageList: Message[];
  lastMessage?: Message;
  otherParticipantPhone?: string;
  otherParticipantName?: string;
  contactName?: string;
  otherParticipantLastSeen?: string;
  otherParticipantOnline?: boolean;
}

interface SelectedChat {
  id: number;
  name: string;
  avatar?: string;
  lastSeen?: string;
  online?: boolean;
  messages?: Message[];
}

const ChatInterface: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState(null as SelectedChat | null);
  const [refreshSidebar, setRefreshSidebar] = useState(0); // Counter to trigger sidebar refresh
  const [sidebarUpdateCallback, setSidebarUpdateCallback] = useState<((chatId: number, messageId: number) => void) | null>(null);

  const handleChatSelect = (
    chatId: number,
    chatName: string,
    chatAvatar?: string,
    lastSeen?: string,
    messages?: Message[],
    online?: boolean // Add online parameter
  ) => {
    setSelectedChat({
      id: chatId,
      name: chatName,
      avatar: chatAvatar,
      lastSeen,
      online: online || false, // Use the actual online status from backend
      messages,
    });
  };

  const handleMessagesRead = () => {
    // Only trigger sidebar refresh if we don't have a direct update callback
    if (!sidebarUpdateCallback) {
      setRefreshSidebar(prev => prev + 1);
    }
  };

  const handleMessageRead = (messageId: number) => {
    // If we have a callback to update the sidebar directly, use it
    if (sidebarUpdateCallback && selectedChat) {
      sidebarUpdateCallback(selectedChat.id, messageId);
    } else {
      // Fallback to full refresh
      setRefreshSidebar(prev => prev + 1);
    }
  };

  const handleSidebarReady = (updateCallback: (chatId: number, messageId: number) => void) => {
    setSidebarUpdateCallback(() => updateCallback);
  };

  return (
    <div className="h-screen flex bg-[#222222]">
      <Sidebar 
        onChatSelect={handleChatSelect} 
        key={refreshSidebar}
        onReady={handleSidebarReady}
      />
      {selectedChat ? (
        <ChatArea
          chatId={selectedChat.id}
          chatName={selectedChat.name}
          chatAvatar={selectedChat.avatar}
          otherParticipantLastSeen={selectedChat.lastSeen}
          otherParticipantOnline={selectedChat.online}
          initialMessages={selectedChat.messages}
          onMessagesRead={handleMessagesRead}
          onMessageRead={handleMessageRead}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#1E201E]">
          <div className="text-center text-gray-400">
            <h2 className="text-2xl font-semibold mb-2">Welcome to Whisper</h2>
            <p>Select a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
