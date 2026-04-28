package com.fsad.portal.repository;

import com.fsad.portal.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findAllByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<Feedback> findAllByOrderByCreatedAtDesc();
}
