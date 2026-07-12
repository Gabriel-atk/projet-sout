package com.example.backend.dto.response;

import java.util.UUID;

public record TicketResponse(
        UUID trackingId,
        float price,
        int nombreTcketDisponible,
        int nombreTicketVendu,
        int nombreTicketRestant,
        boolean isAvailable,
        UUID eventTrackingId,
        UUID organizerId
) {
}
