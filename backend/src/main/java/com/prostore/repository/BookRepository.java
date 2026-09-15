package com.prostore.repository;

import java.util.List;
import java.util.UUID;

import com.prostore.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookRepository extends JpaRepository<Book, UUID> {

    // websearch_to_tsquery understands natural search syntax (quoted phrases, "or", "-" to exclude) instead of the
    // operator syntax plain to_tsquery needs. Results are ranked by relevance since a query can match many books.
    @Query(
        nativeQuery = true,
        value = """
        SELECT * FROM book
        WHERE search_vector @@ websearch_to_tsquery('english', :search)
        ORDER BY ts_rank(search_vector, websearch_to_tsquery('english', :search)) DESC
        """
    )
    List<Book> searchByTitle(@Param("search") String search);
}
