package com.batstateu.foodhub.controller;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {
    private final ObjectMapper mapper = new ObjectMapper();
    private final File stateFile = new File("./data/menu_states.json");
    @GetMapping("/menu-states")
    public ResponseEntity<Object> getMenuStates() {
        if (!stateFile.exists()) return ResponseEntity.ok(new HashMap<>());
        try {
            return ResponseEntity.ok(mapper.readValue(stateFile, Object.class));
        } catch (IOException e) {
            return ResponseEntity.ok(new HashMap<>());
        }
    }
    @PostMapping("/menu-states/{stallId}")
    public ResponseEntity<Object> saveMenuState(@PathVariable("stallId") Integer sid, @RequestBody Object payload) {
        if (payload == null) return ResponseEntity.badRequest().body(Map.of("error", "Missing body"));
        try {
            Map<String, Object> states = new HashMap<>();
            if (stateFile.exists()) {
                try { states = mapper.readValue(stateFile, new TypeReference<>() {}); } catch (Exception e) {}
            } else {
                File dir = stateFile.getParentFile();
                if (dir != null && !dir.exists()) dir.mkdirs();
            }
            states.put(String.valueOf(sid), payload);
            mapper.writerWithDefaultPrettyPrinter().writeValue(stateFile, states);
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
