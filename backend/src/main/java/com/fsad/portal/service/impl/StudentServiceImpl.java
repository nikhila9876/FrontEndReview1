package com.fsad.portal.service.impl;

import com.fsad.portal.dto.FeedbackDto;
import com.fsad.portal.dto.MilestoneDto;
import com.fsad.portal.dto.ProfileDto;
import com.fsad.portal.dto.ProfileRequestDto;
import com.fsad.portal.dto.ProjectDto;
import com.fsad.portal.dto.StudentDashboardDto;
import com.fsad.portal.dto.UserDto;
import com.fsad.portal.model.Feedback;
import com.fsad.portal.model.Milestone;
import com.fsad.portal.model.MilestoneStatus;
import com.fsad.portal.model.Profile;
import com.fsad.portal.model.Project;
import com.fsad.portal.model.ProjectStatus;
import com.fsad.portal.model.User;
import com.fsad.portal.repository.FeedbackRepository;
import com.fsad.portal.repository.MilestoneRepository;
import com.fsad.portal.repository.ProfileRepository;
import com.fsad.portal.repository.ProjectRepository;
import com.fsad.portal.service.StudentService;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    private static final Logger log = LoggerFactory.getLogger(StudentServiceImpl.class);

    private final MilestoneRepository milestoneRepository;
    private final FeedbackRepository feedbackRepository;
    private final ProfileRepository profileRepository;
    private final ProjectRepository projectRepository;
    private final ModelMapper modelMapper;
    private final AuthenticatedUserService authenticatedUserService;

    public StudentServiceImpl(MilestoneRepository milestoneRepository,
                              FeedbackRepository feedbackRepository,
                              ProfileRepository profileRepository,
                              ProjectRepository projectRepository,
                              ModelMapper modelMapper,
                              AuthenticatedUserService authenticatedUserService) {
        this.milestoneRepository = milestoneRepository;
        this.feedbackRepository = feedbackRepository;
        this.profileRepository = profileRepository;
        this.projectRepository = projectRepository;
        this.modelMapper = modelMapper;
        this.authenticatedUserService = authenticatedUserService;
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDashboardDto getDashboard() {
        User student = authenticatedUserService.requireStudent();
        log.info("Building student dashboard for userId={}, email={}", student.getId(), student.getEmail());

        List<Project> projects = projectRepository.findAllByOwnerIdAndIsDeletedFalse(student.getId());
        List<Milestone> milestones = milestoneRepository.findAllByStudentIdOrderByCreatedAtDesc(student.getId());
        List<Feedback> feedbacks = feedbackRepository.findAllByStudentIdOrderByCreatedAtDesc(student.getId());
        Profile profile = profileRepository.findByUserId(student.getId()).orElseGet(() -> buildTransientProfile(student));

        StudentDashboardDto dto = new StudentDashboardDto();
        dto.setUser(modelMapper.map(student, UserDto.class));
        dto.setProfile(toProfileDto(profile));
        dto.setTotalProjects(projects.size());
        dto.setCompletedProjects(projects.stream().filter(project -> project.getStatus() == ProjectStatus.COMPLETED).count());
        dto.setTotalMilestones(milestones.size());
        dto.setCompletedMilestones(milestones.stream().filter(milestone -> milestone.getStatus() == MilestoneStatus.COMPLETED).count());
        dto.setTotalFeedbacks(feedbacks.size());
        dto.setRecentProjects(projects.stream().limit(6).map(this::toProjectDto).toList());

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MilestoneDto> getOwnMilestones() {
        User student = authenticatedUserService.requireStudent();
        log.info("Fetching milestones for student userId={}", student.getId());
        return milestoneRepository.findAllByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(this::toMilestoneDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackDto> getOwnFeedbacks() {
        User student = authenticatedUserService.requireStudent();
        log.info("Fetching feedbacks for student userId={}", student.getId());
        return feedbackRepository.findAllByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(this::toFeedbackDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileDto getOwnProfile() {
        User student = authenticatedUserService.requireStudent();
        log.info("Fetching profile for student userId={}", student.getId());
        Profile profile = profileRepository.findByUserId(student.getId())
                .orElseGet(() -> buildTransientProfile(student));
        return toProfileDto(profile);
    }

    @Override
    public ProfileDto updateOwnProfile(ProfileRequestDto request) {
        User student = authenticatedUserService.requireStudent();
        log.info("Updating profile for student userId={}", student.getId());
        Profile profile = profileRepository.findByUserId(student.getId())
                .orElseGet(() -> createProfileForUser(student));

        applyProfileUpdates(profile, request);
        Profile savedProfile = profileRepository.save(profile);
        return toProfileDto(savedProfile);
    }

    private Profile createProfileForUser(User user) {
        Profile profile = new Profile();
        profile.setUser(user);
        return profileRepository.save(profile);
    }

    private Profile buildTransientProfile(User user) {
        Profile profile = new Profile();
        profile.setUser(user);
        return profile;
    }

    private void applyProfileUpdates(Profile profile, ProfileRequestDto request) {
        profile.setBio(trimToNull(request.getBio()));
        profile.setPhone(trimToNull(request.getPhone()));
        profile.setBranch(trimToNull(request.getBranch()));
        profile.setCollege(trimToNull(request.getCollege()));
        profile.setGithubUrl(trimToNull(request.getGithubUrl()));
        profile.setLinkedinUrl(trimToNull(request.getLinkedinUrl()));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
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

    private ProjectDto toProjectDto(Project project) {
        ProjectDto dto = modelMapper.map(project, ProjectDto.class);
        dto.setOwnerId(project.getOwner().getId());
        dto.setOwnerName(project.getOwner().getName());
        return dto;
    }

    private ProfileDto toProfileDto(Profile profile) {
        ProfileDto dto = modelMapper.map(profile, ProfileDto.class);
        dto.setUserId(profile.getUser().getId());
        dto.setName(profile.getUser().getName());
        dto.setEmail(profile.getUser().getEmail());
        dto.setRole(profile.getUser().getRole().name());
        return dto;
    }
}
