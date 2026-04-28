package com.fsad.portal.controller;

import com.fsad.portal.dto.FeedbackDto;
import com.fsad.portal.dto.MilestoneDto;
import com.fsad.portal.dto.ProfileDto;
import com.fsad.portal.dto.ProfileRequestDto;
import com.fsad.portal.dto.StudentDashboardDto;
import com.fsad.portal.dto.SuccessResponseDto;
import com.fsad.portal.service.StudentService;
import com.fsad.portal.service.impl.AuthenticatedUserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private static final Logger log = LoggerFactory.getLogger(StudentController.class);

    private final StudentService studentService;
    private final AuthenticatedUserService authenticatedUserService;

    public StudentController(StudentService studentService, AuthenticatedUserService authenticatedUserService) {
        this.studentService = studentService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<SuccessResponseDto<StudentDashboardDto>> getDashboard() {
        Long userId = authenticatedUserService.getCurrentUser().getId();
        log.info("GET /api/student/dashboard called for userId={}", userId);
        return ResponseEntity.ok(SuccessResponseDto.ok(studentService.getDashboard()));
    }

    @GetMapping("/milestones")
    public ResponseEntity<List<MilestoneDto>> getOwnMilestones() {
        Long userId = authenticatedUserService.getCurrentUser().getId();
        log.info("GET /api/student/milestones called for userId={}", userId);
        return ResponseEntity.ok(studentService.getOwnMilestones());
    }

    @GetMapping("/feedbacks")
    public ResponseEntity<List<FeedbackDto>> getOwnFeedbacks() {
        Long userId = authenticatedUserService.getCurrentUser().getId();
        log.info("GET /api/student/feedbacks called for userId={}", userId);
        return ResponseEntity.ok(studentService.getOwnFeedbacks());
    }

    @GetMapping("/profile")
    public ResponseEntity<SuccessResponseDto<ProfileDto>> getOwnProfile() {
        Long userId = authenticatedUserService.getCurrentUser().getId();
        log.info("GET /api/student/profile called for userId={}", userId);
        return ResponseEntity.ok(SuccessResponseDto.ok(studentService.getOwnProfile()));
    }

    @PutMapping("/profile")
    public ResponseEntity<SuccessResponseDto<ProfileDto>> updateOwnProfile(@Valid @RequestBody ProfileRequestDto request) {
        Long userId = authenticatedUserService.getCurrentUser().getId();
        log.info("PUT /api/student/profile called for userId={}", userId);
        return ResponseEntity.ok(SuccessResponseDto.ok(studentService.updateOwnProfile(request)));
    }
}
