UPDATE "users"
SET password_hash = encode(sha256('kvakva123'::bytea), 'hex')
WHERE id = '3519c519-eee0-46f8-83fd-6cd33548d227';