package com.pharmacy.config;

import com.pharmacy.models.User;
import com.pharmacy.repositories.UserRepository;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // We return our custom inner class that carries the Branch ID and User ID
        return new CustomUserDetails(user);
    }

    /**
     * Custom UserDetails class to carry pharmacy-specific data (Branch and ID)
     */
    @Getter
    public static class CustomUserDetails extends org.springframework.security.core.userdetails.User {
        private final Long id;
        private final Long branchId;
        private final String fullName;

        public CustomUserDetails(User user) {
            super(
                    user.getUsername(),
                    user.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
            this.id = user.getId();
            // Assuming your User model has a getBranch() or getBranchId() method
            this.branchId = user.getBranch() != null ? user.getBranch().getId() : null;
            this.fullName = user.getName();
        }
    }
}