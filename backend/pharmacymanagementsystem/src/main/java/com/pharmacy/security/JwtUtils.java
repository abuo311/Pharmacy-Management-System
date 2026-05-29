package com.pharmacy.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtUtils {

    @Value("${minamo.app.jwtSecret}")
    private String jwtSecret;

    @Value("${minamo.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    private Key key;

    @PostConstruct
    public void init() {
        // 🔥 IMPORTANT: ensure secret is strong enough (32+ chars for HS256)
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateJwtToken(Authentication authentication) {

        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        List<String> roles = userPrincipal.getAuthorities()
                .stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .claim("roles", roles)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> getRolesFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("roles", List.class);
    }

    // 🔥 FIXED: Better debugging for 403 issues
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(authToken);

            return true;

        } catch (ExpiredJwtException e) {
            System.err.println("❌ JWT expired: " + e.getMessage());

        } catch (UnsupportedJwtException e) {
            System.err.println("❌ JWT unsupported: " + e.getMessage());

        } catch (MalformedJwtException e) {
            System.err.println("❌ JWT malformed: " + e.getMessage());

        } catch (SignatureException e) {
            System.err.println("❌ JWT signature invalid (SECRET mismatch): " + e.getMessage());

        } catch (IllegalArgumentException e) {
            System.err.println("❌ JWT empty or invalid: " + e.getMessage());
        }

        return false;
    }
}