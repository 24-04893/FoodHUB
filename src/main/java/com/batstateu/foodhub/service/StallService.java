package com.batstateu.foodhub.service;
import com.batstateu.foodhub.exception.NotFoundException;
import com.batstateu.foodhub.model.MenuItem;
import com.batstateu.foodhub.model.Stall;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
@Service
public class StallService {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final File stallsFile     = new File("./data/stalls.json");
    private final File menuStatesFile = new File("./data/menu_states.json");
    public List<Stall> getAllStalls() {
        return readStalls();
    }
    public List<Stall> getStallsByStatus(String status) {
        List<Stall> all = readStalls();
        if (status == null || status.isBlank()) return all;
        if (!status.equals("open") && !status.equals("closed"))
            throw new IllegalArgumentException("Status filter must be 'open' or 'closed'.");
        return all.stream()
                .filter(s -> status.equalsIgnoreCase(s.getStatus()))
                .collect(Collectors.toList());
    }
    public Stall getStallById(int id) {
        return readStalls().stream()
                .filter(s -> s.getId() == id)
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Stall with ID " + id + " not found."));
    }
    public List<Stall> searchStalls(String keyword) {
        if (keyword == null || keyword.isBlank()) return readStalls();
        String lower = keyword.toLowerCase();
        return readStalls().stream()
                .filter(s -> s.getName().toLowerCase().contains(lower)
                          || (s.getDescription() != null && s.getDescription().toLowerCase().contains(lower)))
                .collect(Collectors.toList());
    }
    public Stall updateStall(int id, Stall updates) {
        updates.validate();
        List<Stall> stalls = readStalls();
        Stall existing = stalls.stream()
                .filter(s -> s.getId() == id)
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Stall with ID " + id + " not found."));
        if (updates.getName()        != null) existing.setName(updates.getName());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getStatus()      != null) existing.setStatus(updates.getStatus());
        if (updates.getPhone()       != null) existing.setPhone(updates.getPhone());
        if (updates.getEmail()       != null) existing.setEmail(updates.getEmail());
        if (updates.getLocation()    != null) existing.setLocation(updates.getLocation());
        writeStalls(stalls);
        return existing;
    }
    public Stall toggleStallStatus(int id) {
        List<Stall> stalls = readStalls();
        Stall stall = stalls.stream()
                .filter(s -> s.getId() == id)
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Stall with ID " + id + " not found."));
        stall.toggleStatus();
        writeStalls(stalls);
        return stall;
    }
    public List<MenuItem> getMenuByStallId(int stallId) {
        getStallById(stallId);
        return loadMenuItems(stallId);
    }
    public List<MenuItem> getAvailableMenuItems(int stallId) {
        return getMenuByStallId(stallId).stream()
                .filter(MenuItem::isAvailable)
                .collect(Collectors.toList());
    }
    public MenuItem getMenuItemById(int stallId, int itemId) {
        return getMenuByStallId(stallId).stream()
                .filter(item -> item.getId() == itemId)
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Menu item " + itemId + " not found in stall " + stallId + "."));
    }
    public MenuItem addMenuItem(int stallId, MenuItem newItem) {
        getStallById(stallId);
        newItem.validate();
        List<MenuItem> items = loadMenuItems(stallId);
        int newId = items.stream().mapToInt(MenuItem::getId).max().orElse(0) + 1;
        newItem.setId(newId);
        items.add(newItem);
        saveMenuItems(stallId, items);
        updateMenuCount(stallId, items.size());
        return newItem;
    }
    public MenuItem updateMenuItem(int stallId, int itemId, MenuItem updates) {
        if (updates.getName() != null && updates.getName().isBlank())
            throw new IllegalArgumentException("Item name cannot be blank.");
        if (updates.getPrice() != 0 && updates.getPrice() < 0)
            throw new IllegalArgumentException("Price cannot be negative.");
        if (updates.getPrice() > 9999)
            throw new IllegalArgumentException("Price cannot exceed \u20b19,999.");
        List<MenuItem> items = loadMenuItems(stallId);
        MenuItem existing = items.stream()
                .filter(item -> item.getId() == itemId)
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Menu item " + itemId + " not found in stall " + stallId + "."));
        if (updates.getName()        != null) existing.setName(updates.getName());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getCategory()    != null) existing.setCategory(updates.getCategory());
        if (updates.getImage()       != null) existing.setImage(updates.getImage());
        if (updates.getPrice()       > 0)     existing.setPrice(updates.getPrice());
        if (updates.getAvailableRaw() != null) existing.setAvailable(updates.getAvailableRaw());
        saveMenuItems(stallId, items);
        return existing;
    }
    public void deleteMenuItem(int stallId, int itemId) {
        List<MenuItem> items = loadMenuItems(stallId);
        if (items.size() <= 1)
            throw new IllegalArgumentException("Cannot delete the last menu item. A stall must have at least one item.");
        boolean removed = items.removeIf(item -> item.getId() == itemId);
        if (!removed)
            throw new NotFoundException("Menu item " + itemId + " not found in stall " + stallId + ".");
        saveMenuItems(stallId, items);
        updateMenuCount(stallId, items.size());
    }
    public MenuItem markSoldOut(int stallId, int itemId) {
        List<MenuItem> items = loadMenuItems(stallId);
        MenuItem item = items.stream()
                .filter(i -> i.getId() == itemId)
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Menu item " + itemId + " not found in stall " + stallId + "."));
        if (!item.isAvailable())
            throw new IllegalArgumentException("Item is already marked as sold out.");
        item.setAvailable(false);
        saveMenuItems(stallId, items);
        return item;
    }
    public MenuItem markAvailable(int stallId, int itemId) {
        List<MenuItem> items = loadMenuItems(stallId);
        MenuItem item = items.stream()
                .filter(i -> i.getId() == itemId)
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Menu item " + itemId + " not found in stall " + stallId + "."));
        if (item.isAvailable())
            throw new IllegalArgumentException("Item is already available.");
        item.setAvailable(true);
        saveMenuItems(stallId, items);
        return item;
    }
    public Map<String, Object> getSummary() {
        List<Stall> stalls = readStalls();
        long open   = stalls.stream().filter(Stall::isOpen).count();
        long closed = stalls.size() - open;
        double avgRating = stalls.stream().mapToDouble(Stall::getRating).average().orElse(0.0);
        int totalMenuItems = stalls.stream().mapToInt(Stall::getMenuCount).sum();
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalStalls",    stalls.size());
        summary.put("openStalls",     open);
        summary.put("closedStalls",   closed);
        summary.put("totalMenuItems", totalMenuItems);
        summary.put("averageRating",  String.format("%.1f", avgRating));
        return summary;
    }
    private List<Stall> readStalls() {
        if (!stallsFile.exists()) return new ArrayList<>();
        try {
            return objectMapper.readValue(stallsFile, new TypeReference<>() {});
        } catch (IOException e) {
            throw new RuntimeException("Failed to read stalls data: " + e.getMessage());
        }
    }
    private void writeStalls(List<Stall> stalls) {
        try {
            ensureDirectoryExists(stallsFile);
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(stallsFile, stalls);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save stalls data: " + e.getMessage());
        }
    }
    private List<MenuItem> loadMenuItems(int stallId) {
        if (!menuStatesFile.exists()) return new ArrayList<>();
        try {
            Map<String, Object> states = objectMapper.readValue(menuStatesFile, new TypeReference<>() {});
            Object raw = states.get(String.valueOf(stallId));
            if (raw == null) return new ArrayList<>();
            String json = objectMapper.writeValueAsString(raw);
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (IOException e) {
            return new ArrayList<>();
        }
    }
    private void saveMenuItems(int stallId, List<MenuItem> items) {
        try {
            ensureDirectoryExists(menuStatesFile);
            Map<String, Object> states = new HashMap<>();
            if (menuStatesFile.exists()) {
                try {
                    states = objectMapper.readValue(menuStatesFile, new TypeReference<>() {});
                } catch (Exception ignored) {}
            }
            states.put(String.valueOf(stallId), items);
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(menuStatesFile, states);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save menu data: " + e.getMessage());
        }
    }
    private void updateMenuCount(int stallId, int count) {
        List<Stall> stalls = readStalls();
        stalls.stream()
              .filter(s -> s.getId() == stallId)
              .findFirst()
              .ifPresent(s -> s.setMenuCount(count));
        writeStalls(stalls);
    }
    private void ensureDirectoryExists(File file) {
        File dir = file.getParentFile();
        if (dir != null && !dir.exists()) dir.mkdirs();
    }
}
