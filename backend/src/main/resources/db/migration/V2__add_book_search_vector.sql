-- Lexical (full-text) search support: a generated, indexed tsvector derived from the title.

-- "tsvector is a sorted list of distinct lexemes" (https://www.postgresql.org/docs/18/datatype-textsearch.html)

-- Kept in sync automatically by Postgres on every insert/update.
ALTER TABLE book
    ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (to_tsvector('english', title)) STORED;

-- GIN = Generalized Inverted Index.
-- GIN handles cases where indexed values are composite values.
CREATE INDEX book_search_vector_idx ON book USING GIN (search_vector);