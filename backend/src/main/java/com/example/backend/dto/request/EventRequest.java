package com.example.backend.dto.request;

import com.example.backend.utils.EventStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record EventRequest(
    String title,
    String description,
    String location,
    Number capacity,
    LocalDateTime startDateTime,
    LocalDateTime endDateTime,
    float price,
    EventStatus status,
    List<String> images,
    UUID organizerTrackingId
) {
}
