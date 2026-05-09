package com.batstateu.foodhub.model;
public class Seat {
    private int id;
    private int tableId;
    private int seatNumber;
    private boolean occupied;
    private String section;
    public void occupy() {
        if (this.occupied)
            throw new IllegalStateException("Seat " + seatNumber + " at Table " + tableId + " is already occupied.");
        this.occupied = true;
    }
    public void free() {
        if (!this.occupied)
            throw new IllegalStateException("Seat " + seatNumber + " at Table " + tableId + " is already free.");
        this.occupied = false;
    }
    public int getId()                   { return id; }
    public void setId(int id)           { this.id = id; }
    public int getTableId()              { return tableId; }
    public void setTableId(int t)       { this.tableId = t; }
    public int getSeatNumber()           { return seatNumber; }
    public void setSeatNumber(int n)    { this.seatNumber = n; }
    public boolean isOccupied()          { return occupied; }
    public void setOccupied(boolean o)  { this.occupied = o; }
    public String getSection()           { return section; }
    public void setSection(String s)    { this.section = s; }
}
