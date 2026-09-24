package com.freelancehub.controller;

import com.freelancehub.model.Contract;
import com.freelancehub.model.TimeLog;
import com.freelancehub.repository.ContractRepository;
import com.freelancehub.service.ContractService;
import com.freelancehub.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * Time logging for HOURLY contracts. Each logged entry generates a DUE payment
 * the client must release through the platform (see PaymentService.logHour).
 */
@RestController
@RequestMapping("/api/time-logs")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class TimeLogController {

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private PaymentService paymentService;

    // Developer logs worked hours on an active HOURLY contract.
    @PostMapping
    public ResponseEntity<?> logHours(@RequestBody Map<String, Object> requestData) {
        Map<String, String> response = new HashMap<>();
        try {
            Long contractId = parseLong(requestData.get("contractId"));
            if (contractId == null) {
                response.put("error", "contractId is required");
                return ResponseEntity.badRequest().body(response);
            }

            Contract contract = contractRepository.findById(contractId).orElse(null);
            if (contract == null) {
                response.put("error", "Contract not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            if (!ContractService.BILLING_HOURLY.equalsIgnoreCase(contract.getBillingType())) {
                response.put("error", "Time can only be logged on HOURLY contracts");
                return ResponseEntity.badRequest().body(response);
            }
            if (!ContractService.STATUS_ACTIVE.equalsIgnoreCase(contract.getStatus())) {
                response.put("error", "Contract must be ACTIVE to log time");
                return ResponseEntity.badRequest().body(response);
            }

            BigDecimal hours = parseAmount(requestData.get("hours"));
            String description = asString(requestData.get("description"));
            LocalDate workedOn = parseDate(requestData.get("workedOn"));

            TimeLog saved = paymentService.logHour(contract, hours, description, workedOn);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            response.put("error", "Failed to log time: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<?> getByContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(paymentService.getContractTimeLogs(contractId));
    }

    private static Long parseLong(Object value) {
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        return Long.valueOf(value.toString().trim());
    }

    private static BigDecimal parseAmount(Object value) {
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        return new BigDecimal(value.toString().trim());
    }

    private static LocalDate parseDate(Object value) {
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        return LocalDate.parse(value.toString().trim());
    }

    private static String asString(Object value) {
        return value == null ? null : value.toString();
    }
}
