package com.example.backend.dto.response;

import com.example.backend.utils.Role;

import java.util.UUID;

public record UserResponse(
        UUID trackingId,
        String  firtname ,
        String lastname ,
        String email ,
        String password ,
        Role role
) {
}
