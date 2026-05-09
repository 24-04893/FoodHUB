package com.batstateu.foodhub.model;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
@JsonIgnoreProperties(ignoreUnknown = true)
public class MenuItem {
    private int id;
    private String name;
    private String description;
    private double price;
    private Boolean available;
    private String category;
    private String image;
    private Integer stock;
    private int lowStockThreshold = 5;
    public void validate() {
        if (name == null || name.isBlank())
            throw new IllegalArgumentException("Menu item name is required.");
        if (name.length() > 100)
            throw new IllegalArgumentException("Item name must be 100 characters or fewer.");
        if (price <= 0)
            throw new IllegalArgumentException("Price must be greater than 0.");
        if (price > 9999)
            throw new IllegalArgumentException("Price cannot exceed \u20b19,999.");
        if (description != null && description.length() > 300)
            throw new IllegalArgumentException("Description must be 300 characters or fewer.");
        String[] allowed = {"Main Dish", "Beverage", "Snack", "Dessert", "Appetizer"};
        if (category != null && !category.isBlank()) {
            boolean valid = false;
            for (String c : allowed) {
                if (c.equalsIgnoreCase(category)) { valid = true; break; }
            }
            if (!valid)
                throw new IllegalArgumentException("Category must be one of: Main Dish, Beverage, Snack, Dessert, Appetizer.");
        }
    }
    public boolean isLowStock() {
        return stock != null && stock >= 0 && stock <= lowStockThreshold;
    }
    public int getId()                   { return id; }
    public void setId(int id)           { this.id = id; }
    public String getName()              { return name; }
    public void setName(String name)    { this.name = name; }
    public String getDescription()       { return description; }
    public void setDescription(String d){ this.description = d; }
    public double getPrice()             { return price; }
    public void setPrice(double price)  { this.price = price; }
    public boolean isAvailable()         { return available != null && available; }
    public Boolean getAvailableRaw()     { return available; }
    public void setAvailable(Boolean a) { this.available = a; }
    public String getCategory()          { return category; }
    public void setCategory(String c)   { this.category = c; }
    public String getImage()             { return image; }
    public void setImage(String image)  { this.image = image; }
    public Integer getStock()            { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public int getLowStockThreshold()           { return lowStockThreshold; }
    public void setLowStockThreshold(int t)    { this.lowStockThreshold = t; }
}
