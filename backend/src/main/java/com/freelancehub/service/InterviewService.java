package com.freelancehub.service;

import com.freelancehub.model.Interview;
import com.freelancehub.model.Message;
import com.freelancehub.model.Notification;
import com.freelancehub.repository.InterviewRepository;
import com.freelancehub.repository.MessageRepository;
import com.freelancehub.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

/**
 * Owns the interview lifecycle: a client schedules a Google Meet interview with
 * a developer, and both parties are kept in the loop via a notification and a
 * chat message that carries the join link and time.
 */
@Service
public class InterviewService {

    public static final String STATUS_SCHEDULED = "SCHEDULED";
    public static final String STATUS_CANCELLED = "CANCELLED";
    public static final String STATUS_COMPLETED = "COMPLETED";
    private static final List<String> STATUSES =
        Arrays.asList(STATUS_SCHEDULED, STATUS_CANCELLED, STATUS_COMPLETED);

    private static final DateTimeFormatter DISPLAY =
        DateTimeFormatter.ofPattern("EEE, MMM d yyyy 'at' h:mm a");

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private MessageRepository messageRepository;

    public static boolean isValidStatus(String status) {
        return status != null && STATUSES.contains(status.toUpperCase());
    }

    /** Creates an interview and notifies the developer with the Meet link and time. */
    public Interview scheduleInterview(Interview interview) {
        interview.setStatus(STATUS_SCHEDULED);
        Interview saved = interviewRepository.save(interview);
        notifyDeveloperOfInterview(saved);
        return saved;
    }

    /** Transitions an interview to a new status and notifies the developer. */
    public Interview updateStatus(Interview interview, String newStatus) {
        String normalized = newStatus.toUpperCase();
        String previous = interview.getStatus();
        interview.setStatus(normalized);
        Interview saved = interviewRepository.save(interview);

        if (!normalized.equals(previous) && STATUS_CANCELLED.equals(normalized)) {
            Notification notification = new Notification();
            notification.setUserId(saved.getDeveloperId());
            notification.setType("INTERVIEW_CANCELLED");
            notification.setTitle("Interview cancelled");
            notification.setBody("The client cancelled the interview scheduled for " + when(saved) + ".");
            notificationRepository.save(notification);

            Message message = new Message();
            message.setSenderId(saved.getClientId());
            message.setReceiverId(saved.getDeveloperId());
            message.setContent("I've had to cancel our interview that was set for " + when(saved) + ". I'll follow up to reschedule.");
            messageRepository.save(message);
        }
        return saved;
    }

    private void notifyDeveloperOfInterview(Interview interview) {
        String when = when(interview);

        Notification notification = new Notification();
        notification.setUserId(interview.getDeveloperId());
        notification.setType("INTERVIEW_SCHEDULED");
        notification.setTitle("Interview scheduled");
        notification.setBody("The client scheduled a Google Meet interview for " + when
            + ". Join link: " + interview.getMeetingLink());
        notificationRepository.save(notification);

        StringBuilder content = new StringBuilder();
        content.append("I'd like to interview you over Google Meet on ").append(when).append(".\n")
            .append("Join link: ").append(interview.getMeetingLink());
        if (interview.getNote() != null && !interview.getNote().isBlank()) {
            content.append("\n\n").append(interview.getNote().trim());
        }

        Message message = new Message();
        message.setSenderId(interview.getClientId());
        message.setReceiverId(interview.getDeveloperId());
        message.setContent(content.toString());
        messageRepository.save(message);
    }

    private String when(Interview interview) {
        LocalDateTime at = interview.getScheduledAt();
        return at == null ? "the agreed time" : at.format(DISPLAY);
    }
}
