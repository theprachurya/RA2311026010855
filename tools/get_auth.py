#!/usr/bin/env python3
"""Simple helper to obtain/save authentication.json using client_id_req.json.

Usage:
  - Set environment variable `AUTH_URL` to the token endpoint.
  - Run: `python tools/get_auth.py`

The script posts the contents of `client_id_req.json` as JSON to `AUTH_URL`
and writes the response to `authentication.json`.
"""
import os
import sys
import json
import requests

ROOT = os.path.dirname(os.path.dirname(__file__))
CLIENT_REQ = os.path.join(ROOT, 'client_id_req.json')
AUTH_FILE = os.path.join(ROOT, 'authentication.json')

def load_client_req(path: str):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_auth(data, path: str):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)

def main():
    auth_url = os.environ.get('AUTH_URL')
    if not auth_url:
        print('ERROR: Set AUTH_URL environment variable to the token endpoint and try again.')
        sys.exit(2)

    if not os.path.exists(CLIENT_REQ):
        print(f'ERROR: {CLIENT_REQ} not found.')
        sys.exit(2)

    payload = load_client_req(CLIENT_REQ)
    print(f'Posting client request to {auth_url} ...')
    try:
        r = requests.post(auth_url, json=payload, timeout=10)
        r.raise_for_status()
        resp = r.json()
        save_auth(resp, AUTH_FILE)
        print(f'Wrote authentication to {AUTH_FILE}')
    except Exception as e:
        print('Failed to obtain token:', e)
        sys.exit(1)

if __name__ == '__main__':
    main()
