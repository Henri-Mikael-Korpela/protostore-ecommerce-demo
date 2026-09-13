package com.prostore.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.util.UUID;

@Entity
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;

    private String isbn;

    private String title;

    public UUID getId() { return id; }

    public String getIsbn() { return isbn; }

    public void setIsbn(String value) { isbn = value; }

    public String getTitle() { return title; }

    public void setTitle(String value) { title = value; }
}
