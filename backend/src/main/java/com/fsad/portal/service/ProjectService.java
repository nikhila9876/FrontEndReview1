package com.fsad.portal.service;

import com.fsad.portal.dto.ProjectDto;
import com.fsad.portal.model.ProjectStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProjectService {
    ProjectDto createProject(ProjectDto request);
    ProjectDto createProjectWithFile(
            String title,
            String description,
            String technology,
            ProjectStatus status,
            Integer progress,
            Long studentId,
            String fileUrl,
            MultipartFile file
    );
    List<ProjectDto> getAllProjects();
    List<ProjectDto> getProjectsByStudentId(Long studentId);
    ProjectDto getProjectById(Long id);
    String getProjectFileAccessUrl(Long id);
    ProjectDto updateProject(Long id, ProjectDto request);
    void deleteProject(Long id);
}
