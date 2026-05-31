package com.pharmacy.config;

import com.pharmacy.security.AuthTokenFilter;
import com.pharmacy.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

        @Autowired
        private CustomUserDetailsService userDetailsService;

        @Autowired
        private JwtUtils jwtUtils;

        @Bean
        public AuthTokenFilter authenticationJwtTokenFilter() {
                return new AuthTokenFilter(jwtUtils, userDetailsService);
        }

        @Bean
        public DaoAuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
                authProvider.setUserDetailsService(userDetailsService);
                authProvider.setPasswordEncoder(passwordEncoder());
                return authProvider;
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
                return authConfig.getAuthenticationManager();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                // --- CRITICAL FIXED ORDER: AUTHORIZATION RULES FIRST ---
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers("/error").permitAll()

                                                // --- 2. PUBLIC SETTINGS ENDPOINTS ---
                                                .requestMatchers(HttpMethod.GET, "/api/settings/pharmacy").permitAll()

                                                // --- 1. USER MANAGEMENT ---
                                                .requestMatchers("/api/users", "/api/users/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                                                // --- 3. REPORTS & ANALYTICS ---
                                                .requestMatchers("/api/reports", "/api/reports/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "MANAGER", "ROLE_MANAGER")

                                                // --- 4. SYSTEM SETTINGS ---
                                                .requestMatchers("/api/settings", "/api/settings/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "MANAGER", "ROLE_MANAGER")

                                                // --- 5. MEDICINES & INVENTORY ---
                                                .requestMatchers(HttpMethod.POST, "/api/medicines", "/api/medicines/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "PHARMACIST", "ROLE_PHARMACIST",
                                                                "MANAGER", "ROLE_MANAGER")

                                                .requestMatchers(HttpMethod.PUT, "/api/medicines", "/api/medicines/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "PHARMACIST", "ROLE_PHARMACIST",
                                                                "MANAGER", "ROLE_MANAGER")

                                                .requestMatchers(HttpMethod.DELETE, "/api/medicines",
                                                                "/api/medicines/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                                                // Everyone authenticated can access GET medicines, dashboard, and stock
                                                // categories
                                                .requestMatchers(HttpMethod.GET, "/api/medicines", "/api/medicines/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "PHARMACIST", "ROLE_PHARMACIST",
                                                                "MANAGER", "ROLE_MANAGER", "CASHIER", "ROLE_CASHIER")

                                                .requestMatchers("/api/categories", "/api/categories/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "PHARMACIST", "ROLE_PHARMACIST",
                                                                "MANAGER", "ROLE_MANAGER", "CASHIER", "ROLE_CASHIER")

                                                .requestMatchers("/api/dashboard", "/api/dashboard/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "PHARMACIST", "ROLE_PHARMACIST",
                                                                "MANAGER", "ROLE_MANAGER", "CASHIER", "ROLE_CASHIER")

                                                // --- 6. SALES & TRANSACTIONS ---
                                                .requestMatchers(HttpMethod.POST, "/api/sales", "/api/sales/**")
                                                .hasAnyAuthority("CASHIER", "ROLE_CASHIER", "PHARMACIST",
                                                                "ROLE_PHARMACIST",
                                                                "ADMIN", "ROLE_ADMIN", "MANAGER", "ROLE_MANAGER")

                                                .requestMatchers(HttpMethod.GET, "/api/sales", "/api/sales/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "MANAGER", "ROLE_MANAGER",
                                                                "PHARMACIST", "ROLE_PHARMACIST", "CASHIER",
                                                                "ROLE_CASHIER")

                                                .requestMatchers(HttpMethod.DELETE, "/api/sales", "/api/sales/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                                                // --- 7. CUSTOMERS ---
                                                .requestMatchers("/api/customers", "/api/customers/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "MANAGER", "ROLE_MANAGER",
                                                                "PHARMACIST", "ROLE_PHARMACIST", "CASHIER",
                                                                "ROLE_CASHIER")

                                                // --- 8. PRESCRIPTIONS ---
                                                .requestMatchers("/api/prescription", "/api/prescription/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "PHARMACIST", "ROLE_PHARMACIST",
                                                                "MANAGER", "ROLE_MANAGER", "CASHIER", "ROLE_CASHIER")

                                                .requestMatchers("/api/prescriptions", "/api/prescriptions/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "PHARMACIST", "ROLE_PHARMACIST",
                                                                "MANAGER", "ROLE_MANAGER", "CASHIER", "ROLE_CASHIER")

                                                // --- 9. BRANCHES ---
                                                .requestMatchers(HttpMethod.GET, "/api/branches", "/api/branches/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "PHARMACIST", "ROLE_PHARMACIST",
                                                                "MANAGER", "ROLE_MANAGER", "CASHIER", "ROLE_CASHIER")

                                                .requestMatchers("/api/branches", "/api/branches/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                                                .anyRequest().authenticated());

                http.authenticationProvider(authenticationProvider());
                http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(Arrays.asList(
                                "http://localhost:5173",
                                "https://pharmacy-management-system-lyart-three.vercel.app"));

                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

                configuration.setAllowedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Type",
                                "Accept",
                                "Origin",
                                "X-Requested-With",
                                "X-Branch-Id",
                                "x-branch-id"));

                configuration.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}