package com.shopifyr.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String from;
    private final String orderNotifyTo;

    public EmailService(JavaMailSender mailSender,
                        @Value("${app.mail.from}") String from,
                        @Value("${app.mail.order-notify-to}") String orderNotifyTo) {
        this.mailSender = mailSender;
        this.from = from;
        this.orderNotifyTo = orderNotifyTo;
    }

    public void sendOrderConfirmationEmail(String to, Long orderId, double amount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to != null ? to : orderNotifyTo);
        message.setSubject("Your Shopifyr order #" + orderId);
        message.setText("Thank you for your order.\n\nOrder ID: " + orderId + "\nTotal: $" + amount);
        mailSender.send(message);
    }

    public void sendOrderStatusUpdateEmail(String to, Long orderId, String status) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to != null ? to : orderNotifyTo);
        message.setSubject("Order #" + orderId + " status updated");
        message.setText("Your order status is now: " + status);
        mailSender.send(message);
    }
}
