package com.batstateu.foodhub.controller;
import com.batstateu.foodhub.model.MenuItem;
import com.batstateu.foodhub.model.Stall;
import com.batstateu.foodhub.service.AuthService;
import com.batstateu.foodhub.service.StallService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/stalls")
@CrossOrigin(origins = "*")
public class StallController {
    private final StallService stallService;
    private final AuthService authService;
    public StallController(StallService stallService, AuthService authService) {
        this.stallService = stallService;
        this.authService  = authService;
    }
    @GetMapping
    public ResponseEntity<List<Stall>> getStalls(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        List<Stall> result;
        if (search != null && !search.isBlank()) {
            result = stallService.searchStalls(search);
        } else {
            result = stallService.getStallsByStatus(status);
        }
        return ResponseEntity.ok(result);
    }
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(stallService.getSummary());
    }
    @GetMapping("/{id}")
    public ResponseEntity<Stall> getStall(@PathVariable int id) {
        return ResponseEntity.ok(stallService.getStallById(id));
    }
    @GetMapping("/{id}/menu")
    public ResponseEntity<List<MenuItem>> getMenu(@PathVariable int id) {
        return ResponseEntity.ok(stallService.getMenuByStallId(id));
    }
    @GetMapping("/{id}/menu/available")
    public ResponseEntity<List<MenuItem>> getAvailableMenu(@PathVariable int id) {
        return ResponseEntity.ok(stallService.getAvailableMenuItems(id));
    }
    @GetMapping("/{id}/menu/{itemId}")
    public ResponseEntity<MenuItem> getMenuItem(@PathVariable int id, @PathVariable int itemId) {
        return ResponseEntity.ok(stallService.getMenuItemById(id, itemId));
    }
    @PatchMapping("/{id}")
    public ResponseEntity<Stall> updateStall(
            @PathVariable int id,
            @RequestHeader("X-Session-Token") String token,
            @RequestBody Stall updates) {
        authService.requireOwnership(token, id);
        return ResponseEntity.ok(stallService.updateStall(id, updates));
    }
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Stall> toggleStatus(
            @PathVariable int id,
            @RequestHeader("X-Session-Token") String token) {
        authService.requireOwnership(token, id);
        return ResponseEntity.ok(stallService.toggleStallStatus(id));
    }
    @PostMapping("/{id}/menu")
    public ResponseEntity<MenuItem> addMenuItem(
            @PathVariable int id,
            @RequestHeader("X-Session-Token") String token,
            @RequestBody MenuItem newItem) {
        authService.requireOwnership(token, id);
        MenuItem created = stallService.addMenuItem(id, newItem);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    @PatchMapping("/{id}/menu/{itemId}")
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable int id,
            @PathVariable int itemId,
            @RequestHeader("X-Session-Token") String token,
            @RequestBody MenuItem updates) {
        authService.requireOwnership(token, id);
        return ResponseEntity.ok(stallService.updateMenuItem(id, itemId, updates));
    }
    @DeleteMapping("/{id}/menu/{itemId}")
    public ResponseEntity<Map<String, Object>> deleteMenuItem(
            @PathVariable int id,
            @PathVariable int itemId,
            @RequestHeader("X-Session-Token") String token) {
        authService.requireOwnership(token, id);
        stallService.deleteMenuItem(id, itemId);
        return ResponseEntity.ok(Map.of("deleted", true, "itemId", itemId));
    }
    @PatchMapping("/{id}/menu/{itemId}/sold-out")
    public ResponseEntity<MenuItem> markSoldOut(
            @PathVariable int id,
            @PathVariable int itemId,
            @RequestHeader("X-Session-Token") String token) {
        authService.requireOwnership(token, id);
        return ResponseEntity.ok(stallService.markSoldOut(id, itemId));
    }
    @PatchMapping("/{id}/menu/{itemId}/available")
    public ResponseEntity<MenuItem> markAvailable(
            @PathVariable int id,
            @PathVariable int itemId,
            @RequestHeader("X-Session-Token") String token) {
        authService.requireOwnership(token, id);
        return ResponseEntity.ok(stallService.markAvailable(id, itemId));
    }
}
