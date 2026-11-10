package com.orproject.claim.controller;

import com.orproject.claim.dto.SimulationRequestDto;
import com.orproject.claim.dto.SimulationResponseDto;
import com.orproject.claim.service.SimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @PostMapping("/run")
    public ResponseEntity<SimulationResponseDto> runSimulation(@RequestBody(required = false) SimulationRequestDto request) {
        if (request == null) {
            request = new SimulationRequestDto();
        }
        SimulationResponseDto result = simulationService.runSimulation(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/experiments")
    public ResponseEntity<Map<String, Object>> getExperiments() {
        return ResponseEntity.ok(simulationService.getSensitivityExperiments());
    }

    @GetMapping("/engine-status")
    public ResponseEntity<Map<String, String>> getEngineStatus() {
        return ResponseEntity.ok(simulationService.getEngineStatus());
    }
}
