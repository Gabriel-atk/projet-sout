package com.example.backend.dto.request;

public record UserRequest(
        String firstname,
        String lastname,
        String email,
        String password
) {
}
