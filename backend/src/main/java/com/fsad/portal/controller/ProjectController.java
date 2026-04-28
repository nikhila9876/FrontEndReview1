package com.fsad.portal.controller;

import com.fsad.portal.dto.ApiResponseDto;
import com.fsad.portal.dto.ProjectDto;
import com.fsad.portal.model.ProjectStatus;
import com.fsad.portal.service.ProjectService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<ProjectDto> createProject(@RequestBody ProjectDto request) {
        ProjectDto created = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<ProjectDto> uploadProject(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) String technology,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) Integer progress,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) String fileUrl,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            ProjectDto created = projectService.createProjectWithFile(title, description, technology, status, progress, studentId, fileUrl, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping
    public ResponseEntity<List<ProjectDto>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ProjectDto>> getProjectsByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(projectService.getProjectsByStudentId(studentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @GetMapping("/file/{id}")
    public ResponseEntity<Void> getProjectFileUrl(@PathVariable Long id) {
        String fileUrl = projectService.getProjectFileAccessUrl(id);
        String redirectTarget = (fileUrl.startsWith("http://") || fileUrl.startsWith("https://"))
                ? fileUrl
                : (fileUrl.startsWith("/") ? fileUrl : "/" + fileUrl);
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, redirectTarget)
                .location(URI.create(redirectTarget))
                .build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @RequestBody ProjectDto request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDto> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(new ApiResponseDto("Project deleted successfully"));
    }
}
