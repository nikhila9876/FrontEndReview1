package com.fsad.portal.service;

import com.fsad.portal.dto.FeedbackDto;
import com.fsad.portal.dto.MilestoneDto;
import com.fsad.portal.dto.ProfileDto;
import com.fsad.portal.dto.ProfileRequestDto;
import com.fsad.portal.dto.StudentDashboardDto;

import java.util.List;

public interface StudentService {
    StudentDashboardDto getDashboard();
    List<MilestoneDto> getOwnMilestones();
    List<FeedbackDto> getOwnFeedbacks();
    ProfileDto getOwnProfile();
    ProfileDto updateOwnProfile(ProfileRequestDto request);
}
