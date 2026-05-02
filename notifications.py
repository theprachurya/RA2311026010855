#!/usr/bin/env python3
import heapq
import json
import requests
from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime

WEIGHT = {
    'placement': 3,
    'result': 2,
    'event': 1
}

@dataclass
class Notification:
    id: str
    type: str  
    timestamp: int  
    message: str

class TopNTracker:
    def __init__(self, n: int = 10):
        self.n = n
        self.heap = []  

    def push(self, notif: Notification):
        w = WEIGHT.get(notif.type.lower(), 0)
        key = (w, notif.timestamp, notif.id, notif)
        if len(self.heap) < self.n:
            heapq.heappush(self.heap, key)
        else:
            if key > self.heap[0]:
                heapq.heapreplace(self.heap, key)

    def top_n(self) -> List[Notification]:
        items = [entry[3] for entry in self.heap]
        return sorted(items, key=lambda x: (WEIGHT.get(x.type.lower(), 0), x.timestamp), reverse=True)


def fetch_notifications_from_api(api_url: str, token: str) -> Optional[List[dict]]:
    """Fetch notifications from the real API."""
    try:
        headers = {
            'Authorization': f'Bearer {token}'
        }
        response = requests.get(api_url, headers=headers, timeout=5)
        response.raise_for_status()
        return response.json().get('notifications', [])
    except Exception as e:
        print(f"Warning: Failed to fetch from API: {e}")
        return None


def load_auth_token(auth_file: str = 'authentication.json') -> Optional[str]:
    """Load Bearer token from authentication.json."""
    try:
        with open(auth_file, 'r') as f:
            auth_data = json.load(f)
            return auth_data.get('access_token')
    except Exception as e:
        print(f"Warning: Could not load auth token: {e}")
        return None


def get_mock_notifications() -> List[Notification]:
    """Generate mock notifications for fallback/testing."""
    base_ts = 1700000000
    types = ['placement', 'result', 'event']
    notifs = []
    for i in range(1, 31):
        t = types[(i-1) % 3]
        notifs.append(Notification(id=str(i), type=t, timestamp=base_ts + i*60, message=f"Notification {i} ({t})"))
    return notifs


def parse_timestamp_to_unix(ts_string: str) -> int:
    """Parse timestamp string '2026-05-02 00:04:21' to unix timestamp."""
    try:
        dt = datetime.strptime(ts_string, "%Y-%m-%d %H:%M:%S")
        return int(dt.timestamp())
    except Exception as e:
        print(f"Warning: Could not parse timestamp '{ts_string}': {e}")
        return 0


def main():
    api_url = "http://20.207.122.201/evaluation-service/notifications"
    token = load_auth_token()
    
    notifications = []
    if token:
        api_data = fetch_notifications_from_api(api_url, token)
        if api_data:
            for item in api_data:
                notif = Notification(
                    id=item.get('ID', str(len(notifications))),
                    type=item.get('Type', 'Event').lower(),
                    timestamp=parse_timestamp_to_unix(item.get('Timestamp', '')),
                    message=item.get('Message', '')
                )
                notifications.append(notif)
    
    if not notifications:
        print("Using mock data (API unavailable or no data returned)")
        notifications = get_mock_notifications()
    else:
        print(f"Fetched {len(notifications)} notifications from API")
    
    tracker = TopNTracker(n=10)
    for notif in notifications:
        tracker.push(notif)
    
    top = tracker.top_n()
    print("\nTop 10 Priority Notifications (highest first):")
    print("-" * 100)
    for idx, n in enumerate(top, 1):
        ts_str = datetime.fromtimestamp(n.timestamp).strftime('%Y-%m-%d %H:%M:%S')
        weight = WEIGHT.get(n.type.lower(), 0)
        print(f"{idx:2}. [Weight:{weight}] {n.type.upper():11} | {ts_str} | {n.message}")


if __name__ == '__main__':
    main()
