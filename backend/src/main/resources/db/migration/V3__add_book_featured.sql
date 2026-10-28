-- Books shown on the front page of the store.
ALTER TABLE book
    ADD COLUMN featured BOOLEAN NOT NULL DEFAULT false;
