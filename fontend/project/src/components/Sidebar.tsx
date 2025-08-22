import React, { useState, useEffect, useCallback } from "react";
import FloatingContactMenu from "./floating-contact-menu/index.jsx";
import ProfileAvatar from "./ui/ProfileAvatar.jsx";

import {
  Search,
  Plus,
  Settings,
  Phone,
  MessageCircle,
  User,
  MoreHorizontal,
  Scroll,
  ScrollText,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LiquidButton } from "./glass-button";

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

interface ChatUser {
  id: number;
  userName: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  online: boolean;
  lastSeen: string;
  discription: string;
  profileImageUrl: string;
}

interface Message {
  id: number;
  content: string;
  timeSend: string;
  read: boolean; // Changed from isRead to read
  delivered: boolean; // Changed from isDelivered to delivered
  senderPhone?: string; // Added sender phone
  chatId?: number; // Added chat ID
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

interface Chat {
  id: number;
  messageList: Message[];
  lastMessage?: Message;
  otherParticipantPhone?: string;
  otherParticipantName?: string;
  contactName?: string; // Contact name if the other participant is in contacts
  otherParticipantLastSeen?: string | null;
  otherParticipantOnline?: boolean; // Added last seen for the other participant
  otherParticipantProfileImageUrl?: string | null; // Profile image URL for the other participant
}

interface Story {
  id: number;
  name: string;
  avatar: string;
  isOwn?: boolean;
}

interface SidebarProps {
  onChatSelect?: (
    chatId: number,
    chatName: string,
    chatAvatar?: string,
    lastSeen?: string,
    messages?: Message[],
    online?: boolean
  ) => void;
  onReady?: (
    updateCallback: (chatId: number, messageId: number) => void
  ) => void;
}

const stories: Story[] = [
  // {
  //   id: 1,
  //   name: "My Story",
  //   avatar:
  //     "https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
  //   isOwn: true,
  // }
];

export default function Sidebar({ onChatSelect, onReady }: SidebarProps) {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [currentUserPhone, setCurrentUserPhone] = useState<string>("");
  const [chats, setChats] = useState<Chat[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFloatingContactMenu, setShowFloatingContactMenu] = useState(false);
  const [searchNumber, setSearchNumber] = useState(""); // input value
  const [debouncedValue, setDebouncedValue] = useState(""); // value after delay
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]); // fetched phone numbers
  const searchRef = React.useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [stompClient, setStompClient] = useState(null as any);
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(searchNumber);
    }, 500); // 500ms delay after user stops typing

    return () => {
      clearTimeout(handler); // clear previous timer on re-type
    };
  }, [searchNumber]);


  // Trigger your API or search logic when debouncedValue changes
  useEffect(() => {
    if (!debouncedValue) return;

    console.log("Send value:", debouncedValue);
    const fetchData = async () => {
      try {
        const url = new URL("http://localhost:8080/user/searchPhone");
        url.searchParams.append("phoneNumber", debouncedValue);

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setSearchResults(Array.isArray(data) ? data : [data]);
        console.log(data);
      } catch (err) {
        setSearchResults([]);
        console.error("Error fetching user details:", err);
      }
    };
    fetchData();
  }, [debouncedValue]);

  // Hide search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchChats();
  }, []);

  // Refresh chats when component is re-mounted (when key changes)
  useEffect(() => {
    if (currentUserPhone) {
      fetchChats();
    }
  }, [currentUserPhone]);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (currentUserPhone && token) {
      connectWebSocket();
    }

    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, [currentUserPhone, token]);

  // Periodic refresh for online status updates
  useEffect(() => {
    if (!currentUserPhone || !token) return;

    const interval = setInterval(() => {
      fetchChats(); // Refresh chats to get updated online status
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentUserPhone, token]);

  // Function to update unread count for a specific chat
  const updateChatUnreadCount = useCallback(
    (chatId: number, messageId: number) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === chatId) {
            // Mark the specific message as read
            const updatedMessageList = chat.messageList.map((message) =>
              message.id === messageId ? { ...message, read: true } : message
            );
            return { ...chat, messageList: updatedMessageList };
          }
          return chat;
        })
      );
    },
    []
  );

  // Notify parent component when ready with update callback
  useEffect(() => {
    if (onReady && currentUserPhone) {
      onReady(updateChatUnreadCount);
    }
  }, [onReady, currentUserPhone, updateChatUnreadCount]);

  // Periodic refresh of chat list
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUserPhone) {
        // Check if there are unread messages using current chats state
        const hasUnreadMessages = chats.some((chat) => {
          const unreadCount = getUnreadCount(chat);
          return unreadCount > 0;
        });

        // Only refresh if there are unread messages
        if (hasUnreadMessages) {
          fetchChats();
        }
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentUserPhone]); // Removed chats dependency to prevent infinite loop

  // Inject scrollbar styles
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = scrollbarStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
      console.log("Sidebar: Current user data:", data);

      // Use the correct field names from the backend response
      setCurrentUserPhone(data.phoneNumber || data.userphonenumber);
      setCurrentUserName(data.userName || data.username);
      setCurrentUserEmail(data.email || data.useremail);

      console.log(
        "Sidebar: Set currentUserPhone to:",
        data.phoneNumber || data.userphonenumber
      );
    } catch (err) {
      console.error("Error fetching current user:", err);
      // Fallback to the phone number from JWT token
      setCurrentUserPhone("0987654321");
    }
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/user/getchats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error("Non-JSON response:", responseText);
        throw new Error(
          "Response is not JSON. Check if the endpoint is correct."
        );
      }

      const chatData: Chat[] = await response.json();
      console.log("Raw chat data:", chatData);

      // Debug: Check what fields are actually available in the chat data
      if (chatData.length > 0) {
        const firstChat = chatData[0];
        console.log("First chat structure:", {
          id: firstChat.id,
          availableKeys: Object.keys(firstChat),
          hasOtherParticipantProfileImageUrl:
            "otherParticipantProfileImageUrl" in firstChat,
          hasContactName: "contactName" in firstChat,
          hasOtherParticipantName: "otherParticipantName" in firstChat,
          messageListLength: firstChat.messageList?.length || 0,
        });
      }

      // Log the first message structure to debug
      if (
        chatData.length > 0 &&
        chatData[0].messageList &&
        chatData[0].messageList.length > 0
      ) {
        const firstChat = chatData[0];
        const firstMessage = firstChat.messageList[0];
        if (firstMessage) {
          console.log("First message structure:", {
            messageId: firstMessage.id,
            content: firstMessage.content,
            senderPhone: firstMessage.senderPhone,
            sender: firstMessage.sender,
            senderKeys: firstMessage.sender
              ? Object.keys(firstMessage.sender)
              : "No sender object",
          });
        }
      }

      // Process chat data to ensure profile image URLs are set
      const processedChats = chatData.map((chat) => {
        // Extract other participant's phone from messages
        // Look for messages from other participants, not just the first non-current user message
        let otherParticipantPhone = null;
        if (chat.messageList && chat.messageList.length > 0) {
          // Get all unique sender phones in this chat
          const senderPhones = [
            ...new Set(chat.messageList.map((msg) => msg.senderPhone)),
          ];
          // Find the one that's not the current user
          otherParticipantPhone = senderPhones.find(
            (phone) => phone !== currentUserPhone
          );

          // If no other participant found, this might be a self-chat or the backend data is incomplete
          if (!otherParticipantPhone) {
            console.warn(
              `Chat ${chat.id}: No other participant found, all messages from current user`
            );
          }
        }

        // Get the other participant's profile image URL from the backend data
        // The backend should provide this in chat.otherParticipantProfileImageUrl
        const otherParticipantProfileImageUrl =
          chat.otherParticipantProfileImageUrl || null;

        console.log("Processing chat", chat.id, ":", {
          otherParticipantPhone,
          otherParticipantProfileImageUrl,
          chatOtherParticipantProfileImageUrl:
            chat.otherParticipantProfileImageUrl,
          messageCount: chat.messageList?.length || 0,
          senderPhones: chat.messageList
            ? [...new Set(chat.messageList.map((msg) => msg.senderPhone))]
            : [],
        });

        return {
          ...chat,
          otherParticipantPhone:
            otherParticipantPhone || chat.otherParticipantPhone,
          otherParticipantProfileImageUrl: otherParticipantProfileImageUrl,
          otherParticipantName:
            chat.contactName ||
            chat.otherParticipantName ||
            otherParticipantPhone ||
            `Chat #${chat.id}`,
          // Preserve the online status and lastSeen from backend if available
          otherParticipantOnline: chat.otherParticipantOnline || false,
          otherParticipantLastSeen: chat.otherParticipantLastSeen || null,
        };
      });

      console.log("Processed chats:", processedChats);

      // Sort chats by latest message time
      const sortedChats = processedChats.sort((a, b) => {
        // Get the last message for chat A
        const aLastMessage =
          a.messageList && a.messageList.length > 0
            ? a.messageList
                .slice() // Create a copy to avoid mutating original
                .sort((msg1, msg2) => new Date(msg2.timeSend).getTime() - new Date(msg1.timeSend).getTime())[0] // Get most recent message
            : null;
        
        // Get the last message for chat B
        const bLastMessage =
          b.messageList && b.messageList.length > 0
            ? b.messageList
                .slice() // Create a copy to avoid mutating original
                .sort((msg1, msg2) => new Date(msg2.timeSend).getTime() - new Date(msg1.timeSend).getTime())[0] // Get most recent message
            : null;

        const aTime = aLastMessage ? new Date(aLastMessage.timeSend).getTime() : 0;
        const bTime = bLastMessage ? new Date(bLastMessage.timeSend).getTime() : 0;
        
        console.log(`Chat ${a.id} last message time:`, aTime, aLastMessage?.content);
        console.log(`Chat ${b.id} last message time:`, bTime, bLastMessage?.content);
        
        return bTime - aTime; // Most recent first
      });

      setChats(sortedChats);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Function to mark messages as read for a specific chat
  const markChatAsRead = async (chatId: number) => {
    try {
      // Check if currentUserPhone is available
      if (!currentUserPhone) {
        console.log(
          "markChatAsRead: currentUserPhone not available yet, skipping"
        );
        return;
      }

      console.log(
        "markChatAsRead: Marking chat",
        chatId,
        "as read for user",
        currentUserPhone
      );

      // Use the correct endpoint format
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
          "Failed to mark chat as read:",
          response.status,
          errorText
        );
      } else {
        console.log(
          "markChatAsRead: Successfully marked chat",
          chatId,
          "as read"
        );

        // Update the local chat state to reflect read status
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id === chatId) {
              // Mark all messages in this chat as read for the current user
              const updatedMessageList = chat.messageList.map((message) => ({
                ...message,
                read:
                  message.senderPhone === currentUserPhone
                    ? message.read
                    : true,
              }));
              return { ...chat, messageList: updatedMessageList };
            }
            return chat;
          })
        );

        // Only refresh if this is not the top chat
        const isTopChat = chats.length > 0 && chats[0].id === chatId;

        if (!isTopChat) {
          setTimeout(() => {
            fetchChats();
          }, 500); // Small delay to ensure backend has processed the changes
        }
      }
    } catch (err) {
      console.error("Error marking chat as read:", err);
    }
  };

  const formatTime = (timeString: string | null): string => {
    if (!timeString) return "";

    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInHours < 48) {
      return "yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatLastSeen = (lastSeen: string | null): string => {
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

  const getLastMessage = (
    chat: Chat
  ): Message | { content: string; timeSend: null } => {
    if (!chat.messageList || chat.messageList.length === 0) {
      return { content: "No messages yet", timeSend: null };
    }

    // Sort messages by timestamp to get the actual last message
    const sortedMessages = chat.messageList
      .slice() // Create a copy to avoid mutating original
      .sort((a, b) => new Date(b.timeSend).getTime() - new Date(a.timeSend).getTime());
    
    console.log(`Chat ${chat.id} - Last message:`, sortedMessages[0]?.content, 'at', sortedMessages[0]?.timeSend);
    return sortedMessages[0];
  };

  const getUnreadCount = (chat: Chat): number => {
    try {
      if (
        !chat.messageList ||
        !Array.isArray(chat.messageList) ||
        !currentUserPhone
      )
        return 0;

      return chat.messageList.filter((message) => {
        // Check if message is unread AND not sent by current user
        return (
          message &&
          message.read === false &&
          message.senderPhone !== currentUserPhone
        );
      }).length;
    } catch (err) {
      console.error("Error in getUnreadCount:", err, chat);
      return 0;
    }
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleFloatingContactMenuOpen = () => {
    setShowFloatingContactMenu(true);
  };

  const handleFloatingContactMenuClose = () => {
    setShowFloatingContactMenu(false);
  };

  const handleContactSaved = () => {
    // Refresh chats when a contact is saved
    fetchChats();
  };

  // Handle clicking on search result to start/open chat
  const handleSearchResultClick = async (user: ChatUser) => {
    try {
      console.log("Search result click - User:", user);
      setLoading(true);

      // First, check if a chat already exists with this user
      const existingChat = chats.find((chat) => {
        // Check if this chat has any messages from the searched user
        const hasMessagesFromUser =
          chat.messageList &&
          chat.messageList.some((msg) => msg.senderPhone === user.phoneNumber);

        // Also check if the chat has the otherParticipantPhone set correctly
        const isOtherParticipant =
          chat.otherParticipantPhone === user.phoneNumber;

        console.log(`Checking chat ${chat.id} for user ${user.phoneNumber}:`, {
          hasMessagesFromUser,
          isOtherParticipant,
          otherParticipantPhone: chat.otherParticipantPhone,
          messageCount: chat.messageList?.length || 0,
        });

        return hasMessagesFromUser || isOtherParticipant;
      });

      if (existingChat) {
        console.log(
          "Search result click - Found existing chat:",
          existingChat.id
        );

        // Use the existing chat data which has the correct structure
        const displayName =
          existingChat.contactName ||
          existingChat.otherParticipantName ||
          user.fullname ||
          user.userName ||
          user.phoneNumber;

        console.log("Search result click - Using existing chat data:", {
          chatId: existingChat.id,
          displayName,
          existingChatOtherParticipantProfileImageUrl:
            existingChat.otherParticipantProfileImageUrl,
          userProfileImageUrl: user.profileImageUrl,
          finalProfileImageUrl:
            existingChat.otherParticipantProfileImageUrl ||
            user.profileImageUrl ||
            undefined,
          otherParticipantLastSeen:
            existingChat.otherParticipantLastSeen || user.lastSeen || undefined,
        });

        onChatSelect?.(
          existingChat.id,
          displayName,
          existingChat.otherParticipantProfileImageUrl ||
            user.profileImageUrl ||
            undefined,
          existingChat.otherParticipantLastSeen || user.lastSeen || undefined,
          existingChat.messageList || [],
          user.online // Pass the online status from user data
        );

        // Mark messages as read for this chat
        await markChatAsRead(existingChat.id);

        // Clear search results and input
        setSearchResults([]);
        setSearchNumber("");
        return;
      }

      // If no existing chat, create a new one
      const response = await fetch("http://localhost:8080/chats/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          otherUserPhone: user.phoneNumber,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const chatData: Chat = await response.json();
      console.log("Search result click - Chat data received:", chatData);
      console.log("Search result click - Message list:", chatData.messageList);

      // For new chats, we need to construct the data since Chat entity doesn't have all fields
      const displayName = user.fullname || user.userName || user.phoneNumber;
      const otherParticipantLastSeen = user.lastSeen;

      console.log("Search result click - Calling onChatSelect with new chat:", {
        chatId: chatData.id,
        displayName,
        profileImageUrl: user.profileImageUrl,
        otherParticipantLastSeen,
        messageListLength: chatData.messageList?.length || 0,
      });

      onChatSelect?.(
        chatData.id,
        displayName,
        user.profileImageUrl || undefined,
        otherParticipantLastSeen,
        chatData.messageList || [],
        user.online // Pass the online status from user data
      );

      // Mark messages as read for this chat
      await markChatAsRead(chatData.id);

      // Clear search results and input
      setSearchResults([]);
      setSearchNumber("");

      // Refresh chats to include the new/updated chat
      fetchChats();
    } catch (err) {
      console.error("Error starting chat:", err);
      setError(err instanceof Error ? err.message : "Failed to start chat");
    } finally {
      setLoading(false);
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

    console.log("Connecting to WebSocket for chat updates...");
    const socket = new SockJS("http://localhost:8080/ws");
    const client = Stomp.over(socket);

    client.connect(
      {
        Authorization: `Bearer ${token}`,
      },
      () => {
        console.log("WebSocket connected for chat updates");
        setStompClient(client);

        // Subscribe to user-specific messages
        client.subscribe(
          `/user/${currentUserPhone}/queue/messages`,
          (message: any) => {
            console.log("=== WebSocket message received (user queue) ===");
            console.log("Raw message:", message);
            console.log("Message body:", message.body);

            const newMessage = JSON.parse(message.body);
            console.log("Parsed message:", newMessage);

            console.log("Processing message - calling handleNewMessage");
            handleNewMessage(newMessage);
          }
        );

        // Also subscribe to general chat messages to see if we receive them
        client.subscribe(`/topic/chat/*`, (message: any) => {
          console.log("=== WebSocket message received (general topic) ===");
          console.log("Raw message:", message);
          console.log("Message body:", message.body);

          const newMessage = JSON.parse(message.body);
          console.log("Parsed message:", newMessage);

          console.log(
            "Processing message from general topic - calling handleNewMessage"
          );
          handleNewMessage(newMessage);
        });

        // Subscribe to error messages
        client.subscribe("/user/queue/errors", (message: any) => {
          const error = JSON.parse(message.body);
          console.error("WebSocket error:", error);
        });
      },
      (error: any) => {
        console.error("WebSocket connection error:", error);
      }
    );
  };

  const handleNewMessage = (newMessage: any) => {
    console.log("=== handleNewMessage called ===");
    console.log("Message chatId:", newMessage.chatId);
    console.log("Message senderPhone:", newMessage.senderPhone);
    console.log("Current user phone:", currentUserPhone);
    console.log("Chats length:", chats.length);
    console.log("Top chat ID:", chats.length > 0 ? chats[0].id : "no chats");

    // Check if user is sending a message from the top chat
    const isUserSender = newMessage.senderPhone === currentUserPhone;
    const isTopChat = chats.length > 0 && chats[0].id === newMessage.chatId;

    console.log("Is user sender:", isUserSender);
    console.log("Is top chat:", isTopChat);

    // If user is sending from the top chat, don't reload the chat list
    if (isUserSender && isTopChat) {
      console.log(
        "SKIPPING: User sending from top chat, skipping chat list update"
      );
      return;
    }

    console.log("PROCESSING: Updating chat list");

    // Update chat list with new message
    setChats((prevChats) => {
      const chatIndex = prevChats.findIndex(
        (chat) => chat.id === newMessage.chatId
      );

      console.log("Chat index found:", chatIndex);

      if (chatIndex === -1) {
        // New chat, refresh the entire list
        console.log("New chat detected, refreshing entire list");
        fetchChats();
        return prevChats;
      }

      const updatedChats = [...prevChats];
      const chat = updatedChats[chatIndex];

      console.log("Original chat message count:", chat.messageList.length);

      // Add new message to the chat
      const updatedMessageList = [...chat.messageList, newMessage];

      console.log("Updated chat message count:", updatedMessageList.length);

      // Update the chat with new message
      updatedChats[chatIndex] = {
        ...chat,
        messageList: updatedMessageList,
      };

      console.log("Before sorting - first chat ID:", updatedChats[0].id);

      // Sort chats by latest message
      const sortedChats = updatedChats.sort((a, b) => {
        // Get the last message for chat A
        const aLastMessage =
          a.messageList && a.messageList.length > 0
            ? a.messageList
                .slice() // Create a copy to avoid mutating original
                .sort((msg1, msg2) => new Date(msg2.timeSend).getTime() - new Date(msg1.timeSend).getTime())[0] // Get most recent message
            : null;
        
        // Get the last message for chat B
        const bLastMessage =
          b.messageList && b.messageList.length > 0
            ? b.messageList
                .slice() // Create a copy to avoid mutating original
                .sort((msg1, msg2) => new Date(msg2.timeSend).getTime() - new Date(msg1.timeSend).getTime())[0] // Get most recent message
            : null;

        const aTime = aLastMessage ? new Date(aLastMessage.timeSend).getTime() : 0;
        const bTime = bLastMessage ? new Date(bLastMessage.timeSend).getTime() : 0;
        
        return bTime - aTime; // Most recent first
      });

      console.log("After sorting - first chat ID:", sortedChats[0].id);
      console.log(
        "Target chat moved to top:",
        sortedChats[0].id === newMessage.chatId
      );

      return sortedChats;
    });
  };

  // Function to mark a specific message as read
  const markMessageAsRead = async (messageId: number, chatId: number) => {
    try {
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
      } else {
        // Update local state immediately
        updateChatUnreadCount(chatId, messageId);
      }
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-900">
        <div className="w-16 bg-[#1E201E] flex flex-col items-center py-4 space-y-8">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 font-bold text-lg">
            M.
          </div>
        </div>
        <div className="w-80 bg-[#000000] border-r border-gray-700 flex items-center justify-center">
          <div className="text-white">Loading chats...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-gray-900">
        <div className="w-16 bg-[#1E201E] flex flex-col items-center py-4 space-y-8">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 font-bold text-lg">
            M.
          </div>
        </div>
        <div className="w-80 bg-[#000000] border-r border-gray-700 flex items-center justify-center">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-chatbg">
      {/* Navigation Bar */}
      <div className="w-16 bg-chatbg flex flex-col items-center py-4 space-y-8">
        <ProfileAvatar
          src={user?.profileImageUrl}
          alt={currentUserName}
          size="md"
          fallbackText={currentUserName}
          showOnlineStatus={true}
          isOnline={true}
        />
        <div className="flex flex-col space-y-6">
          <button
            onClick={() => navigate("/contacts")}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Contacts"
          >
            <User size={24} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Phone size={24} />
          </button>
          <button className="p-2 text-primary2 hover:text-purple-300 transition-colors">
            <MessageCircle size={24} />
          </button>
          <button
            onClick={handleSettingsClick}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Settings size={24} />
          </button>
        </div>
        <div className="mt-auto"></div>
      </div>

      {/* Sidebar Content */}
      <div className="w-80 bg-darkbg border-r border-chatbg">
        <div className="absolute z-10 bottom-10 left-72">
          <button
            className="px-4 py-4 text-foreground flex items-center space-x-2 bg-primary2 hover:bg-primary2/75 rounded-2xl transition-all duration-300"
            onClick={handleFloatingContactMenuOpen}
          >
            <Plus className="text-black" size={30} />
          </button>
        </div>
        {/* User Profile Header */}
        <div className="p-4 border-b border-chatbg flex justify-center">
          <div className="flex items-center space-x-3 flex-col">
            <ProfileAvatar
              src={user?.profileImageUrl}
              alt={currentUserName}
              size="2xl"
              fallbackText={currentUserName}
              showOnlineStatus={true}
              isOnline={true}
              className="mb-1"
            />
            <div className="flex flex-col justify-center align-middle">
              <h2 className="text-white font-semibold">{currentUserName}</h2>
            </div>
            <p className="text-gray-400 text-sm">{currentUserEmail}</p>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <div ref={searchRef} className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                onChange={(e) => setSearchNumber(e.target.value)}
                placeholder="Search People"
                className="w-full bg-chatbg text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleFloatingContactMenuOpen}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <Plus size={16} />
              </button>

              {/* Floating search results */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-lg shadow-lg border border-gray-200 grid gap-1 max-h-[300px] overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <div
                      key={result.id || idx}
                      onClick={() => handleSearchResultClick(result)}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
                    >
                      <ProfileAvatar
                        src={result.profileImageUrl}
                        alt={
                          result.fullname ||
                          result.userName ||
                          result.phoneNumber
                        }
                        size="sm"
                        fallbackText={
                          result.fullname ||
                          result.userName ||
                          result.phoneNumber
                        }
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {result.fullname ||
                            result.userName ||
                            result.phoneNumber}
                        </span>
                        <span className="text-sm text-gray-500">
                          {result.phoneNumber || result.userName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stories */}
        {/* <div className="px-4 pb-4">
          <div className="flex space-x-4 pt-2  ">
            <h1 className="text-white text-3xl">chats</h1>
          </div>
        </div> */}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 gap-4 max-h-[840px]">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No chats yet. Start a conversation!
            </div>
          ) : (
            chats.map((chat) => {

              const lastMessage = getLastMessage(chat);
              const unreadCount = getUnreadCount(chat);

              // Use contact name if available, otherwise use phone number, otherwise use chat ID
              const displayName =
                chat.contactName ||
                chat.otherParticipantPhone ||
                `Chat #${chat.id}`;

              return (
                <div
                  key={chat.id}
                  className="flex items-center p-4 hover:bg-[#313233] cursor-pointer transition-colors"
                  onClick={async () => {
                    // Check if currentUserPhone is available
                    if (!currentUserPhone) {
                      console.log(
                        "Chat selection: currentUserPhone not available yet"
                      );
                      return;
                    }

                    console.log(
                      "Chat selection: Selecting chat",
                      chat.id,
                      "for user",
                      currentUserPhone
                    );

                    // Immediately update local state to show messages as read
                    setChats((prevChats) =>
                      prevChats.map((c) => {
                        if (c.id === chat.id) {
                          // Mark all messages in this chat as read for the current user
                          const updatedMessageList = c.messageList.map(
                            (message) => ({
                              ...message,
                              read:
                                message.senderPhone === currentUserPhone
                                  ? message.read
                                  : true,
                            })
                          );
                          return { ...c, messageList: updatedMessageList };
                        }
                        return c;
                      })
                    );

                    // Mark messages as read when chat is selected
                    await markChatAsRead(chat.id);

                    onChatSelect?.(
                      chat.id,
                      displayName,
                      chat.otherParticipantProfileImageUrl || undefined,
                      chat.otherParticipantLastSeen || undefined,
                      chat.messageList,
                      chat.otherParticipantOnline // Pass the online status from chat data
                    );
                  }}
                >
                  <div className="relative flex-shrink-0">
                    <ProfileAvatar
                      src={chat.otherParticipantProfileImageUrl}
                      alt={displayName}
                      size="lg"
                      fallbackText={displayName}
                      showOnlineStatus={chat.otherParticipantOnline}
                      isOnline={chat.otherParticipantOnline}
                    />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium truncate">
                        {displayName}
                      </h3>
                      <span className="text-gray-400 text-sm" onClick={() => console.log(chat)}>
                        
                        {formatTime(
                          "timeSend" in lastMessage
                            ? lastMessage.timeSend
                            : null
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-sm truncate">
                        {lastMessage.content}
                      </p>
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-purple-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Contact Menu */}
      {showFloatingContactMenu && (
        <FloatingContactMenu
          isOpen={showFloatingContactMenu}
          onClose={handleFloatingContactMenuClose}
          onContactSaved={handleContactSaved}
        />
      )}
    </div>
  );
}
