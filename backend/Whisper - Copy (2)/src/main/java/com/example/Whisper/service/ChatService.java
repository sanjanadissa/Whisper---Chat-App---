    package com.example.Whisper.service;

    import com.example.Whisper.model.Chat;
    import com.example.Whisper.model.Message;
    import com.example.Whisper.model.User;
    import com.example.Whisper.repositoty.ChatRepository;
    import com.example.Whisper.repositoty.UserRepository;
    import jakarta.transaction.Transactional;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.stereotype.Service;

    import java.util.*;
    import java.util.stream.Collectors;

    @Service
    public class ChatService {

        private final ChatRepository chatRepository;
        private final UserRepository userRepository;

        @Autowired
        public ChatService(ChatRepository chatRepository, UserRepository userRepository) {
            this.chatRepository = chatRepository;
            this.userRepository = userRepository;
        }

        public Chat findChatByExactParticipants(Set<User> targetUsers) {
            Set<Long> userIds = targetUsers.stream()
                    .map(User::getId)
                    .collect(Collectors.toSet());

            List<Chat> possibleChats = chatRepository.findChatsByParticipantIds(userIds, userIds.size());

            for (Chat chat : possibleChats) {
                Set<Long> chatUserIds = chat.getParticipents()
                        .stream()
                        .map(User::getId)
                        .collect(Collectors.toSet());

                if (chatUserIds.equals(userIds)) {
                    return chat;
                }
            }

            return null;
        }

        @Transactional
        public Chat startChat(String userPhone, String otherPhone) {
            User user = userRepository.findByPhoneNumber(userPhone)
                    .orElseThrow(() -> new RuntimeException("User not Found"));
            User otherUser = userRepository.findByPhoneNumber(otherPhone)
                    .orElseThrow(() -> new RuntimeException("User not Found"));

            Set<User> participants = new HashSet<>(Arrays.asList(user, otherUser));
            Chat existingChat = findChatByExactParticipants(participants);
            if (existingChat == null) {
                try {
                    // Step 1: Create and save chat without participants
                    Chat chat = new Chat();
                    Chat savedChat = chatRepository.saveAndFlush(chat);

                    // Step 2: Set participants and update
                    savedChat.setParticipents(participants);
                    Chat finalChat = chatRepository.saveAndFlush(savedChat);

                    return finalChat;

                } catch (Exception e) {
                    throw new RuntimeException("Failed to create chat: " + e.getMessage(), e);
                }
            }
            return existingChat;
        }


        public Map<String, List<Message>> getMessageList(Long chatId, String phone) {
            Chat chat = chatRepository.findById(chatId)
                    .orElseThrow(() -> new RuntimeException("Chat not found"));

            List<Message> allMessages = chat.getMessageList();

            // List for messages sent by this user
            List<Message> sentByUser = new ArrayList<>();

            // List for messages sent by others
            List<Message> sentByOthers = new ArrayList<>();

            for (Message message : allMessages) {
                if (message.getSender().getPhoneNumber().equals(phone)) {
                    sentByUser.add(message);
                } else {
                    sentByOthers.add(message);
                }
            }

            Map<String, List<Message>> result = new HashMap<>();
            result.put("sentByUser", sentByUser);
            result.put("sentByOthers", sentByOthers);

            return result;
        }

    }
