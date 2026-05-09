package com.batstateu.foodhub.model;
import java.time.LocalDateTime;
public class AdminSession {
    private String token;
    private int stallId;
    private String stallName;
    private LocalDateTime loginTime;
    private LocalDateTime expiresAt;
    public AdminSession(String token, int stallId, String stallName) {
        this.token     = token;
        this.stallId   = stallId;
        this.stallName = stallName;
        this.loginTime = LocalDateTime.now();
        this.expiresAt = loginTime.plusHours(8);
    }
    public boolean isValid() {
        return LocalDateTime.now().isBefore(this.expiresAt);
    }
    public String getToken()            { return token; }
    public int getStallId()             { return stallId; }
    public String getStallName()        { return stallName; }
    public LocalDateTime getLoginTime() { return loginTime; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
}
