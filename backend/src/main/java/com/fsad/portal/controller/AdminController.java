package com.fsad.portal.controller;

import com.fsad.portal.dto.ApiResponseDto;
import com.fsad.portal.dto.FeedbackDto;
import com.fsad.portal.dto.FeedbackRequestDto;
import com.fsad.portal.dto.MilestoneDto;
import com.fsad.portal.dto.MilestoneRequestDto;
import com.fsad.portal.dto.ProjectDto;
import com.fsad.portal.dto.UserDto;
import com.fsad.portal.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/students")
    public ResponseEntity<List<UserDto>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @PostMapping("/students/{studentId}/milestones")
    public ResponseEntity<MilestoneDto> addMilestoneToStudent(
            @PathVariable Long studentId,
            @Valid @RequestBody MilestoneRequestDto request
    ) {
        MilestoneDto createdMilestone = adminService.addMilestoneToStudent(studentId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMilestone);
    }

    @PutMapping("/milestones/{milestoneId}")
    public ResponseEntity<MilestoneDto> updateMilestone(
            @PathVariable Long milestoneId,
            @Valid @RequestBody MilestoneRequestDto request
    ) {
        return ResponseEntity.ok(adminService.updateMilestone(milestoneId, request));
    }

    @DeleteMapping("/milestones/{milestoneId}")
    public ResponseEntity<ApiResponseDto> deleteMilestone(@PathVariable Long milestoneId) {
        adminService.deleteMilestone(milestoneId);
        return ResponseEntity.ok(new ApiResponseDto("Milestone deleted successfully"));
    }

    @PostMapping("/students/{studentId}/feedbacks")
    public ResponseEntity<FeedbackDto> giveFeedbackToStudent(
            @PathVariable Long studentId,
            @Valid @RequestBody FeedbackRequestDto request
    ) {
        FeedbackDto createdFeedback = adminService.giveFeedbackToStudent(studentId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFeedback);
    }

    @GetMapping("/feedbacks")
    public ResponseEntity<List<FeedbackDto>> getAllFeedbacks() {
        return ResponseEntity.ok(adminService.getAllFeedbacks());
    }

    @PutMapping("/projects/approve/{projectId}")
    public ResponseEntity<ProjectDto> approveProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(adminService.approveProject(projectId));
    }
}
