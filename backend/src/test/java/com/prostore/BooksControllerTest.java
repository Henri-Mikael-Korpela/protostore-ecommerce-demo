package com.prostore;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.prostore.model.Book;
import com.prostore.repository.BookRepository;

@WebMvcTest(BooksController.class)
class BooksControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookRepository bookRepository;

    @Test
    void getBooks_returnsBooksFromRepository() throws Exception {
        var book = new Book();
        book.setIsbn("978-0-13-468599-1");
        book.setTitle("Effective Java");
        when(bookRepository.findAll()).thenReturn(List.of(book));

        mockMvc.perform(get("/api/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isNotEmpty());
    }

    @Test
    void getBook_returnsNotFoundWhenRepositoryHasNoBook() throws Exception {
        var id = UUID.randomUUID();
        when(bookRepository.findById(id)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/books/{id}", id))
                .andExpect(status().isNotFound());
    }
}