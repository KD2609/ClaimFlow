package com.orproject.claim.controller;

import com.orproject.claim.dto.ManualDecisionRequest;
import com.orproject.claim.dto.ManualStageProgressRequest;
import com.orproject.claim.model.InsuranceClaim;
import com.orproject.claim.service.ManualProcessingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manual")
public class ManualProcessingController {

    private final ManualProcessingService manualProcessingService;

    public ManualProcessingController(ManualProcessingService manualProcessingService) {
        this.manualProcessingService = manualProcessingService;
    }

    @PostMapping("/progress")
    public ResponseEntity<InsuranceClaim> progressStage(@RequestBody ManualStageProgressRequest request) {
        InsuranceClaim claim = manualProcessingService.progressStage(request);
        return ResponseEntity.ok(claim);
    }

    @PostMapping("/decision")
    public ResponseEntity<InsuranceClaim> submitDecision(@RequestBody ManualDecisionRequest request) {
        InsuranceClaim claim = manualProcessingService.submitDecision(request);
        return ResponseEntity.ok(claim);
    }

    @GetMapping("/history/{claimId}")
    public ResponseEntity<List<Map<String, Object>>> getHistory(@PathVariable Long claimId) {
        return ResponseEntity.ok(manualProcessingService.getStageHistory(claimId));
    }
}
