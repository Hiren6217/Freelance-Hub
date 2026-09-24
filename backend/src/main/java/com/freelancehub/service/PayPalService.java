package com.freelancehub.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

/**
 * Thin client for the PayPal Orders API v2 (sandbox by default).
 *
 * Flow: {@link #createOrder} creates a CAPTURE-intent order for the gross amount
 * the client owes; the client approves it in the PayPal UI; {@link #captureOrder}
 * then captures the funds into the platform's PayPal account.
 *
 * Credentials come from {@code paypal.client-id}/{@code paypal.client-secret}
 * (backed by env vars, never committed). When they are blank the service is
 * considered unconfigured and callers should surface a 503 rather than fail hard.
 */
@Service
public class PayPalService {

    private final RestTemplate restTemplate;

    @Value("${paypal.base-url:https://api-m.sandbox.paypal.com}")
    private String baseUrl;

    @Value("${paypal.client-id:}")
    private String clientId;

    @Value("${paypal.client-secret:}")
    private String clientSecret;

    public PayPalService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /** True only when both credentials are present; gate live calls on this. */
    public boolean isConfigured() {
        return clientId != null && !clientId.isBlank()
            && clientSecret != null && !clientSecret.isBlank();
    }

    /**
     * Obtains an OAuth2 access token via the client-credentials grant
     * (HTTP Basic with clientId:secret). Throws if credentials are missing/invalid.
     */
    @SuppressWarnings("unchecked")
    public String getAccessToken() {
        requireConfigured();

        String basic = Base64.getEncoder().encodeToString(
            (clientId + ":" + clientSecret).getBytes(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, "Basic " + basic);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");

        ResponseEntity<Map> response = restTemplate.exchange(
            baseUrl + "/v1/oauth2/token",
            HttpMethod.POST,
            new HttpEntity<>(form, headers),
            Map.class);

        Map<String, Object> body = response.getBody();
        if (body == null || body.get("access_token") == null) {
            throw new IllegalStateException("PayPal did not return an access token");
        }
        return body.get("access_token").toString();
    }

    /**
     * Creates a CAPTURE-intent order for a single purchase unit.
     *
     * @return the PayPal order id to hand to the frontend for approval.
     */
    @SuppressWarnings("unchecked")
    public String createOrder(BigDecimal amount, String currency, String referenceId, String description) {
        requireConfigured();
        String token = getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + token);

        String value = amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
        Map<String, Object> amountObj = Map.of(
            "currency_code", currency == null ? "USD" : currency,
            "value", value);
        Map<String, Object> purchaseUnit = new java.util.HashMap<>();
        purchaseUnit.put("amount", amountObj);
        if (referenceId != null) {
            purchaseUnit.put("reference_id", referenceId);
        }
        if (description != null) {
            purchaseUnit.put("description", description);
        }
        Map<String, Object> payload = Map.of(
            "intent", "CAPTURE",
            "purchase_units", new Object[]{purchaseUnit});

        ResponseEntity<Map> response = restTemplate.exchange(
            baseUrl + "/v2/checkout/orders",
            HttpMethod.POST,
            new HttpEntity<>(payload, headers),
            Map.class);

        Map<String, Object> body = response.getBody();
        if (body == null || body.get("id") == null) {
            throw new IllegalStateException("PayPal did not return an order id");
        }
        return body.get("id").toString();
    }

    /** Result of capturing an order: the overall status and the capture id (if any). */
    public record CaptureResult(String status, String captureId) {
        public boolean isCompleted() {
            return "COMPLETED".equalsIgnoreCase(status);
        }
    }

    /**
     * Captures a previously-approved order. On success the status is COMPLETED and
     * a capture id is returned (dug out of the nested payments.captures structure).
     */
    @SuppressWarnings("unchecked")
    public CaptureResult captureOrder(String orderId) {
        requireConfigured();
        String token = getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + token);

        ResponseEntity<Map> response = restTemplate.exchange(
            baseUrl + "/v2/checkout/orders/" + orderId + "/capture",
            HttpMethod.POST,
            new HttpEntity<>(Map.of(), headers),
            Map.class);

        Map<String, Object> body = response.getBody();
        if (body == null) {
            throw new IllegalStateException("PayPal returned an empty capture response");
        }
        String status = body.get("status") == null ? null : body.get("status").toString();
        String captureId = extractCaptureId(body);
        return new CaptureResult(status, captureId);
    }

    @SuppressWarnings("unchecked")
    private static String extractCaptureId(Map<String, Object> body) {
        Object unitsObj = body.get("purchase_units");
        if (!(unitsObj instanceof java.util.List<?> units) || units.isEmpty()) {
            return null;
        }
        Object first = units.get(0);
        if (!(first instanceof Map<?, ?> unit)) {
            return null;
        }
        Object paymentsObj = ((Map<String, Object>) unit).get("payments");
        if (!(paymentsObj instanceof Map<?, ?> payments)) {
            return null;
        }
        Object capturesObj = ((Map<String, Object>) payments).get("captures");
        if (!(capturesObj instanceof java.util.List<?> captures) || captures.isEmpty()) {
            return null;
        }
        Object capture = captures.get(0);
        if (!(capture instanceof Map<?, ?> cap)) {
            return null;
        }
        Object id = ((Map<String, Object>) cap).get("id");
        return id == null ? null : id.toString();
    }

    private void requireConfigured() {
        if (!isConfigured()) {
            throw new PayPalNotConfiguredException(
                "PayPal is not configured. Set paypal.client-id and paypal.client-secret.");
        }
    }

    /** Thrown when a PayPal call is attempted without credentials; maps to HTTP 503. */
    public static class PayPalNotConfiguredException extends RuntimeException {
        public PayPalNotConfiguredException(String message) {
            super(message);
        }
    }
}
