package com.freelancehub.controller;

import com.freelancehub.model.Contract;
import com.freelancehub.repository.ContractRepository;
import com.freelancehub.repository.JobRepository;
import com.freelancehub.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "http://localhost:3000")
public class ContractController {

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private ContractService contractService;

    @Autowired
    private JobRepository jobRepository;

    // Create the final contract between a client and a developer (client action).
    @PostMapping
    public ResponseEntity<?> createContract(@RequestBody Map<String, Object> requestData) {
        Map<String, String> response = new HashMap<>();

        try {
            Long jobId = parseLong(requestData.get("jobId"));
            Long clientId = parseLong(requestData.get("clientId"));
            Long developerId = parseLong(requestData.get("developerId"));
            Long applicationId = parseLong(requestData.get("applicationId"));
            String billingType = asString(requestData.get("billingType"));
            BigDecimal amount = parseAmount(requestData.get("amount"));

            if (jobId == null || clientId == null || developerId == null) {
                response.put("error", "jobId, clientId, and developerId are required");
                return ResponseEntity.badRequest().body(response);
            }
            if (!ContractService.isValidBillingType(billingType)) {
                response.put("error", "Invalid billingType. Must be: HOURLY, MONTHLY, or PROJECT");
                return ResponseEntity.badRequest().body(response);
            }
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                response.put("error", "amount must be a positive number");
                return ResponseEntity.badRequest().body(response);
            }
            if (!jobRepository.existsById(jobId)) {
                response.put("error", "Job not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            if (applicationId != null && contractRepository.existsByApplicationId(applicationId)) {
                response.put("error", "A contract already exists for this application");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            Contract contract = new Contract();
            contract.setJobId(jobId);
            contract.setClientId(clientId);
            contract.setDeveloperId(developerId);
            contract.setApplicationId(applicationId);
            contract.setBillingType(billingType);
            contract.setAmount(amount);
            contract.setCurrency(asString(requestData.get("currency")));
            contract.setTitle(asString(requestData.get("title")));
            contract.setDescription(asString(requestData.get("description")));

            Contract saved = contractService.createContract(contract);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            response.put("error", "Failed to create contract: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Contracts for a client (recruiter)
    @GetMapping("/client/{clientId}")
    public ResponseEntity<?> getByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(contractRepository.findByClientIdOrderByCreatedAtDesc(clientId));
    }

    // Contracts for a hired developer
    @GetMapping("/developer/{developerId}")
    public ResponseEntity<?> getByDeveloper(@PathVariable Long developerId) {
        return ResponseEntity.ok(contractRepository.findByDeveloperIdOrderByCreatedAtDesc(developerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return contractRepository.findById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Contract not found")));
    }

    // Look up whether a contract already exists for an accepted application
    @GetMapping("/application/{applicationId}")
    public ResponseEntity<?> getByApplication(@PathVariable Long applicationId) {
        return contractRepository.findByApplicationId(applicationId)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "No contract for this application")));
    }

    // Update contract status. Developer accepting -> ACTIVE (finalizes the contract).
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> requestData) {
        Map<String, String> response = new HashMap<>();
        try {
            String newStatus = requestData.get("status");
            if (!ContractService.isValidStatus(newStatus)) {
                response.put("error", "Invalid status. Must be: PENDING, ACTIVE, COMPLETED, or CANCELLED");
                return ResponseEntity.badRequest().body(response);
            }

            Contract contract = contractRepository.findById(id).orElse(null);
            if (contract == null) {
                response.put("error", "Contract not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Contract updated = contractService.updateStatus(contract, newStatus);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            response.put("error", "Failed to update contract: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Total platform fees collected from finalized (ACTIVE/COMPLETED) contracts.
    @GetMapping("/platform-fees")
    public ResponseEntity<?> platformFees() {
        List<Contract> contracts = contractRepository.findAll();
        BigDecimal total = contracts.stream()
            .filter(c -> "ACTIVE".equals(c.getStatus()) || "COMPLETED".equals(c.getStatus()))
            .map(Contract::getPlatformFee)
            .filter(fee -> fee != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2, RoundingMode.HALF_UP);

        Map<String, Object> body = new HashMap<>();
        body.put("totalPlatformFees", total);
        body.put("feeRate", ContractService.PLATFORM_FEE_RATE);
        return ResponseEntity.ok(body);
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

    private static String asString(Object value) {
        return value == null ? null : value.toString();
    }
}
