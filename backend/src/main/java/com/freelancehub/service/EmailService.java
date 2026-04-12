package com.freelancehub.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String to, String code, String purpose) {
        String subject = "Your FreelanceHub OTP code";
        String text = "Your OTP code for " + purpose + " is: " + code + "\n\n" +
                "Enter this code in FreelanceHub to continue. The code expires in 10 minutes.";

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(to);
        mailMessage.setSubject(subject);
        mailMessage.setText(text);

        mailSender.send(mailMessage);
    }
}
