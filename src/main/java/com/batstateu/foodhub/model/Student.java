package com.batstateu.foodhub.model;
import jakarta.persistence.*;
@Entity
@Table(name = "student")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "sr_code", nullable = false, unique = true, length = 10)
    private String srCode;
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;
    @Column(name = "program", length = 100)
    private String program;
    public Student() {}
    public Student(String srCode, String fullName) {
        this.srCode   = srCode;
        this.fullName = fullName;
    }
    public Student(String srCode, String fullName, String program) {
        this.srCode   = srCode;
        this.fullName = fullName;
        this.program  = program;
    }
    public Long getId()               { return id; }
    public void setId(Long id)        { this.id = id; }
    public String getSrCode()              { return srCode; }
    public void   setSrCode(String srCode) { this.srCode = srCode; }
    public String getFullName()                { return fullName; }
    public void   setFullName(String fullName) { this.fullName = fullName; }
    public String getProgram()               { return program; }
    public void   setProgram(String program) { this.program = program; }
}
