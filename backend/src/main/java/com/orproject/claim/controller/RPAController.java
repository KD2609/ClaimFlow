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

    @PostMapping({"/run/{claimId}", "/process/{claimId}"})
    public ResponseEntity<RPARunResultDto> executeSingle(
            @PathVariable Long claimId,
            @RequestParam(required = false) String botId,
            @RequestParam(required = false) Double botHourlyCost,
            @RequestBody(required = false) RPABatchRequest body) {
        String effectiveBotId = (botId != null && !botId.isBlank())
                ? botId
                : (body != null && body.getBotId() != null && !body.getBotId().isBlank() ? body.getBotId() : "RPA-BOT-01");
        Double effectiveHourlyCost = (botHourlyCost != null)
                ? botHourlyCost
                : (body != null && body.getBotHourlyCost() != null ? body.getBotHourlyCost() : 4.20);
        RPARunResultDto result = rpaExecutionService.processSingleClaim(claimId, effectiveBotId, effectiveHourlyCost);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/logs")
    public ResponseEntity<Page<RPAExecutionLog>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(rpaExecutionService.getExecutionLogs(pageable));
    }

    @GetMapping({"/recent-logs", "/logs/recent"})
    public ResponseEntity<List<RPAExecutionLog>> getRecentLogs() {
        return ResponseEntity.ok(rpaExecutionService.getRecentLogs());
    }
}
