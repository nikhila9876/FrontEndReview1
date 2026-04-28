package com.fsad.portal.service.impl;

import com.fsad.portal.dto.FeedbackDto;
import com.fsad.portal.dto.FeedbackRequestDto;
import com.fsad.portal.dto.MilestoneDto;
import com.fsad.portal.dto.MilestoneRequestDto;
import com.fsad.portal.dto.ProjectDto;
import com.fsad.portal.dto.UserDto;
import com.fsad.portal.exception.BadRequestException;
import com.fsad.portal.exception.ResourceNotFoundException;
import com.fsad.portal.model.Feedback;
import com.fsad.portal.model.Milestone;
import com.fsad.portal.model.Project;
import com.fsad.portal.model.ProjectStatus;
import com.fsad.portal.model.Role;
import com.fsad.portal.model.User;
import com.fsad.portal.repository.FeedbackRepository;
import com.fsad.portal.repository.MilestoneRepository;
import com.fsad.portal.repository.ProjectRepository;
import com.fsad.portal.repository.UserRepository;
import com.fsad.portal.service.AdminService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final MilestoneRepository milestoneRepository;
    private final FeedbackRepository feedbackRepository;
    private final ProjectRepository projectRepository;
    private final ModelMapper modelMapper;
    private final AuthenticatedUserService authenticatedUserService;

    public AdminServiceImpl(UserRepository userRepository,
                            MilestoneRepository milestoneRepository,
                            FeedbackRepository feedbackRepository,
                            ProjectRepository projectRepository,
                            ModelMapper modelMapper,
                            AuthenticatedUserService authenticatedUserService) {
        this.userRepository = userRepository;
        this.milestoneRepository = milestoneRepository;
        this.feedbackRepository = feedbackRepository;
        this.projectRepository = projectRepository;
        this.modelMapper = modelMapper;
        this.authenticatedUserService = authenticatedUserService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllStudents() {
        authenticatedUserService.requireAdmin();
        return userRepository.findAllByRole(Role.STUDENT)
                .stream()
                .map(user -> modelMapper.map(user, UserDto.class))
                .toList();
    }

    @Override
    public MilestoneDto addMilestoneToStudent(Long studentId, MilestoneRequestDto request) {
        authenticatedUserService.requireAdmin();
        User student = getStudentById(studentId);

        Milestone milestone = new Milestone();
        milestone.setTitle(request.getTitle().trim());
        milestone.setDescription(request.getDescription().trim());
        milestone.setStatus(request.getStatus());
        milestone.setStudent(student);

        Milestone savedMilestone = milestoneRepository.save(milestone);
        return toMilestoneDto(savedMilestone);
    }

    @Override
    public MilestoneDto updateMilestone(Long milestoneId, MilestoneRequestDto request) {
        authenticatedUserService.requireAdmin();
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + milestoneId));

        milestone.setTitle(request.getTitle().trim());
        milestone.setDescription(request.getDescription().trim());
        milestone.setStatus(request.getStatus());

        Milestone savedMilestone = milestoneRepository.save(milestone);
        return toMilestoneDto(savedMilestone);
    }

    @Override
    public void deleteMilestone(Long milestoneId) {
        authenticatedUserService.requireAdmin();
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + milestoneId));
        milestoneRepository.delete(milestone);
    }

    @Override
    public FeedbackDto giveFeedbackToStudent(Long studentId, FeedbackRequestDto request) {
        User admin = authenticatedUserService.requireAdmin();
        User student = getStudentById(studentId);

        String message = request.getMessage().trim();
        if (message.isEmpty()) {
            throw new BadRequestException("Feedback message is required");
        }

        Feedback feedback = new Feedback();
        feedback.setMessage(message);
        feedback.setAdmin(admin);
        feedback.setStudent(student);

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return toFeedbackDto(savedFeedback);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackDto> getAllFeedbacks() {
        authenticatedUserService.requireAdmin();
        return feedbackRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toFeedbackDto)
                .toList();
    }

    @Override
    public ProjectDto approveProject(Long projectId) {
        authenticatedUserService.requireAdmin();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        project.setStatus(ProjectStatus.APPROVED);
        Project savedProject = projectRepository.save(project);

        ProjectDto dto = modelMapper.map(savedProject, ProjectDto.class);
        dto.setOwnerId(savedProject.getOwner().getId());
        dto.setStudentId(savedProject.getOwner().getId());
        dto.setOwnerName(savedProject.getOwner().getName());
        String fileUrl = savedProject.getFileUrl();
        if (fileUrl != null && !fileUrl.isBlank() && !fileUrl.startsWith("http://") && !fileUrl.startsWith("https://") && !fileUrl.startsWith("/")) {
            fileUrl = "/" + fileUrl;
        }
        dto.setFileUrl(fileUrl);
        return dto;
    }

    private User getStudentById(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
        if (student.getRole() != Role.STUDENT) {
            throw new BadRequestException("User with id " + studentId + " is not a student");
        }
        return student;
    }

    private MilestoneDto toMilestoneDto(Milestone milestone) {
        MilestoneDto dto = modelMapper.map(milestone, MilestoneDto.class);
        dto.setStudentId(milestone.getStudent().getId());
        dto.setStudentName(milestone.getStudent().getName());
        return dto;
    }

    private FeedbackDto toFeedbackDto(Feedback feedback) {
        FeedbackDto dto = modelMapper.map(feedback, FeedbackDto.class);
        dto.setAdminId(feedback.getAdmin().getId());
        dto.setAdminName(feedback.getAdmin().getName());
        dto.setStudentId(feedback.getStudent().getId());
        dto.setStudentName(feedback.getStudent().getName());
        return dto;
    }
}
