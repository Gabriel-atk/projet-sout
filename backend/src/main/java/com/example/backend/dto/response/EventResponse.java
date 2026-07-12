package com.example.backend.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record EventResponse(
        UUID trackingId,
        String title,
        String description,
        String location,
        Number capacity,
        LocalDateTime startDateTime,
        LocalDateTime endDateTime,
        float price,
        String organizer
) {
}
