package com.fsad.portal.service.impl;

import com.fsad.portal.dto.ProjectDto;
import com.fsad.portal.exception.BadRequestException;
import com.fsad.portal.exception.ResourceNotFoundException;
import com.fsad.portal.exception.UnauthorizedException;
import com.fsad.portal.model.Project;
import com.fsad.portal.model.ProjectStatus;
import com.fsad.portal.model.Role;
import com.fsad.portal.model.User;
import com.fsad.portal.repository.ProjectRepository;
import com.fsad.portal.repository.UserRepository;
import com.fsad.portal.service.ProjectService;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private static final Logger log = LoggerFactory.getLogger(ProjectServiceImpl.class);

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public ProjectServiceImpl(ProjectRepository projectRepository,
                              UserRepository userRepository,
                              ModelMapper modelMapper) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public ProjectDto createProject(ProjectDto request) {
        User currentUser = getCurrentUser();
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BadRequestException("Project title is required");
        }
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new BadRequestException("Project description is required");
        }

        validateProgress(request.getProgress());

        Long ownerId = request.getOwnerId() != null ? request.getOwnerId() : request.getStudentId();
        User owner = resolveOwnerForCreate(ownerId, currentUser);

        Project project = new Project();
        project.setTitle(request.getTitle().trim());
        project.setDescription(request.getDescription().trim());
        project.setTechnology(trimToNull(request.getTechnology()));
        project.setFileUrl(normalizeIncomingFileUrl(request.getFileUrl()));
        project.setStatus(request.getStatus() == null ? ProjectStatus.PLANNED : request.getStatus());
        project.setProgress(request.getProgress() == null ? 0 : request.getProgress());
        project.setDeleted(false);
        project.setOwner(owner);

        Project savedProject = projectRepository.save(project);
        return toDto(savedProject);
    }

    @Override
    public ProjectDto createProjectWithFile(String title,
                                            String description,
                                            String technology,
                                            ProjectStatus status,
                                            Integer progress,
                                            Long studentId,
                                            String fileUrl,
                                            MultipartFile file) {
        log.info("createProjectWithFile called: title='{}', studentId={}, hasFile={}", title, studentId, file != null && !file.isEmpty());
        if (title == null || title.isBlank()) {
            throw new BadRequestException("Project title is required");
        }
        if (description == null || description.isBlank()) {
            throw new BadRequestException("Project description is required");
        }
        validateProgress(progress);

        User currentUser = getCurrentUser();
        User owner = resolveOwnerForCreate(studentId, currentUser);

        String resolvedFileUrl = normalizeIncomingFileUrl(fileUrl);
        if (file != null && !file.isEmpty()) {
            resolvedFileUrl = storeUploadedFile(file);
        }
        if (resolvedFileUrl == null) {
            throw new BadRequestException("Project file or file link is required");
        }

        Project project = new Project();
        project.setTitle(title.trim());
        project.setDescription(description.trim());
        project.setTechnology(trimToNull(technology));
        project.setStatus(status == null ? ProjectStatus.PENDING : status);
        project.setProgress(progress == null ? 0 : progress);
        project.setFileUrl(resolvedFileUrl);
        project.setDeleted(false);
        project.setOwner(owner);

        Project savedProject = projectRepository.save(project);
        log.info("Project saved successfully: projectId={}, ownerId={}, fileUrl={}", savedProject.getId(), owner.getId(), savedProject.getFileUrl());
        return toDto(savedProject);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDto> getAllProjects() {
        User currentUser = getCurrentUser();
        List<Project> projects = currentUser.getRole() == Role.ADMIN
                ? projectRepository.findAll()
                : projectRepository.findAllByOwnerIdAndIsDeletedFalse(currentUser.getId());
        return projects.stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDto> getProjectsByStudentId(Long studentId) {
        User currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if (!isAdmin && !currentUser.getId().equals(studentId)) {
            throw new UnauthorizedException("You are not allowed to view projects for this student");
        }
        List<Project> projects = isAdmin
                ? projectRepository.findAllByOwnerId(studentId)
                : projectRepository.findAllByOwnerIdAndIsDeletedFalse(studentId);
        return projects.stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectDto getProjectById(Long id) {
        User currentUser = getCurrentUser();
        Project project = currentUser.getRole() == Role.ADMIN
                ? projectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id))
                : projectRepository.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        validateProjectAccess(project, currentUser);
        return toDto(project);
    }

    @Override
    @Transactional(readOnly = true)
    public String getProjectFileAccessUrl(Long id) {
        User currentUser = getCurrentUser();
        Project project = currentUser.getRole() == Role.ADMIN
                ? projectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id))
                : projectRepository.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        validateProjectAccess(project, currentUser);
        if (project.getFileUrl() == null || project.getFileUrl().isBlank()) {
            throw new BadRequestException("No file uploaded for this project");
        }
        return normalizeStoredFileUrl(project.getFileUrl());
    }

    @Override
    public ProjectDto updateProject(Long id, ProjectDto request) {
        User currentUser = getCurrentUser();
        Project project = currentUser.getRole() == Role.ADMIN
                ? projectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id))
                : projectRepository.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        validateProjectAccess(project, currentUser);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            project.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            project.setDescription(request.getDescription().trim());
        }
        if (request.getTechnology() != null) {
            project.setTechnology(trimToNull(request.getTechnology()));
        }
        if (request.getFileUrl() != null && !request.getFileUrl().startsWith("/api/projects/file/")) {
            project.setFileUrl(normalizeIncomingFileUrl(request.getFileUrl()));
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        if (request.getProgress() != null) {
            validateProgress(request.getProgress());
            project.setProgress(request.getProgress());
        }
        Long requestOwnerId = request.getOwnerId() != null ? request.getOwnerId() : request.getStudentId();
        if (requestOwnerId != null && currentUser.getRole() == Role.ADMIN) {
            User newOwner = userRepository.findById(requestOwnerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Owner not found with id: " + requestOwnerId));
            project.setOwner(newOwner);
        }

        Project updatedProject = projectRepository.save(project);
        return toDto(updatedProject);
    }

    @Override
    public void deleteProject(Long id) {
        User currentUser = getCurrentUser();
        Project project = currentUser.getRole() == Role.ADMIN
                ? projectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id))
                : projectRepository.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        validateProjectAccess(project, currentUser);
        project.setDeleted(true);
        projectRepository.save(project);
        log.info("Project soft-deleted: projectId={}, ownerId={}, deletedByUserId={}", project.getId(), project.getOwner().getId(), currentUser.getId());
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException("User is not authenticated");
        }

        String email = authentication.getName();
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private User resolveOwnerForCreate(Long ownerId, User currentUser) {
        if (ownerId == null) {
            return currentUser;
        }

        if (currentUser.getRole() != Role.ADMIN && !ownerId.equals(currentUser.getId())) {
            throw new UnauthorizedException("Students can only create projects for themselves");
        }

        return userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with id: " + ownerId));
    }

    private void validateProjectAccess(Project project, User currentUser) {
        // Admin can access any project; students can only access their own.
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        if (!isAdmin && project.isDeleted()) {
            throw new ResourceNotFoundException("Project not found");
        }
        if (!isAdmin && !isOwner) {
            throw new UnauthorizedException("You are not allowed to access this project");
        }
    }

    private void validateProgress(Integer progress) {
        if (progress == null) {
            return;
        }
        if (progress < 0 || progress > 100) {
            throw new BadRequestException("Progress must be between 0 and 100");
        }
    }

    private String storeUploadedFile(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                throw new BadRequestException("Project file is required");
            }

            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "project-file" : file.getOriginalFilename());
            if (originalFileName.contains("..")) {
                throw new BadRequestException("Invalid file name");
            }

            String generatedFileName = System.currentTimeMillis() + "_" + originalFileName.replaceAll("\\s+", "_");
            Path uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadRoot);

            Path targetPath = uploadRoot.resolve(generatedFileName).normalize();
            if (!targetPath.startsWith(uploadRoot)) {
                throw new BadRequestException("Invalid file path");
            }

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + generatedFileName;
        } catch (Exception ex) {
            ex.printStackTrace();
            log.error("File upload failed: {}", ex.getMessage(), ex);
            throw new BadRequestException("Failed to store project file: " + ex.getMessage());
        }
    }

    private String normalizeIncomingFileUrl(String fileUrl) {
        if (fileUrl == null) {
            return null;
        }
        String trimmed = fileUrl.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed;
        }

        String normalized = trimmed.replace("\\", "/");
        if (normalized.startsWith("/uploads/")) {
            return normalized;
        }
        if (normalized.startsWith("uploads/")) {
            return "/" + normalized;
        }
        return normalized;
    }

    private String normalizeStoredFileUrl(String fileUrl) {
        String normalized = normalizeIncomingFileUrl(fileUrl);
        if (normalized == null) {
            throw new BadRequestException("No file uploaded for this project");
        }

        if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
            return normalized;
        }

        Path uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (normalized.startsWith("/uploads/") || normalized.startsWith("uploads/")) {
            String relativePath = normalized.replaceFirst("^/?uploads/", "");
            Path localPath = uploadRoot.resolve(relativePath).normalize();
            if (!localPath.startsWith(uploadRoot)) {
                throw new BadRequestException("Invalid uploaded file path");
            }
            if (!Files.exists(localPath)) {
                throw new BadRequestException("Uploaded file not found on server");
            }
            return "/uploads/" + relativePath.replace("\\", "/");
        }

        try {
            Path candidatePath = Paths.get(normalized);
            if (candidatePath.isAbsolute()) {
                Path absoluteCandidate = candidatePath.toAbsolutePath().normalize();
                if (absoluteCandidate.startsWith(uploadRoot)) {
                    if (!Files.exists(absoluteCandidate)) {
                        throw new BadRequestException("Uploaded file not found on server");
                    }
                    String relativePath = uploadRoot.relativize(absoluteCandidate).toString().replace("\\", "/");
                    return "/uploads/" + relativePath;
                }
            }
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ignored) {
            // If this is not a filesystem path, treat it as a URL-like path below.
        }
        if (!normalized.startsWith("/")) {
            return "/" + normalized;
        }
        return normalized;
    }

    private String resolveFileUrlForDto(Project project) {
        String normalized = normalizeIncomingFileUrl(project.getFileUrl());
        if (normalized == null) {
            return null;
        }
        if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
            return normalized;
        }
        if (!normalized.startsWith("/")) {
            return "/" + normalized;
        }
        return normalized;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private ProjectDto toDto(Project project) {
        ProjectDto dto = modelMapper.map(project, ProjectDto.class);
        dto.setOwnerId(project.getOwner().getId());
        dto.setStudentId(project.getOwner().getId());
        dto.setOwnerName(project.getOwner().getName());
        dto.setFileUrl(resolveFileUrlForDto(project));
        dto.setDeleted(project.isDeleted());
        return dto;
    }
}
