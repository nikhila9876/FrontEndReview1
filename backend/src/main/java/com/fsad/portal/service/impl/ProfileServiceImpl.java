package com.fsad.portal.service.impl;

import com.fsad.portal.dto.ProfileDto;
import com.fsad.portal.dto.ProfileRequestDto;
import com.fsad.portal.model.Profile;
import com.fsad.portal.model.User;
import com.fsad.portal.repository.ProfileRepository;
import com.fsad.portal.service.ProfileService;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProfileServiceImpl implements ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileServiceImpl.class);

    private final ProfileRepository profileRepository;
    private final ModelMapper modelMapper;
    private final AuthenticatedUserService authenticatedUserService;

    public ProfileServiceImpl(ProfileRepository profileRepository,
                              ModelMapper modelMapper,
                              AuthenticatedUserService authenticatedUserService) {
        this.profileRepository = profileRepository;
        this.modelMapper = modelMapper;
        this.authenticatedUserService = authenticatedUserService;
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileDto getCurrentProfile() {
        User user = authenticatedUserService.getCurrentUser();
        log.info("Fetching current profile for userId={}, role={}", user.getId(), user.getRole());
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> buildTransientProfile(user));
        return toProfileDto(profile);
    }

    @Override
    public ProfileDto updateCurrentProfile(ProfileRequestDto request) {
        User user = authenticatedUserService.getCurrentUser();
        log.info("Updating current profile for userId={}, role={}", user.getId(), user.getRole());
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> createProfileForUser(user));

        profile.setBio(trimToNull(request.getBio()));
        profile.setPhone(trimToNull(request.getPhone()));
        profile.setBranch(trimToNull(request.getBranch()));
        profile.setCollege(trimToNull(request.getCollege()));
        profile.setGithubUrl(trimToNull(request.getGithubUrl()));
        profile.setLinkedinUrl(trimToNull(request.getLinkedinUrl()));

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

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
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
