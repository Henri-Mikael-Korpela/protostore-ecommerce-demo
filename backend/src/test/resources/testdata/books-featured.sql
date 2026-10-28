DELETE FROM book;

INSERT INTO book (isbn, title, featured)
    VALUES
        ('9780134685991', 'Effective Java', true),
        ('9780132350884', 'Clean Code', true),
        ('9780134757599', 'Refactoring', false);
