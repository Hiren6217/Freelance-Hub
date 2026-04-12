package com.freelancehub.controller;

import com.freelancehub.model.Message;
import com.freelancehub.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @GetMapping("/receiver/{receiverId}")
    public ResponseEntity<List<Message>> getMessagesByReceiver(@PathVariable Long receiverId) {
        return ResponseEntity.ok(messageRepository.findByReceiverIdOrderByCreatedAtDesc(receiverId));
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> requestData) {
        Map<String, String> response = new HashMap<>();

        try {
            Object senderIdValue = requestData.get("senderId");
            Object receiverIdValue = requestData.get("receiverId");
            Object contentValue = requestData.get("content");

            if (senderIdValue == null || receiverIdValue == null || contentValue == null) {
                response.put("error", "senderId, receiverId, and content are required");
                return ResponseEntity.badRequest().body(response);
            }

            String content = contentValue.toString().trim();
            if (content.isEmpty()) {
                response.put("error", "Message content cannot be empty");
                return ResponseEntity.badRequest().body(response);
            }

            Message message = new Message();
            message.setSenderId(Long.valueOf(senderIdValue.toString()));
            message.setReceiverId(Long.valueOf(receiverIdValue.toString()));
            message.setContent(content);

            return ResponseEntity.status(HttpStatus.CREATED).body(messageRepository.save(message));
        } catch (Exception e) {
            response.put("error", "Failed to send message: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
