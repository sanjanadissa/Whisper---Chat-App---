package com.example.Whisper.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Base64;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:mySecretKey123456789012345678901234567890}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}") // 24 hours in milliseconds
    private long jwtExpiration;

    @Value("${jwt.refresh.expiration:604800000}") // 7 days in milliseconds
    private long refreshExpiration;

    private SecretKey getSigningKey() {
        // Decode base64 secret if it's base64 encoded, otherwise use as-is
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(jwtSecret);
        } catch (IllegalArgumentException e) {
            // If not base64, use the string bytes directly
            keyBytes = jwtSecret.getBytes();
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String phoneNumber) {
        return generateToken(phoneNumber, jwtExpiration);
    }

    public String generateRefreshToken(String phoneNumber) {
        return generateToken(phoneNumber, refreshExpiration);
    }

    private String generateToken(String phoneNumber, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setSubject(phoneNumber)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getPhoneNumberFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getSubject();
    }

    public Date getExpirationDateFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getExpiration();
    }

    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            return expiration.before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }

    private Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.err.println("JWT token is expired: " + e.getMessage());
            return false;
        } catch (UnsupportedJwtException e) {
            System.err.println("JWT token is unsupported: " + e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            System.err.println("JWT token is malformed: " + e.getMessage());
            return false;
        } catch (SecurityException e) {
            System.err.println("JWT signature validation failed: " + e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            System.err.println("JWT token compact of handler are invalid: " + e.getMessage());
            return false;
        }
    }

    public boolean validateToken(String token, String phoneNumber) {
        try {
            String tokenPhoneNumber = getPhoneNumberFromToken(token);
            return (tokenPhoneNumber.equals(phoneNumber) && !isTokenExpired(token));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // Utility method to get remaining time until expiration
    public long getTokenExpirationTime(String token) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            Date now = new Date();
            return Math.max(0, expiration.getTime() - now.getTime());
        } catch (JwtException e) {
            return 0;
        }
    }
}