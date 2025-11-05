package com.example.backend.entites;

import com.example.backend.utils.Role;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@NoArgsConstructor
@DiscriminatorValue("ORGANIZER")
public class Organizer extends User{
    private String organizerName;
    public Organizer(String firstName, String lastName, String email, String password) {
        super(firstName, lastName, email, password);
        this.setRole(Role.ORGANIZER);
    }
}
