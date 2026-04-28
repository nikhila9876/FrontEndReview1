package com.fsad.portal.service;

import com.fsad.portal.dto.ProfileDto;
import com.fsad.portal.dto.ProfileRequestDto;

public interface ProfileService {
    ProfileDto getCurrentProfile();
    ProfileDto updateCurrentProfile(ProfileRequestDto request);
}
