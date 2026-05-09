package com.batstateu.foodhub.model;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
@JsonIgnoreProperties(ignoreUnknown = true)
public class Stall {
    private Integer id;
    private String name;
    private String description;
    private String status;
    private double rating;
    private String phone;
    private String email;
    private String location;
    private String image;
    private int menuCount;
    public boolean isOpen() {
        return "open".equalsIgnoreCase(this.status);
    }
    public void toggleStatus() {
        this.status = isOpen() ? "closed" : "open";
    }
    public void validate() {
        if (name == null || name.isBlank())
            throw new IllegalArgumentException("Stall name is required.");
        if (name.length() > 100)
            throw new IllegalArgumentException("Stall name must be 100 characters or fewer.");
        if (description != null && description.length() > 500)
            throw new IllegalArgumentException("Description must be 500 characters or fewer.");
        if (rating < 0.0 || rating > 5.0)
            throw new IllegalArgumentException("Rating must be between 0.0 and 5.0.");
        if (status != null && !status.equals("open") && !status.equals("closed"))
            throw new IllegalArgumentException("Status must be 'open' or 'closed'.");
        if (phone != null && !phone.isBlank() && !phone.matches("^[0-9\\-+() ]{7,20}$"))
            throw new IllegalArgumentException("Phone number format is invalid.");
        if (email != null && !email.isBlank() && !email.matches("^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$"))
            throw new IllegalArgumentException("Email format is invalid.");
    }
    public Integer getId()                    { return id; }
    public void setId(Integer id)            { this.id = id; }
    public String getName()                   { return name; }
    public void setName(String name)         { this.name = name; }
    public String getDescription()            { return description; }
    public void setDescription(String d)     { this.description = d; }
    public String getStatus()                 { return status; }
    public void setStatus(String status)     { this.status = status; }
    public double getRating()                 { return rating; }
    public void setRating(double rating)     { this.rating = rating; }
    public String getPhone()                  { return phone; }
    public void setPhone(String phone)       { this.phone = phone; }
    public String getEmail()                  { return email; }
    public void setEmail(String email)       { this.email = email; }
    public String getLocation()               { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getImage()                  { return image; }
    public void setImage(String image)       { this.image = image; }
    public int getMenuCount()                 { return menuCount; }
    public void setMenuCount(int menuCount)  { this.menuCount = menuCount; }
}
