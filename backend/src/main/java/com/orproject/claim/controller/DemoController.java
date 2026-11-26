package com.orproject.claim.controller;

import com.orproject.claim.service.DataSeederService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/demo")
public class DemoController {

    private final DataSeederService dataSeederService;

    public DemoController(DataSeederService dataSeederService) {
        this.dataSeederService = dataSeederService;
    }

    @PostMapping("/seed")
    public ResponseEntity<Map<String, Object>> seedDemoData(
            @RequestParam(defaultValue = "false") boolean force) {
        Map<String, Object> result = dataSeederService.seedDemoData(force);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getDemoStatus() {
        boolean active = dataSeederService.isDemoDataActive();
        return ResponseEntity.ok(Map.of(
                "demoDataActive", active,
                "targetClaims", DataSeederService.TARGET_DEMO_CLAIMS,
                "claimPrefix", DataSeederService.DEMO_CLAIM_PREFIX
        ));
    }
}

