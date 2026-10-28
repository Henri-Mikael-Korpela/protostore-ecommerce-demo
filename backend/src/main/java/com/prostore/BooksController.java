package com.prostore;

import java.util.UUID;

import com.prostore.dto.BookDto;
import com.prostore.model.Book;
import com.prostore.repository.BookRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BooksController {

    private final BookRepository bookRepository;

    public BooksController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @GetMapping("/api/books")
    public BookDto[] getBooks(
        @RequestParam(required = false) String search
    ) {
        var books = (search != null)
            ? bookRepository.searchByTitle(search)
            : bookRepository.findAll();

        return books.stream()
                .map(BooksController::toDto)
                .toArray(BookDto[]::new);
    }

    // A literal path takes precedence over the {id} pattern below, so "featured" is not read as an ID
    @GetMapping("/api/books/featured")
    public BookDto[] getFeaturedBooks() {
        return bookRepository.findByFeaturedTrueOrderByTitle().stream()
                .map(BooksController::toDto)
                .toArray(BookDto[]::new);
    }

    @GetMapping("/api/books/{id}")
    public ResponseEntity<BookDto> getBook(@PathVariable UUID id) {
        return bookRepository.findById(id)
                .map(book -> ResponseEntity.ok(toDto(book)))
                .orElse(ResponseEntity.notFound().build());
    }

    private static BookDto toDto(Book book) {
        return new BookDto(book.getId(), book.getIsbn(), book.getTitle());
    }

}
