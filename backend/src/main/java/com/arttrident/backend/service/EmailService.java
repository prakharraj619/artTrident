package com.arttrident.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(String to, String name, String url) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Verify your artTrident Account");

            String content = buildHtmlEmail(name, url);
            helper.setText(content, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification email.", e);
        }
    }

    private String buildHtmlEmail(String name, String url) {
        return "<html>" +
                "<body style='font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; color: #0f172a;'>" +
                "<div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);'>" +
                "<h1 style='color: #0f172a; font-size: 24px; margin-bottom: 20px;'>Welcome to artTrident, " + name + "!</h1>" +
                "<p style='font-size: 16px; line-height: 1.5; margin-bottom: 24px;'>" +
                "We're thrilled to have you join our premium artist community. Please verify your email address to unlock full access to the platform." +
                "</p>" +
                "<a href='" + url + "' style='display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin-bottom: 24px;'>" +
                "Verify Email Address" +
                "</a>" +
                "<p style='font-size: 14px; color: #64748b;'>" +
                "If you didn't create an account, you can safely ignore this email.<br><br>" +
                "Best,<br>The artTrident Team" +
                "</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}
