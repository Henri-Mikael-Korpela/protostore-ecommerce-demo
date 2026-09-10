package com.prostore;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.prostore.dto.Book;

@RestController
public class BooksController {

	@GetMapping("/api/books")
	public Book[] getBooks() {
		Book[] books = { new Book("9781098151331", "Learning Systems Thinking") };
		return books;
	}

}
