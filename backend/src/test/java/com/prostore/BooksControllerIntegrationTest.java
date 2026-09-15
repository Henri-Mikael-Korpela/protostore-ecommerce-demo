package com.prostore;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Runs the real schema (via Flyway, against the docker-compose `db` service) so
// the fixtures in src/test/resources/testdata are validated against the actual
// migrations on every run instead of drifting out of sync silently.
//
// Requires `docker compose up db` to be running (see build.gradle's `test` task).
//
// @Transactional wraps each test (including its @Sql fixture) in one transaction
// that's rolled back afterwards, so this never leaves permanent changes in the
// dev database.
@AutoConfigureMockMvc
@SpringBootTest
@Transactional
class BooksControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @Sql("/testdata/books-basic.sql")
    void getBooks_returnsBooksSeededFromFixture() throws Exception {
        mockMvc.perform(get("/api/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath(
                    "$[*].title",
                    containsInAnyOrder("Clean Code", "Effective Java")
                ));
    }

    @Test
    @Sql("/testdata/books-basic.sql")
    void getBooks_returnsBooksSeededFromFixtureBySearchParamWhenNameMatches() throws Exception {
        mockMvc.perform(get("/api/books")
                .param("search", "Effective")
            )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Effective Java"));
    }

    @Test
    @Sql("/testdata/books-basic.sql")
    void getBooks_returnsNoBooksSeededFromFixtureBySearchParamWhenNameDoesNotMatch() throws Exception {
        mockMvc.perform(get("/api/books")
                        .param("search", "Non-existent")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @Sql("/testdata/books-many.sql")
    void getBooks_returnsAllBooksFromLargerFixture() throws Exception {
        mockMvc.perform(get("/api/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath(
                    "$[*].title",
                        containsInAnyOrder(
                    "Effective Java",
                            "Clean Code",
                            "The Pragmatic Programmer",
                            "Domain-Driven Design",
                            "Refactoring"
                        )
                ));
    }

    @Test
    @Sql("/testdata/books-many.sql")
    void getBooks_returnsBooksFromLargerFixtureByName2() throws Exception {
        mockMvc.perform(
            get("/api/books").param("search", "java effective")
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath(
                        "$[*].title",
                        containsInAnyOrder(
                                "Effective Java"
                        )
                ));
    }

    @Test
    @Sql("/testdata/books-with-null-isbn.sql")
    void getBooks_handlesBookWithoutIsbn() throws Exception {
        mockMvc.perform(get("/api/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].isbn").value(nullValue()))
                .andExpect(jsonPath("$[0].title").value("A Book Without an ISBN"));
    }
}
