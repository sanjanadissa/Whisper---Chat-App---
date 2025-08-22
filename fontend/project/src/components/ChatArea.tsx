import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  MoreHorizontal,
  Paperclip,
  Mic,
  Send,
  Clock,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ProfileAvatar from "./ui/ProfileAvatar.jsx";

// Custom scrollbar styles
const scrollbarStyles = `
  .scrollbar-thin::-webkit-scrollbar {
    width: 3px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #4B5563;
    border-radius: 3px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #6B7280;
  }
  
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: #4B5563 transparent;
  }
`;

interface Message {
  id: number;
  content: string;
  timeSend: string;
  read: boolean;
  delivered: boolean;
  senderPhone?: string; // Backend returns senderPhone directly
  chatId?: number;
  sender?: {
    id: number;
    userName: string;
    fullname: string;
    email: string;
    phoneNumber: string;
    online: boolean;
    lastSeen: string;
    discription: string;
    profileImageUrl: string;
  };
}

interface ChatMessages {
  sentByUser: Message[];
  sentByOthers: Message[];
}

interface ChatAreaProps {
  chatId: number;
  chatName?: string;
  chatAvatar?: string;
  otherParticipantLastSeen?: string;
  otherParticipantOnline?: boolean;
  initialMessages?: Message[];
  onMessagesRead?: () => void; // Callback to notify parent when messages are read
  onMessageRead?: (messageId: number) => void; // Callback to notify parent when a specific message is read
}

