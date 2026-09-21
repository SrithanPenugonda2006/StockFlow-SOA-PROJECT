-- Flyway Migration V3: Safely deduplicate historical test account emails and add UNIQUE constraint

-- 1. Disambiguate duplicate test account emails by appending unique +dup{id}@omnistock.com suffix
UPDATE users u1
SET email = REGEXP_REPLACE(u1.email, '@.*$', '') || '+dup' || u1.id || '@omnistock.com'
WHERE u1.id IN (
    SELECT u2.id
    FROM users u2
    WHERE u2.email IS NOT NULL
      AND u2.id NOT IN (
          SELECT MIN(id)
          FROM users
          WHERE email IS NOT NULL
          GROUP BY LOWER(email)
      )
);

-- 2. Add UNIQUE constraint on email
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);
