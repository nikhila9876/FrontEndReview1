package com.fsad.portal.service;

import com.fsad.portal.dto.AuthResponseDto;
import com.fsad.portal.dto.ApiResponseDto;
import com.fsad.portal.dto.LoginRequestDto;
import com.fsad.portal.dto.RegisterRequestDto;

public interface AuthService {
    ApiResponseDto register(RegisterRequestDto request);
    AuthResponseDto login(LoginRequestDto request);
}
