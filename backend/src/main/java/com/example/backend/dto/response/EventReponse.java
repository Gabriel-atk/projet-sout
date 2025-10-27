package com.example.backend.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record EventReponse(
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
