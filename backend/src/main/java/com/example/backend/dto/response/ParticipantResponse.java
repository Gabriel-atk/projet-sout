package com.example.backend.dto.response;

import com.example.backend.utils.Role;

import java.util.UUID;

public record ParticipantResponse(
        UUID trackingId,
        String firstname,
        String lastname,
        String email,
        String password,
        Role role
) {
}
