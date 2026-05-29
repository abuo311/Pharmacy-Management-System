package com.pharmacy.controllers;

import com.pharmacy.dto.LoginRequest;
import com.pharmacy.dto.UserResponse;
import com.pharmacy.models.User;
import com.pharmacy.repositories.UserRepository;
import com.pharmacy.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        try {
            logger.info("LOGIN ATTEMPT: {}", loginRequest.getUsername());

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            logger.info("AUTH SUCCESS for user: {}", loginRequest.getUsername());

            String jwt = jwtUtils.generateJwtToken(authentication);

            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found after authentication"));

            // ✅ FIX: Extract both Name and ID
            Long branchId = (user.getAssignedBranch() != null) ? user.getAssignedBranch().getId() : null;
            String branchName = (user.getAssignedBranch() != null) ? user.getAssignedBranch().getName() : "No Branch Assigned";

            // ✅ FIX: Pass the ID into the UserResponse constructor
            UserResponse response = new UserResponse(
                    user.getId(),
                    user.getName(),
                    user.getUsername(),
                    user.getRole(),
                    branchId,    // This allows the frontend to send the ID in headers
                    branchName,  // This allows the frontend to show the name in the UI
                    jwt
            );

            logger.info("LOGIN SUCCESS: User {} assigned to branch ID {}", user.getUsername(), branchId);

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid username or password");
        } catch (Exception e) {
            logger.error("LOGIN ERROR: ", e);
            return ResponseEntity.status(500).body("Login error: " + e.getMessage());
        }
    }
}