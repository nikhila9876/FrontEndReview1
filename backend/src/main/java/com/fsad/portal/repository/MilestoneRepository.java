package com.fsad.portal.repository;

import com.fsad.portal.model.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findAllByStudentIdOrderByCreatedAtDesc(Long studentId);
}
