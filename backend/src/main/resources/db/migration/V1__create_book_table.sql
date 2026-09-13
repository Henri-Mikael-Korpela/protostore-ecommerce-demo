CREATE TABLE book (
    -- UUID 7 is a time-ordered UUID. Suitable for high-write tables because
    -- the ordering can improve index locality and make IDs roughly sortable
    -- by creation time.
    -- The best modern UUID default AFAIK.
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    isbn TEXT CHECK (isbn ~ '^(?:\d{9}[\dX]|\d{13})$'),
    title TEXT NOT NULL
);