export default function ChatArea({
  chatId,
  chatName = "Chat",
  chatAvatar,
  otherParticipantLastSeen,
  otherParticipantOnline,
  initialMessages,
  onMessagesRead,
  onMessageRead,
}: ChatAreaProps) {
  // Debug: Log the props received
  console.log("ChatArea: Received props:", {
    chatId,
    chatName,
    chatAvatar,
    otherParticipantLastSeen,
    otherParticipantOnline,
    initialMessagesLength: initialMessages?.length || 0,
  });
  const { token, user } = useAuth();
  const [messages, setMessages] = useState({
    sentByUser: [],
    sentByOthers: [],
  } as ChatMessages);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null as string | null);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [stompClient, setStompClient] = useState(null as any);
  const messagesEndRef = useRef(null as HTMLDivElement | null);
  const [currentUserPhone, setCurrentUserPhone] = useState("");

  useEffect(() => {
    if (chatId) {
      fetchCurrentUser().then(() => {
        // After fetching current user, process initial messages if available
        if (initialMessages && initialMessages.length > 0 && currentUserPhone) {
          console.log(
            "ChatArea: Processing initial messages after fetchCurrentUser"
          );
          categorizeMessages(initialMessages);
        }
      });
    }

    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, [chatId]);

  // Mark all messages as read when chat is opened
  useEffect(() => {
    if (chatId && currentUserPhone && !loading) {
      // Mark all messages in the chat as read when opened
      markChatAsRead();

      // Also mark individual unread messages as read
      const allMessages = [...messages.sentByUser, ...messages.sentByOthers];
      const unreadMessages = allMessages.filter(
        (message) => !message.read && message.senderPhone !== currentUserPhone
      );

      if (unreadMessages.length > 0) {
        unreadMessages.forEach((message) => {
          markMessageAsRead(message.id);
        });
      }
    }
  }, [chatId, currentUserPhone, loading, messages]);

  // Check for unread messages periodically and mark them as read
  useEffect(() => {
    if (chatId && currentUserPhone && !loading) {
      const interval = setInterval(() => {
        const allMessages = [...messages.sentByUser, ...messages.sentByOthers];
        const unreadMessages = allMessages.filter(
          (message) => !message.read && message.senderPhone !== currentUserPhone
        );

        if (unreadMessages.length > 0) {
          unreadMessages.forEach((message) => {
            markMessageAsRead(message.id);
          });
        }
      }, 2000); // Check every 2 seconds

      return () => clearInterval(interval);
    }
  }, [chatId, currentUserPhone, loading, messages]);

  // Use initial messages if available, otherwise fetch from API
  useEffect(() => {
    if (chatId && currentUserPhone) {
      if (initialMessages && initialMessages.length > 0) {
        // Use initial messages from Sidebar (which have correct senderPhone)
        console.log("ChatArea: Using initial messages:", {
          chatId,
          currentUserPhone,
          initialMessagesLength: initialMessages.length,
          firstMessage: initialMessages[0]
            ? {
                id: initialMessages[0].id,
                content: initialMessages[0].content,
                senderPhone: initialMessages[0].senderPhone,
                hasSender: !!initialMessages[0].sender,
              }
            : "No messages",
        });

        // Ensure currentUserPhone is set before categorizing messages
        if (currentUserPhone) {
          categorizeMessages(initialMessages);
        }
        setLoading(false); // Set loading to false since we have messages
        // Mark all messages in the chat as read when opened
        markChatAsRead();
      } else {
        // Fallback to API call
        console.log("ChatArea: No initial messages, fetching from API");
        fetchMessages();
      }
    }
  }, [chatId, currentUserPhone, initialMessages]);

  // Connect WebSocket after current user is fetched
  useEffect(() => {
    if (chatId && currentUserPhone && token) {
      // Disconnect existing connection first
      if (stompClient) {
        stompClient.disconnect();
        setStompClient(null);
      }

      // Connect to WebSocket
      connectWebSocket();
    }
  }, [chatId, currentUserPhone, token]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, [stompClient]);

  // Inject scrollbar styles
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = scrollbarStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add a useEffect to log when currentUserPhone changes
  useEffect(() => {}, [currentUserPhone]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const categorizeMessages = useCallback(
    (messageList: Message[]) => {
      console.log("ChatArea: Categorizing messages:", {
        messageListLength: messageList.length,
        currentUserPhone,
        firstMessage: messageList[0]
          ? {
              id: messageList[0].id,
              content: messageList[0].content,
              senderPhone: messageList[0].senderPhone,
              isOwnMessage: messageList[0].senderPhone === currentUserPhone,
            }
          : "No messages",
      });

      if (!currentUserPhone) {
        console.error(
          "ChatArea: currentUserPhone not set, cannot categorize messages"
        );
        return;
      }

      const sentByUser: Message[] = [];
      const sentByOthers: Message[] = [];

      messageList.forEach((message: Message) => {
        const isOwnMessage = message.senderPhone === currentUserPhone;
        console.log(
          `ChatArea: Message ${message.id} - senderPhone: ${message.senderPhone}, currentUserPhone: ${currentUserPhone}, isOwn: ${isOwnMessage}`
        );

        if (isOwnMessage) {
          sentByUser.push(message);
        } else {
          sentByOthers.push(message);
        }
      });

      console.log("ChatArea: Categorized messages:", {
        sentByUser: sentByUser.length,
        sentByOthers: sentByOthers.length,
      });

      setMessages({
        sentByUser,
        sentByOthers,
      });
      setLoading(false);

      // Mark all unread messages as read when chat is opened
      const unreadMessages = sentByOthers.filter((message) => !message.read);
      if (unreadMessages.length > 0) {
        unreadMessages.forEach((message) => {
          markMessageAsRead(message.id);
        });
      }
    },
    [currentUserPhone]
  );

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("ChatArea: Current user data:", data);

      // Use the correct field names from the backend response
      setCurrentUserPhone(data.phoneNumber || data.userphonenumber);

      console.log(
        "ChatArea: Set currentUserPhone to:",
        data.phoneNumber || data.userphonenumber
      );
    } catch (err) {
      console.error("Error fetching current user:", err);
      setCurrentUserPhone("0987654321");
    }
  };

  const connectWebSocket = () => {
    // Import SockJS and Stomp dynamically for browser compatibility
    const SockJS = (window as any).SockJS;
    const Stomp = (window as any).Stomp;

    if (!SockJS || !Stomp) {
      console.error("SockJS or Stomp not available");
      return;
    }

    console.log("Connecting to WebSocket...");
    const socket = new SockJS("http://localhost:8080/ws");
    const client = Stomp.over(socket);

    client.connect(
      {
        Authorization: `Bearer ${token}`,
      },
      () => {
        console.log("WebSocket connected successfully");
        setStompClient(client);

        // Subscribe to chat messages
        client.subscribe(`/topic/chat/${chatId}`, (message: any) => {
          console.log("Received WebSocket message:", message.body);
          const newMessage = JSON.parse(message.body);
          addMessageToChat(newMessage);
        });

        // Subscribe to error messages
        client.subscribe("/user/queue/errors", (message: any) => {
          const error = JSON.parse(message.body);
          console.error("WebSocket error:", error);
          setError(error.content);
        });
      },
      (error: any) => {
        console.error("WebSocket connection error:", error);
        setError("Failed to connect to chat server");
      }
    );
  };

  const addMessageToChat = (newMessage: any) => {
    console.log("Adding message to chat:", newMessage);
    console.log("Current user phone:", currentUserPhone);

    // Don't add message if currentUserPhone is not set yet
    if (!currentUserPhone) {
      console.log("currentUserPhone not set, skipping message");
      return;
    }

    setMessages((prevMessages) => {
      // Check if message already exists
      const messageExists = [
        ...prevMessages.sentByUser,
        ...prevMessages.sentByOthers,
      ].some((msg) => msg.id === newMessage.id);

      if (messageExists) {
        console.log("Message already exists, skipping");
        return prevMessages;
      }

      // Add message to appropriate list based on sender
      const isOwnMessage = newMessage.senderPhone === currentUserPhone;
      console.log("Is own message:", isOwnMessage);

      // If it's a message from someone else, mark it as read after a short delay
      // This ensures the user has time to see the message
      if (!isOwnMessage) {
        setTimeout(() => {
          markMessageAsRead(newMessage.id);
        }, 0);
      }

      if (isOwnMessage) {
        return {
          ...prevMessages,
          sentByUser: [...prevMessages.sentByUser, newMessage],
        };
      } else {
        return {
          ...prevMessages,
          sentByOthers: [...prevMessages.sentByOthers, newMessage],
        };
      }
    });
  };

  // Function to mark a single message as read
  const markMessageAsRead = async (messageId: number) => {
    try {
      // Update local state immediately for better visual feedback
      setMessages((prevMessages) => ({
        sentByUser: prevMessages.sentByUser.map((msg) =>
          msg.id === messageId ? { ...msg, read: true } : msg
        ),
        sentByOthers: prevMessages.sentByOthers.map((msg) =>
          msg.id === messageId ? { ...msg, read: true } : msg
        ),
      }));

      const response = await fetch(
        `http://localhost:8080/api/messages/${messageId}/read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to mark message as read:", response.status);
        // Revert local state if API call failed
        setMessages((prevMessages) => ({
          sentByUser: prevMessages.sentByUser.map((msg) =>
            msg.id === messageId ? { ...msg, read: false } : msg
          ),
          sentByOthers: prevMessages.sentByOthers.map((msg) =>
            msg.id === messageId ? { ...msg, read: false } : msg
          ),
        }));
      } else {
        // Notify parent component that this specific message was read
        onMessageRead?.(messageId);
      }
    } catch (err) {
      console.error("Error marking message as read:", err);
      // Revert local state if API call failed
      setMessages((prevMessages) => ({
        sentByUser: prevMessages.sentByUser.map((msg) =>
          msg.id === messageId ? { ...msg, read: false } : msg
        ),
        sentByOthers: prevMessages.sentByOthers.map((msg) =>
          msg.id === messageId ? { ...msg, read: false } : msg
        ),
      }));
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8080/api/messages/chat/${chatId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Structure the data properly - backend returns flat array, we need to categorize by sender
      const sentByUser: Message[] = [];
      const sentByOthers: Message[] = [];

      if (Array.isArray(data)) {
        data.forEach((message: Message) => {
          // Check if message has senderPhone property, otherwise check sender object
          const messageSenderPhone =
            message.senderPhone || message.sender?.phoneNumber;
          const isOwnMessage = messageSenderPhone === currentUserPhone;

          if (isOwnMessage) {
            sentByUser.push(message);
          } else {
            sentByOthers.push(message);
          }
        });
      }

      setMessages({
        sentByUser,
        sentByOthers,
      });

      // Mark all unread messages as read after fetching
      const unreadMessages = sentByOthers.filter((message) => !message.read);
      if (unreadMessages.length > 0) {
        unreadMessages.forEach((message) => {
          markMessageAsRead(message.id);
        });
      }

      // Also mark all messages in the chat as read via the bulk endpoint
      markChatAsRead();
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Function to mark all messages in the chat as read
  const markChatAsRead = async () => {
    try {
      // Check if currentUserPhone is available
      if (!currentUserPhone) {
        console.log(
          "ChatArea markChatAsRead: currentUserPhone not available yet, skipping"
        );
        return;
      }

      console.log(
        "ChatArea markChatAsRead: Marking chat",
        chatId,
        "as read for user",
        currentUserPhone
      );

      const response = await fetch(
        `http://localhost:8080/api/messages/chat/${chatId}/mark-read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userPhone: currentUserPhone,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "ChatArea: Failed to mark chat as read:",
          response.status,
          errorText
        );
      } else {
        console.log("ChatArea: Successfully marked chat", chatId, "as read");
        // Notify parent component that messages were read
        onMessagesRead?.();
      }
    } catch (err) {
      console.error("ChatArea: Error marking chat as read:", err);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await fetch(
        `http://localhost:8080/api/messages/chat/${chatId}/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: inputMessage.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newMessage = await response.json();
      addMessageToChat(newMessage);
      setInputMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return "";

    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatLastSeen = (lastSeen: string): string => {
    if (!lastSeen) return "never";

    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    const diffInWeeks = diffInDays / 7;

    // Format time as "12:37 PM"
    const timeString = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (diffInDays < 1) {
      // Today
      return `last seen today at ${timeString}`;
    } else if (diffInDays < 2) {
      // Yesterday
      return `last seen yesterday at ${timeString}`;
    } else if (diffInWeeks < 1) {
      // Within a week - show day name
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      return `last seen ${dayName} at ${timeString}`;
    } else {
      // Older than a week - show date
      const dateString = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `last seen on ${dateString}`;
    }
  };

  const getAllMessages = (): Array<Message & { isOwn: boolean }> => {
    // Add null checks to prevent map errors
    const userMessages = (messages?.sentByUser || []).map((msg) => ({
      ...msg,
      isOwn: true,
    }));
    const otherMessages = (messages?.sentByOthers || []).map((msg) => ({
      ...msg,
      isOwn: false,
    }));

    // Combine and sort by time
    const allMessages = [...userMessages, ...otherMessages];
    return allMessages.sort(
      (a, b) => new Date(a.timeSend).getTime() - new Date(b.timeSend).getTime()
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-chatbg">
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Loading messages...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col bg-chatbg">
        <div className="flex items-center justify-center h-full">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  const allMessages = getAllMessages();

  return (
    <div className="flex-1 flex flex-col bg-chatbg">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-chatbg bg-darkbg backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <ProfileAvatar
            src={chatAvatar}
            alt={chatName}
            size="md"
            fallbackText={chatName}
            // showOnlineStatus={true}
            isOnline={otherParticipantOnline}
          />
          <div>
            <h2 className="text-white font-semibold">{chatName}</h2>
            <p className="text-gray-400 text-sm">
              {otherParticipantOnline
                ? "Online"
                : otherParticipantLastSeen
                ? formatLastSeen(otherParticipantLastSeen)
                : "select for contact info"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-chatbg scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500">
        {allMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 text-center">
              <p>No messages yet</p>
              <p className="text-sm">Start a conversation!</p>
            </div>
          </div>
        ) : (
          allMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isOwn ? "justify-end" : "justify-start"
              } space-x-3`}
            >
              {!message.isOwn && (
                <ProfileAvatar
                  src={message.sender?.profileImageUrl}
                  alt={message.sender?.fullname || "User"}
                  size="sm"
                  fallbackText={
                    message.sender?.fullname ||
                    message.sender?.userName ||
                    "User"
                  }
                />
              )}
              <div
                className={`max-w-xs lg:max-w-md ${
                  message.isOwn ? "order-first" : ""
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message.isOwn
                      ? "bg-primarychat"
                      : "bg-dark2 text-white border border-gray-700"
                  }`}
                >
                  <p className="text-sm text-white">{message.content}</p>
                  <div className="flex items-center justify-end mt-1 space-x-1">
                    <span
                      className={`text-xs ${
                        message.isOwn ? "text-white" : "text-white"
                      }`}
                    >
                      {formatTime(message.timeSend)}
                    </span>
                    
                    {!message.isOwn && (
                      <div
                        className={`text-xs ${
                          message.read ? "text-green-400" : "text-gray-400"
                        }`}
                      >
                        
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {message.isOwn && (
                <ProfileAvatar
                  src={user?.profileImageUrl}
                  alt="You"
                  size="sm"
                  fallbackText="You"
                />
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-chatbg bg-darkbg backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Write a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              className="w-full bg-chatbg text-white placeholder-gray-400 pl-4 pr-12 py-3 rounded-full border hover:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700 border-dark2 disabled:opacity-50"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
              <Paperclip size={20} />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors">
              <Clock size={20} />
            </button>
            <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors">
              <Mic size={20} />
            </button>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || sending}
              className="p-3 bg-primary2 hover:bg-primary2/70 disabled:bg-dark2 disabled:cursor-not-allowed disabled:text-white text-black rounded-full transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
