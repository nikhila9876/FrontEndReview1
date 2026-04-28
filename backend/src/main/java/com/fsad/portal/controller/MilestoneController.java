package com.fsad.portal.controller;

import com.fsad.portal.dto.MilestoneDto;
import com.fsad.portal.service.MilestoneService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/milestones")
public class MilestoneController {

    private final MilestoneService milestoneService;

    public MilestoneController(MilestoneService milestoneService) {
        this.milestoneService = milestoneService;
    }

    @GetMapping("/student/{id}")
    public ResponseEntity<List<MilestoneDto>> getMilestonesByStudentId(@PathVariable Long id) {
        return ResponseEntity.ok(milestoneService.getMilestonesByStudentId(id));
    }
}
