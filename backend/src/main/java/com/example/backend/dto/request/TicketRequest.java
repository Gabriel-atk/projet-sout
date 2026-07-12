package com.example.backend.dto.request;

import java.util.UUID;

public record TicketRequest(
    UUID eventTrackingId,
    float price,
    int nombreTicketDisponible,
    UUID organizerId
) {
}
