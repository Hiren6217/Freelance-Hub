package com.freelancehub.controller;

import com.freelancehub.model.Message;
import com.freelancehub.model.User;
import com.freelancehub.repository.MessageRepository;
import com.freelancehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/receiver/{receiverId}")
    public ResponseEntity<List<Message>> getMessagesByReceiver(@PathVariable Long receiverId) {
        return ResponseEntity.ok(messageRepository.findByReceiverIdOrderByCreatedAtDesc(receiverId));
    }

    // Full two-way conversation between two users, in chat order (oldest first).
    @GetMapping("/conversation")
    public ResponseEntity<List<Message>> getConversation(@RequestParam Long userA, @RequestParam Long userB) {
        return ResponseEntity.ok(messageRepository.findConversation(userA, userB));
    }

    // Inbox: one summary row per person the user has exchanged messages with, newest first.
    @GetMapping("/threads/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getThreads(@PathVariable Long userId) {
        List<Message> all = messageRepository.findAllForUser(userId); // newest first
        LinkedHashMap<Long, Message> lastByOther = new LinkedHashMap<>();
        Map<Long, Integer> unread = new HashMap<>();

        for (Message m : all) {
            Long other = userId.equals(m.getSenderId()) ? m.getReceiverId() : m.getSenderId();
            if (other == null) continue;
            lastByOther.putIfAbsent(other, m); // first seen wins => most recent, list is desc
            if (userId.equals(m.getReceiverId()) && !Boolean.TRUE.equals(m.getReadStatus())) {
                unread.merge(other, 1, Integer::sum);
            }
        }

        Map<Long, User> users = new HashMap<>();
        userRepository.findAllById(lastByOther.keySet()).forEach(u -> users.put(u.getId(), u));

        List<Map<String, Object>> threads = new ArrayList<>();
        for (Map.Entry<Long, Message> entry : lastByOther.entrySet()) {
            Long other = entry.getKey();
            Message m = entry.getValue();
            User u = users.get(other);
            Map<String, Object> t = new HashMap<>();
            t.put("otherUserId", other);
            t.put("otherUserName", u != null ? u.getName() : ("User #" + other));
            t.put("otherUserRole", u != null ? u.getRole() : null);
            t.put("lastMessage", m.getContent());
            t.put("lastMessageAt", m.getCreatedAt());
            t.put("lastMessageMine", userId.equals(m.getSenderId()));
            t.put("unreadCount", unread.getOrDefault(other, 0));
            threads.add(t);
        }
        return ResponseEntity.ok(threads);
    }

    // Marks the thread from otherUserId as read for userId (called when a thread is opened).
    @PutMapping("/read")
    public ResponseEntity<?> markConversationRead(@RequestParam Long userId, @RequestParam Long otherUserId) {
        int updated = messageRepository.markConversationRead(userId, otherUserId);
        Map<String, Object> response = new HashMap<>();
        response.put("updated", updated);
        return ResponseEntity.ok(response);
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
