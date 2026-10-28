package com.prostore.dto;

import java.util.UUID;

import org.springframework.lang.Nullable;

public record BookDto(UUID id, @Nullable String isbn, String title) {

}