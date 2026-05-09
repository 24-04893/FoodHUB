package com.batstateu.foodhub.controller;
import com.batstateu.foodhub.model.Seat;
import com.batstateu.foodhub.service.AuthService;
import com.batstateu.foodhub.service.SeatingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/seating")
@CrossOrigin(origins = "*")
public class SeatingController {
    private final SeatingService seatingService;
    private final AuthService authService;
    public SeatingController(SeatingService seatingService, AuthService authService) {
        this.seatingService = seatingService;
        this.authService    = authService;
    }
    @GetMapping
    public ResponseEntity<List<Seat>> getAllSeats() {
        return ResponseEntity.ok(seatingService.getAllSeats());
    }
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(seatingService.getSeatingSummary());
    }
    @GetMapping("/{section}")
    public ResponseEntity<List<Seat>> getSeatsBySection(@PathVariable String section) {
        List<Seat> seats = "general".equals(section)
                ? seatingService.getGeneralSeats()
                : seatingService.getPrivateSeats();
        return ResponseEntity.ok(seats);
    }
    @GetMapping("/{section}/table/{tableId}")
    public ResponseEntity<List<Seat>> getTableSeats(@PathVariable String section, @PathVariable int tableId) {
        return ResponseEntity.ok(seatingService.getSeatsForTable(section, tableId));
    }
    @PostMapping("/{section}/table/{tableId}/occupy")
    public ResponseEntity<Seat> occupySeat(@PathVariable String section,
                                           @PathVariable int tableId,
                                           @RequestHeader("X-Session-Token") String token) {
        authService.getValidSession(token);
        return ResponseEntity.ok(seatingService.occupySeat(section, tableId));
    }
    @PostMapping("/{section}/table/{tableId}/free")
    public ResponseEntity<Seat> freeSeat(@PathVariable String section,
                                         @PathVariable int tableId,
                                         @RequestHeader("X-Session-Token") String token) {
        authService.getValidSession(token);
        return ResponseEntity.ok(seatingService.freeSeat(section, tableId));
    }
    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetSeats(@RequestHeader("X-Session-Token") String token) {
        authService.getValidSession(token);
        seatingService.resetAllSeats();
        return ResponseEntity.ok(Map.of("reset", true, "message", "All seats are now available."));
    }
}
