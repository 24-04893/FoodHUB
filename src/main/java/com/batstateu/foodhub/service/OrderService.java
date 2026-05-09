package com.batstateu.foodhub.service;
import com.batstateu.foodhub.model.Order;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.io.File;
import java.io.IOException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
@Service
public class OrderService {
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
    private final File ordersFile = new File("./data/orders.json");
    private final SecureRandom random = new SecureRandom();
    public Order createOrder(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty())
            throw new IllegalArgumentException("Order must contain at least one item.");
        if (order.getPickupTime() == null || order.getPickupTime().isBlank())
            throw new IllegalArgumentException("Pickup time is required.");
        List<Order> orders = readOrders();
        order.setId(UUID.randomUUID().toString());
        order.setCode(generateCode());
        order.setStatus("pending");
        order.setCreatedAt(Instant.now().toString());
        orders.add(order);
        writeOrders(orders);
        return order;
    }
    public List<Order> getOrdersByStall(int stallId) {
        List<Order> allOrders = readOrders();
        List<Order> filtered = allOrders.stream()
                .filter(o -> o.getStallId() == stallId)
                .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
                .collect(Collectors.toList());
        System.out.println("[OrderService] Found " + filtered.size() + " orders for stall " + stallId + " (out of " + allOrders.size() + " total)");
        return filtered;
    }
    public List<Order> getOrdersByStudent(String srCode) {
        List<Order> allOrders = readOrders();
        List<Order> filtered = allOrders.stream()
                .filter(o -> srCode.equalsIgnoreCase(o.getStudentSrCode()))
                .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
                .collect(Collectors.toList());
        return filtered;
    }
    public Order getOrderById(String orderId) {
        return readOrders().stream()
                .filter(o -> o.getId().equals(orderId))
                .findFirst()
                .orElse(null);
    }
    public List<Order> getAllOrders() {
        List<Order> all = readOrders();
        all.sort(Comparator.comparing(Order::getCreatedAt).reversed());
        return all;
    }
    public Order updateStatus(String orderId, String newStatus) {
        List<String> allowed = List.of("pending", "ready", "completed", "cancelled");
        if (!allowed.contains(newStatus))
            throw new IllegalArgumentException("Status must be one of: " + String.join(", ", allowed));
        List<Order> orders = readOrders();
        Order order = orders.stream()
                .filter(o -> o.getId().equals(orderId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(newStatus);
        writeOrders(orders);
        return order;
    }
    public Order verifyCode(int stallId, String code) {
        return readOrders().stream()
                .filter(o -> o.getStallId() == stallId
                          && o.getCode().equalsIgnoreCase(code)
                          && "pending".equals(o.getStatus()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No pending order with that code found for this stall."));
    }
    public Map<String, Object> getAnalytics(int stallId, Integer days) {
        List<Order> stall = getOrdersByStall(stallId);
        if (days != null && days > 0) {
            Instant threshold = Instant.now().minus(java.time.Duration.ofDays(days));
            stall = stall.stream()
                    .filter(o -> {
                        try {
                            return Instant.parse(o.getCreatedAt()).isAfter(threshold);
                        } catch (Exception e) {
                            return true;
                        }
                    })
                    .collect(Collectors.toList());
        }
        long completed  = stall.stream().filter(o -> "completed".equals(o.getStatus())).count();
        long pending    = stall.stream().filter(o -> "pending".equals(o.getStatus())).count();
        long ready      = stall.stream().filter(o -> "ready".equals(o.getStatus())).count();
        double revenue  = stall.stream()
                .filter(o -> "completed".equals(o.getStatus()))
                .mapToDouble(Order::getTotal).sum();
        double avgOrder = completed > 0 ? revenue / completed : 0;
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalOrders",     stall.size());
        result.put("completedOrders", completed);
        result.put("pendingOrders",   pending);
        result.put("readyOrders",     ready);
        result.put("totalRevenue",    Math.round(revenue * 100.0) / 100.0);
        result.put("avgOrderValue",   Math.round(avgOrder * 100.0) / 100.0);
        return result;
    }
    private String generateCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) sb.append(chars.charAt(random.nextInt(chars.length())));
        return sb.toString();
    }
    private List<Order> readOrders() {
        if (!ordersFile.exists()) return new ArrayList<>();
        try {
            return objectMapper.readValue(ordersFile, new TypeReference<List<Order>>() {});
        } catch (IOException e) {
            System.err.println("[OrderService] Error reading orders.json: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    private void writeOrders(List<Order> orders) {
        try {
            File dir = ordersFile.getParentFile();
            if (dir != null && !dir.exists()) dir.mkdirs();
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(ordersFile, orders);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save orders: " + e.getMessage());
        }
    }
}
