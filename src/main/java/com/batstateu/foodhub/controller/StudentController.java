package com.batstateu.foodhub.controller;
import com.batstateu.foodhub.model.Student;
import com.batstateu.foodhub.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;
@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {
    private final StudentRepository repo;
    public StudentController(StudentRepository repo) {
        this.repo = repo;
    }
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String srCode = body == null ? null : body.get("srCode");
        if (srCode == null || srCode.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "SR Code required"));
        }
        if (!srCode.matches("^\\d{2}-\\d{5}$")) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Invalid format (YY-NNNNN)"));
        }
        Optional<Student> found = repo.findBySrCode(srCode.trim());
        if (found.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("ok", false, "error", "Not registered"));
        }
        Student s = found.get();
        return ResponseEntity.ok(Map.of(
            "ok", true,
            "srCode", s.getSrCode(),
            "name", s.getFullName(),
            "program", s.getProgram() != null ? s.getProgram() : "Student"
        ));
    }
    @GetMapping
    public ResponseEntity<List<Student>> listAll() {
        return ResponseEntity.ok(repo.findAll());
    }
    @PostMapping
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body) {
        String srCode = body == null ? null : body.get("srCode");
        String name = body == null ? null : body.get("fullName");
        if (srCode == null || name == null || srCode.isBlank() || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Missing fields"));
        }
        if (repo.existsBySrCode(srCode)) {
            return ResponseEntity.status(409).body(Map.of("ok", false, "error", "Already registered"));
        }
        Student saved = repo.save(new Student(srCode.trim(), name.trim()));
        return ResponseEntity.ok(Map.of("ok", true, "srCode", saved.getSrCode(), "name", saved.getFullName()));
    }
}
