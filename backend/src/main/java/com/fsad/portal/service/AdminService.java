package com.fsad.portal.service;

import com.fsad.portal.dto.FeedbackDto;
import com.fsad.portal.dto.FeedbackRequestDto;
import com.fsad.portal.dto.MilestoneDto;
import com.fsad.portal.dto.MilestoneRequestDto;
import com.fsad.portal.dto.ProjectDto;
import com.fsad.portal.dto.UserDto;

import java.util.List;

public interface AdminService {
    List<UserDto> getAllStudents();
    MilestoneDto addMilestoneToStudent(Long studentId, MilestoneRequestDto request);
    MilestoneDto updateMilestone(Long milestoneId, MilestoneRequestDto request);
    void deleteMilestone(Long milestoneId);
    FeedbackDto giveFeedbackToStudent(Long studentId, FeedbackRequestDto request);
    List<FeedbackDto> getAllFeedbacks();
    ProjectDto approveProject(Long projectId);
}
