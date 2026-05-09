package com.batstateu.foodhub.service;
import com.batstateu.foodhub.exception.NotFoundException;
import com.batstateu.foodhub.model.Seat;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
@Service
public class SeatingService {
    private static final int GENERAL_TABLES  = 20;
    private static final int PRIVATE_TABLES  =  6;
    private static final int SEATS_PER_TABLE =  8;
    private static final String SECTION_GENERAL = "general";
    private static final String SECTION_PRIVATE  = "private";
    private final File seatingFile = new File("./data/seating.json");
    private final ObjectMapper objectMapper = new ObjectMapper();
    private List<Seat> seats = loadOrInit();
    public List<Seat> getAllSeats()     { return Collections.unmodifiableList(seats); }
    public List<Seat> getGeneralSeats() {
        return seats.stream().filter(s -> SECTION_GENERAL.equals(s.getSection())).collect(Collectors.toList());
    }
    public List<Seat> getPrivateSeats() {
        return seats.stream().filter(s -> SECTION_PRIVATE.equals(s.getSection())).collect(Collectors.toList());
    }
    public List<Seat> getSeatsForTable(String section, int tableId) {
        validateSection(section);
        int maxTables = SECTION_GENERAL.equals(section) ? GENERAL_TABLES : PRIVATE_TABLES;
        if (tableId < 1 || tableId > maxTables)
            throw new NotFoundException("Table " + tableId + " does not exist in " + section + " section. Valid range: 1\u2013" + maxTables + ".");
        return seats.stream()
                .filter(s -> section.equals(s.getSection()) && s.getTableId() == tableId)
                .collect(Collectors.toList());
    }
    public Map<String, Object> getSeatingSummary() {
        long genAvailable = getGeneralSeats().stream().filter(s -> !s.isOccupied()).count();
        long genOccupied  = getGeneralSeats().stream().filter(Seat::isOccupied).count();
        long pvtAvailable = getPrivateSeats().stream().filter(s -> !s.isOccupied()).count();
        long pvtOccupied  = getPrivateSeats().stream().filter(Seat::isOccupied).count();
        Map<String, Object> gen = new LinkedHashMap<>();
        gen.put("available", genAvailable);
        gen.put("occupied",  genOccupied);
        gen.put("total",     genAvailable + genOccupied);
        Map<String, Object> pvt = new LinkedHashMap<>();
        pvt.put("available", pvtAvailable);
        pvt.put("occupied",  pvtOccupied);
        pvt.put("total",     pvtAvailable + pvtOccupied);
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("general", gen);
        summary.put("private", pvt);
        return summary;
    }
    public Seat occupySeat(String section, int tableId) {
        validateSection(section);
        List<Seat> tableSeats = getSeatsForTable(section, tableId);
        Seat freeSeat = tableSeats.stream()
                .filter(s -> !s.isOccupied())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Table " + tableId + " in the " + section + " section is fully occupied."));
        freeSeat.occupy();
        persist();
        return freeSeat;
    }
    public Seat freeSeat(String section, int tableId) {
        validateSection(section);
        List<Seat> tableSeats = getSeatsForTable(section, tableId);
        Seat occupiedSeat = tableSeats.stream()
                .filter(Seat::isOccupied)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Table " + tableId + " in the " + section + " section has no occupied seats."));
        occupiedSeat.free();
        persist();
        return occupiedSeat;
    }
    public void resetAllSeats() {
        seats.forEach(s -> s.setOccupied(false));
        persist();
    }
    private void validateSection(String section) {
        if (!SECTION_GENERAL.equals(section) && !SECTION_PRIVATE.equals(section))
            throw new IllegalArgumentException("Section must be 'general' or 'private'. Got: '" + section + "'.");
    }
    private List<Seat> loadOrInit() {
        if (seatingFile.exists()) {
            try {
                return objectMapper.readValue(seatingFile, new TypeReference<>() {});
            } catch (IOException ignored) {}
        }
        return initFreshSeating();
    }
    private List<Seat> initFreshSeating() {
        List<Seat> result = new ArrayList<>();
        int id = 1;
        for (int t = 1; t <= GENERAL_TABLES; t++) {
            for (int sn = 1; sn <= SEATS_PER_TABLE; sn++) {
                Seat seat = new Seat();
                seat.setId(id++);
                seat.setTableId(t);
                seat.setSeatNumber(sn);
                seat.setOccupied(false);
                seat.setSection(SECTION_GENERAL);
                result.add(seat);
            }
        }
        for (int t = 1; t <= PRIVATE_TABLES; t++) {
            for (int sn = 1; sn <= SEATS_PER_TABLE; sn++) {
                Seat seat = new Seat();
                seat.setId(id++);
                seat.setTableId(t);
                seat.setSeatNumber(sn);
                seat.setOccupied(false);
                seat.setSection(SECTION_PRIVATE);
                result.add(seat);
            }
        }
        return result;
    }
    private void persist() {
        try {
            File dir = seatingFile.getParentFile();
            if (dir != null && !dir.exists()) dir.mkdirs();
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(seatingFile, seats);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save seating data: " + e.getMessage());
        }
    }
}
