package com.freelancehub.controller;

import com.freelancehub.model.Payment;
import com.freelancehub.service.PayPalService;
import com.freelancehub.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Platform payment endpoints. Left open (like the rest of the API) so a suspended
 * client can still clear their dues and get their account reactivated.
 */
@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // Start a PayPal order for a due payment; returns the order id for the PayPal Buttons.
    @PostMapping("/{id}/create-order")
    public ResponseEntity<?> createOrder(@PathVariable Long id) {
        try {
            Payment payment = paymentService.initiateOrder(id);
            Map<String, Object> body = new HashMap<>();
            body.put("orderId", payment.getProviderOrderId());
            body.put("paymentId", payment.getId());
            body.put("amount", payment.getAmount());
            body.put("currency", payment.getCurrency());
            return ResponseEntity.ok(body);
        } catch (PayPalService.PayPalNotConfiguredException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Payment gateway not configured", "detail", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("error", "Failed to create PayPal order: " + e.getMessage()));
        }
    }

    // Capture an approved PayPal order; on success the payment becomes PAID.
    @PostMapping("/{id}/capture")
    public ResponseEntity<?> capture(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        try {
            String orderId = body == null ? null : body.get("orderId");
            Payment payment = paymentService.confirmCapture(id, orderId);
            return ResponseEntity.ok(payment);
        } catch (PayPalService.PayPalNotConfiguredException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Payment gateway not configured", "detail", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("error", "Failed to capture PayPal order: " + e.getMessage()));
        }
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<?> getByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(paymentService.getClientPayments(clientId));
    }

    @GetMapping("/developer/{developerId}")
    public ResponseEntity<?> getByDeveloper(@PathVariable Long developerId) {
        return ResponseEntity.ok(paymentService.getDeveloperPayments(developerId));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<?> getByContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(paymentService.getContractPayments(contractId));
    }
}
