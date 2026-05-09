package com.batstateu.foodhub.controller;
import com.batstateu.foodhub.model.AdminSession;
import com.batstateu.foodhub.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> body) {
        Integer stallId = null;
        if (body.get("stallId") != null) {
            try {
                stallId = Integer.parseInt(body.get("stallId").toString());
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("stallId must be a valid integer.");
            }
        }
        String password = body.get("password") != null ? body.get("password").toString() : null;
        AdminSession session = authService.login(stallId, password);
        return ResponseEntity.ok(Map.of(
            "token",     session.getToken(),
            "stallId",   session.getStallId(),
            "stallName", session.getStallName(),
            "expiresAt", session.getExpiresAt().toString()
        ));
    }
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(
            @RequestHeader(value = "X-Session-Token", required = false) String token) {
        authService.logout(token);
        return ResponseEntity.ok(Map.of("loggedOut", true));
    }
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@RequestHeader("X-Session-Token") String token) {
        AdminSession session = authService.getValidSession(token);
        return ResponseEntity.ok(Map.of(
            "stallId",   session.getStallId(),
            "stallName", session.getStallName(),
            "loginTime", session.getLoginTime().toString(),
            "expiresAt", session.getExpiresAt().toString()
        ));
    }
}
