package com.fsad.portal.service;

import com.fsad.portal.dto.MilestoneDto;

import java.util.List;

public interface MilestoneService {
    List<MilestoneDto> getMilestonesByStudentId(Long studentId);
}
