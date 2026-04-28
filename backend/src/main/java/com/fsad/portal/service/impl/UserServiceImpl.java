package com.fsad.portal.service.impl;

import com.fsad.portal.dto.UserDto;
import com.fsad.portal.model.User;
import com.fsad.portal.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final ModelMapper modelMapper;
    private final AuthenticatedUserService authenticatedUserService;

    public UserServiceImpl(ModelMapper modelMapper, AuthenticatedUserService authenticatedUserService) {
        this.modelMapper = modelMapper;
        this.authenticatedUserService = authenticatedUserService;
    }

    @Override
    public UserDto getCurrentUser() {
        User user = authenticatedUserService.getCurrentUser();
        return modelMapper.map(user, UserDto.class);
    }
}
