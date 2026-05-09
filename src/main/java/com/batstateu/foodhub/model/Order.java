package com.batstateu.foodhub.model;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
@JsonIgnoreProperties(ignoreUnknown = true)
public class Order {
    private String id;
    private int stallId;
    private String stallName;
    private List<OrderItem> items;
    private String pickupTime;
    private String code;
    private String status;
    private String createdAt;
    private String studentNote;
    private String studentSrCode;
    private String studentName;
    private String studentProgram;
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OrderItem {
        private int menuItemId;
        private String name;
        private double price;
        private int quantity;
        public OrderItem() {} 
        public int getMenuItemId() { return menuItemId; }
        public void setMenuItemId(int id) { this.menuItemId = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int qty) { this.quantity = qty; }
        public double getSubtotal() { return price * quantity; }
    }
    public double getTotal() {
        if (items == null)
            return 0;
        return items.stream().mapToDouble(OrderItem::getSubtotal).sum();
    }
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public int getStallId() {
        return stallId;
    }
    public void setStallId(int stallId) {
        this.stallId = stallId;
    }
    public String getStallName() {
        return stallName;
    }
    public void setStallName(String n) {
        this.stallName = n;
    }
    public List<OrderItem> getItems() {
        return items;
    }
    public void setItems(List<OrderItem> i) {
        this.items = i;
    }
    public String getPickupTime() {
        return pickupTime;
    }
    public void setPickupTime(String t) {
        this.pickupTime = t;
    }
    public String getCode() {
        return code;
    }
    public void setCode(String code) {
        this.code = code;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public String getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(String t) {
        this.createdAt = t;
    }
    public String getStudentNote() {
        return studentNote;
    }
    public void setStudentNote(String note) { this.studentNote = note; }
    public String getStudentSrCode() { return studentSrCode; }
    public void setStudentSrCode(String code) { this.studentSrCode = code; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String name) { this.studentName = name; }
    public String getStudentProgram() { return studentProgram; }
    public void setStudentProgram(String program) { this.studentProgram = program; }
}
