package com.batstateu.foodhub.service;
import com.batstateu.foodhub.exception.ForbiddenException;
import com.batstateu.foodhub.exception.UnauthorizedException;
import com.batstateu.foodhub.model.AdminSession;
import com.batstateu.foodhub.model.Stall;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
@Service
public class AuthService {
    private final Map<String, AdminSession> sessions = new ConcurrentHashMap<>();
    private static final String ADMIN_PASSWORD = "admin123";
    private final StallService stallService;
    public AuthService(StallService stallService) {
        this.stallService = stallService;
    }
    public AdminSession login(Integer stallId, String password) {
        if (stallId == null)
            throw new IllegalArgumentException("Please select a stall before logging in.");
        Stall stall = stallService.getStallById(stallId);
        if (password == null || password.isBlank())
            throw new IllegalArgumentException("Password is required.");
        if (!ADMIN_PASSWORD.equals(password))
            throw new UnauthorizedException("Incorrect password. Please try again.");
        String token = UUID.randomUUID().toString();
        AdminSession session = new AdminSession(token, stallId, stall.getName());
        sessions.put(token, session);
        return session;
    }
    public AdminSession getValidSession(String token) {
        if (token == null || token.isBlank())
            throw new UnauthorizedException("No session token provided. Please log in.");
        AdminSession session = sessions.get(token);
        if (session == null)
            throw new UnauthorizedException("Session not found. Please log in again.");
        if (!session.isValid()) {
            sessions.remove(token);
            throw new UnauthorizedException("Your session has expired. Please log in again.");
        }
        return session;
    }
    public void requireOwnership(String token, int stallId) {
        AdminSession session = getValidSession(token);
        if (session.getStallId() != stallId)
            throw new ForbiddenException(
                "You can only manage your own stall. You are logged in as the admin for stall ID " + session.getStallId() + ".");
    }
    public void logout(String token) {
        if (token != null) sessions.remove(token);
    }
}
