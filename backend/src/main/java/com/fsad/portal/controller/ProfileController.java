package com.fsad.portal.controller;

import com.fsad.portal.dto.ProfileDto;
import com.fsad.portal.dto.ProfileRequestDto;
import com.fsad.portal.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileDto> getCurrentProfile() {
        return ResponseEntity.ok(profileService.getCurrentProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileDto> updateCurrentProfile(@Valid @RequestBody ProfileRequestDto request) {
        return ResponseEntity.ok(profileService.updateCurrentProfile(request));
    }
}
