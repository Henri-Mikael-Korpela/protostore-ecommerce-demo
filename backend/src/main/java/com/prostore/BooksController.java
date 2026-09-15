package com.prostore;

import com.prostore.repository.BookRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.prostore.dto.Book;

@RestController
public class BooksController {

	private final BookRepository bookRepository;

	public BooksController(BookRepository bookRepository) {
		this.bookRepository = bookRepository;
	}

	@GetMapping("/api/books")
	public Book[] getBooks(
		@RequestParam(required = false) String search
   	) {
		var books = (search != null)
			? bookRepository.searchByTitle(search)
			: bookRepository.findAll();

		return books.stream()
				.map(book -> new Book(book.getIsbn(), book.getTitle()))
				.toArray(Book[]::new);
	}

}
