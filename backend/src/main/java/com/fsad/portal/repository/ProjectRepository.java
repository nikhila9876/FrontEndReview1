package com.fsad.portal.repository;

import com.fsad.portal.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findAllByOwnerId(Long ownerId);
    List<Project> findAllByOwnerIdAndIsDeletedFalse(Long ownerId);
    java.util.Optional<Project> findByIdAndIsDeletedFalse(Long id);
}
