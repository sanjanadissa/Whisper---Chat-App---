package com.example.Whisper.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Whisper.dto.StartChatRequest;
import com.example.Whisper.model.Chat;
import com.example.Whisper.model.Message;
import com.example.Whisper.service.ChatService;

@RestController
@RequestMapping("/chats")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/start")
    public ResponseEntity<Chat> startChat(
            Authentication auth,
            @RequestBody StartChatRequest request) {
        Chat chat = chatService.startChat(auth.getName(), request.getOtherUserPhone());
        return ResponseEntity.ok(chat);
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<Map<String, List<Message>>> getMessages(
            @PathVariable Long chatId,
            Authentication auth) {

        Map<String, List<Message>> result = chatService.getMessageList(chatId, auth.getName());
        return ResponseEntity.ok(result);
    }

}
