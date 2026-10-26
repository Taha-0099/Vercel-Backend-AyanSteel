# Ayan Steel complete application

This branch publishes the uploaded frontend and backend, with server-verified login, protected API routes, and a same-origin React build.

The source bundle contains 66 files and excludes environment files, git history, build output, and dependencies. It is split into base64 parts because the publishing connector accepts text files. This is encoding, not encryption: all bundled source is public.

To inspect without installing or running anything:
```sh
cat deploy/source.part*.b64 | base64 --decode > source.tar.gz
sha256sum source.tar.gz
mkdir source
tar -xzf source.tar.gz -C source
```

Expected SHA256: 0b48ddf83ec9bb7d2bbe9f66bd8410551abcda3b57697daf3dabbe2ff3a83f98

Render: Node 22, free web service, build command `bash deploy/build.sh`, start command `cd deploy/app && exec node server.js`, health endpoint `/healthz`.

Configure MONGO_URI, SESSION_SECRET (32+ characters), ADMIN_EMAIL, ADMIN_PASSWORD_HASH (bcrypt), and NODE_ENV=production privately in Render. Never commit credentials.

Validated: production frontend build; authentication tests reject anonymous and demo-token access, enforce the mutation header, accept valid credentials, and invalidate logout sessions. Three pre-existing StockDashboard lint warnings remain. Live database operations, migration, and backups require separate verification. Existing AdminPanel analytics endpoints were absent from the uploaded backend and are not implemented by this deployment preparation.

The application does not import local database records. Keep the original local database until migration and restore testing are complete.
