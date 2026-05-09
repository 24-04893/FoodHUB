package com.batstateu.foodhub.controller;
import com.batstateu.foodhub.model.Order;
import com.batstateu.foodhub.service.AuthService;
import com.batstateu.foodhub.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    private final OrderService orderService;
    private final AuthService  authService;
    public OrderController(OrderService orderService, AuthService authService) {
        this.orderService = orderService;
        this.authService  = authService;
    }
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(order));
    }
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrder(@PathVariable String orderId) {
        Order order = orderService.getOrderById(orderId);
        if (order == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(order);
    }
    @GetMapping("/stall/{stallId}")
    public ResponseEntity<List<Order>> getStallOrders(
            @PathVariable int stallId,
            @RequestHeader("X-Session-Token") String token) {
        authService.requireOwnership(token, stallId);
        return ResponseEntity.ok(orderService.getOrdersByStall(stallId));
    }
    @GetMapping("/student/{srCode}")
    public ResponseEntity<List<Order>> getStudentOrders(@PathVariable String srCode) {
        return ResponseEntity.ok(orderService.getOrdersByStudent(srCode));
    }
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Order> updateStatus(
            @PathVariable String orderId,
            @RequestHeader("X-Session-Token") String token,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        Order updated = orderService.updateStatus(orderId, newStatus);
        return ResponseEntity.ok(updated);
    }
    @PatchMapping("/{orderId}/received")
    public ResponseEntity<Order> markAsReceived(@PathVariable String orderId) {
        Order order = orderService.getOrderById(orderId);
        if (order == null) return ResponseEntity.notFound().build();
        if (!"ready".equalsIgnoreCase(order.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        Order updated = orderService.updateStatus(orderId, "completed");
        return ResponseEntity.ok(updated);
    }
    @PostMapping("/verify")
    public ResponseEntity<Order> verifyCode(
            @RequestHeader("X-Session-Token") String token,
            @RequestBody Map<String, Object> body) {
        int    stallId = Integer.parseInt(body.get("stallId").toString());
        String code    = body.get("code").toString();
        authService.requireOwnership(token, stallId);
        Order order = orderService.verifyCode(stallId, code);
        orderService.updateStatus(order.getId(), "completed");
        order.setStatus("completed");
        return ResponseEntity.ok(order);
    }
    @GetMapping("/stall/{stallId}/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics(
            @PathVariable int stallId,
            @RequestParam(required = false) Integer days,
            @RequestHeader("X-Session-Token") String token) {
        authService.requireOwnership(token, stallId);
        return ResponseEntity.ok(orderService.getAnalytics(stallId, days));
    }
    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}
