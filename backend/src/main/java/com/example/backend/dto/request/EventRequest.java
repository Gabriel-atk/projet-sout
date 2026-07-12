package com.example.backend.dto.request;

import com.example.backend.utils.EventStatus;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record EventRequest(
    String title,
    String description,
    String location,
    Integer capacity,
    LocalDateTime startDateTime,
    LocalDateTime endDateTime,
    double price,
    EventStatus status,
    List<String> images,
    UUID organizerTrackingId
) {
}
