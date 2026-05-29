package com.pharmacy.dto;

import com.pharmacy.models.Role;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor // Enables easy instantiation in the Controller/Service
public class UserResponse {
    private Long id;
    private String name;
    private String username;
    private Role role;
    private Long branchId;
    private String branchName;
    private String token; 
}