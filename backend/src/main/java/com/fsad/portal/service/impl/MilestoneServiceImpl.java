package com.fsad.portal.service.impl;

import com.fsad.portal.dto.MilestoneDto;
import com.fsad.portal.exception.BadRequestException;
import com.fsad.portal.exception.ResourceNotFoundException;
import com.fsad.portal.exception.UnauthorizedException;
import com.fsad.portal.model.Milestone;
import com.fsad.portal.model.Role;
import com.fsad.portal.model.User;
import com.fsad.portal.repository.MilestoneRepository;
import com.fsad.portal.repository.UserRepository;
import com.fsad.portal.service.MilestoneService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class MilestoneServiceImpl implements MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final AuthenticatedUserService authenticatedUserService;

    public MilestoneServiceImpl(MilestoneRepository milestoneRepository,
                                UserRepository userRepository,
                                ModelMapper modelMapper,
                                AuthenticatedUserService authenticatedUserService) {
        this.milestoneRepository = milestoneRepository;
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
        this.authenticatedUserService = authenticatedUserService;
    }

    @Override
    public List<MilestoneDto> getMilestonesByStudentId(Long studentId) {
        User currentUser = authenticatedUserService.getCurrentUser();
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        if (student.getRole() != Role.STUDENT) {
            throw new BadRequestException("User with id " + studentId + " is not a student");
        }

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isSelfStudent = currentUser.getRole() == Role.STUDENT && currentUser.getId().equals(studentId);
        if (!isAdmin && !isSelfStudent) {
            throw new UnauthorizedException("You are not authorized to access this student's milestones");
        }

        return milestoneRepository.findAllByStudentIdOrderByCreatedAtDesc(studentId)
                .stream()
                .map(this::toMilestoneDto)
                .toList();
    }

    private MilestoneDto toMilestoneDto(Milestone milestone) {
        MilestoneDto dto = modelMapper.map(milestone, MilestoneDto.class);
        dto.setStudentId(milestone.getStudent().getId());
        dto.setStudentName(milestone.getStudent().getName());
        return dto;
    }
}
