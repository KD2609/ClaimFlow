package com.orproject.claim.controller;

import com.orproject.claim.dto.RPABatchRequest;
import com.orproject.claim.dto.RPABatchResponse;
import com.orproject.claim.dto.RPARunResultDto;
import com.orproject.claim.model.RPAExecutionLog;
import com.orproject.claim.service.RPAExecutionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rpa")
public class RPAController {

    private final RPAExecutionService rpaExecutionService;

    public RPAController(RPAExecutionService rpaExecutionService) {
        this.rpaExecutionService = rpaExecutionService;
    }

    @PostMapping("/batch")
    public ResponseEntity<RPABatchResponse> executeBatch(@RequestBody(required = false) RPABatchRequest request) {
        if (request == null) {
            request = new RPABatchRequest();
        }
        RPABatchResponse response = rpaExecutionService.processBatch(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/run/{claimId}")
    public ResponseEntity<RPARunResultDto> executeSingle(
            @PathVariable Long claimId,
            @RequestParam(defaultValue = "RPA-BOT-01") String botId,
            @RequestParam(defaultValue = "4.20") Double botHourlyCost) {
        RPARunResultDto result = rpaExecutionService.processSingleClaim(claimId, botId, botHourlyCost);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/logs")
    public ResponseEntity<Page<RPAExecutionLog>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(rpaExecutionService.getExecutionLogs(pageable));
    }

    @GetMapping("/recent-logs")
    public ResponseEntity<List<RPAExecutionLog>> getRecentLogs() {
        return ResponseEntity.ok(rpaExecutionService.getRecentLogs());
    }
}
