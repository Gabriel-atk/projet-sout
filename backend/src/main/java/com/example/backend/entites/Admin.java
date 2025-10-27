package com.example.backend.entites;

import com.example.backend.utils.Role;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@DiscriminatorValue("ADMIN")
public class Admin extends User{
    public Admin(String firstName, String lastname ,String email, String password) {
        super(firstName, lastname, email, password);
        this.setRole(Role.ADMIN);
    }
}
