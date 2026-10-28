-- Reset first so this fixture gives a deterministic table state
-- regardless of what ran before it (also makes it safe to run standalone).
DELETE FROM book;

-- Featured, so the dev database seeded with this fixture has books to show on the front page
INSERT INTO book (isbn, title, featured)
    VALUES
        ('9780134685991', 'Effective Java', true),
        ('9780132350884', 'Clean Code', true);
