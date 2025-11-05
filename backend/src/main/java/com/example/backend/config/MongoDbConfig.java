package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.AuditorAware;

import java.util.Optional;

public class MongoDbConfig {
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            // Retournez l'utilisateur courant depuis le contexte de sécurité
            // Exemple avec Spring Security :
            // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            // return Optional.ofNullable(auth).map(Authentication::getName);
            return Optional.of("system"); // Valeur par défaut
        };
    }
}
