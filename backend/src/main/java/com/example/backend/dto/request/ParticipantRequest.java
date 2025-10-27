package com.example.backend.dto.request;

public record ParticipantRequest(
        String firstname,
        String lastname,
        String email,
        String password
) {
}
