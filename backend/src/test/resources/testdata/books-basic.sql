-- Reset first so this fixture gives a deterministic table state
-- regardless of what ran before it (also makes it safe to run standalone).
DELETE FROM book;

INSERT INTO book (isbn, title)
    VALUES
        ('9780134685991', 'Effective Java'),
        ('9780132350884', 'Clean Code');
