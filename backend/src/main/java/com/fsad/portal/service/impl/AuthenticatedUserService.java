package com.fsad.portal.service.impl;

import com.fsad.portal.exception.ResourceNotFoundException;
import com.fsad.portal.exception.UnauthorizedException;
import com.fsad.portal.model.Role;
import com.fsad.portal.model.User;
import com.fsad.portal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticatedUserService {

    private static final Logger log = LoggerFactory.getLogger(AuthenticatedUserService.class);

    private final UserRepository userRepository;

    public AuthenticatedUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException("User is not authenticated");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        log.info("Authenticated user resolved: userId={}, email={}, role={}", user.getId(), user.getEmail(), user.getRole());
        return user;
    }

    public User requireAdmin() {
        User user = getCurrentUser();
        if (user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Admin role is required for this action");
        }
        return user;
    }

    public User requireStudent() {
        User user = getCurrentUser();
        if (user.getRole() != Role.STUDENT) {
            throw new UnauthorizedException("Student role is required for this action");
        }
        return user;
    }
}
