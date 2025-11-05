package com.example.backend.services;

import com.example.backend.dto.request.EventRequest;
import com.example.backend.dto.response.EventResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface EventService {

    EventResponse createEvent(EventRequest request, List<MultipartFile> images);

    List<EventResponse> getAllEvents();

    EventResponse getEventByTrackingId(UUID trackingId);

    EventResponse updateEvent(UUID trackingId, EventRequest request);

    void deleteEvent(UUID trackingId);

    List<EventResponse> getEventsByOrganizer(UUID organizerTrackingId);
}
