package com.fsad.portal.service.impl;

import com.fsad.portal.dto.ApiResponseDto;
import com.fsad.portal.dto.AuthResponseDto;
import com.fsad.portal.dto.LoginRequestDto;
import com.fsad.portal.dto.RegisterRequestDto;
import com.fsad.portal.dto.UserDto;
import com.fsad.portal.exception.BadRequestException;
import com.fsad.portal.model.Profile;
import com.fsad.portal.model.Role;
import com.fsad.portal.model.User;
import com.fsad.portal.repository.ProfileRepository;
import com.fsad.portal.repository.UserRepository;
import com.fsad.portal.security.JwtService;
import com.fsad.portal.service.AuthService;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final ModelMapper modelMapper;

    public AuthServiceImpl(UserRepository userRepository,
                           ProfileRepository profileRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtService jwtService,
                           ModelMapper modelMapper) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.modelMapper = modelMapper;
    }

    @Override
    public ApiResponseDto register(RegisterRequestDto request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String displayName = resolveDisplayName(request);

        if (displayName == null || displayName.isBlank()) {
            throw new BadRequestException("Name or username is required");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BadRequestException("Email is already registered");
        }

        Role role = parseRole(request.getRole());

        User newUser = new User();
        newUser.setName(displayName.trim());
        newUser.setEmail(normalizedEmail);
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRole(role);
        User savedUser = userRepository.save(newUser);

        Profile profile = new Profile();
        profile.setUser(savedUser);
        profileRepository.save(profile);

        log.info("User registration successful: userId={}, email={}, role={}", savedUser.getId(), savedUser.getEmail(), savedUser.getRole());

        return new ApiResponseDto("Registration successful");
    }

    @Override
    public AuthResponseDto login(LoginRequestDto request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            throw new BadRequestException("Invalid email or password");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();

        String token = jwtService.generateToken(
                Map.of("role", user.getRole().name(), "userId", user.getId()),
                userDetails
        );
        return buildAuthResponse(user, token, "Login successful");
    }

    private AuthResponseDto buildAuthResponse(User user, String token, String message) {
        UserDto userDto = modelMapper.map(user, UserDto.class);
        AuthResponseDto response = new AuthResponseDto();
        response.setToken(token);
        response.setTokenType("Bearer");
        response.setUser(userDto);
        response.setMessage(message);
        return response;
    }

    private String resolveDisplayName(RegisterRequestDto request) {
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            return request.getName().trim();
        }
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            return request.getUsername().trim();
        }
        return null;
    }

    private Role parseRole(String role) {
        if (role == null || role.isBlank()) {
            return Role.STUDENT;
        }

        try {
            return Role.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid role. Allowed values: STUDENT, ADMIN");
        }
    }

}
