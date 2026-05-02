Campus Notifications Microservice

Stage 1

- Run priority inbox script (uses `authentication.json` for API token):

```bash
python notifications.py
```

- To obtain `authentication.json` from `client_id_req.json`, set `AUTH_URL` and run:

```bash
export AUTH_URL="https://<AUTH-ENDPOINT>"
python tools/get_auth.py
```

Stage 2

- Frontend (Next.js + Material UI) lives in `notification_app_fe` and runs on `http://localhost:3000`:

```bash
cd notification_app_fe
npm install
npm run dev
```

Assets (screenshots / video) are in `assets/media`.

Notes

- `client_id_req.json` contains the request payload used to obtain tokens.
- Update `.gitignore` if you need to exclude additional local files such as `venv/` or `node_modules/`.
