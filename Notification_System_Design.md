# Stage 1

## Problem
Users lose track of important notifications due to high volume. Introduce a "Priority Inbox" that always displays the top `n` most important unread notifications (n configurable; default 10). Priority = combination of type weight and recency.

## Priority rules
- Type weight (primary): `placement` > `result` > `event`.
  - Numeric weights used: placement=3, result=2, event=1.
- Recency (secondary): newer notifications preferred when weights tie.

## Implementation summary
- Provided `notifications.py` which contains:
  - `Notification` dataclass (id, type, timestamp, message).
  - `TopNTracker` class keeping a min-heap of size `n`.
  - API integration with Bearer token authentication.
  - Fallback to mock data if API is unavailable or returns no data.

### API Integration
- **Endpoint**: `http://20.207.122.201/evaluation-service/notifications` (GET)
- **Auth**: Bearer token from `authentication.json`
- **Fallback**: If API unavailable or returns 401/no data, uses deterministic mock stream of 30 notifications for demo/testing purposes.

## Why a min-heap (size n)?
- For streaming data (notifications keep arriving), a fixed-size min-heap is the most efficient structure to maintain the top-n elements.
- Complexity: O(log n) per incoming notification, O(n) memory for the heap.

### How it works (streaming)
- For each incoming notification compute a sort key (weight, timestamp).
- Push into min-heap as `(weight, timestamp, id, notification)`.
- If heap size exceeds `n`, pop the smallest — this ensures the heap always contains the current top `n` notifications.
- At display time, sort the heap contents in descending order by `(weight, timestamp)` to show highest-priority first.

### Why this meets requirements
- Weight is primary (ensures all `placement` items outrank `result` and `event`).
- Recency breaks ties within the same weight bucket.
- Efficient for a live feed: each insert is O(log n) and memory usage is bounded.

## Running the script

### Prerequisites
```bash
pip install requests
```

### Execute
```bash
python notifications.py
```

Expected output: Top 10 priority notifications sorted by weight (desc) and timestamp (desc).

## Notes and extensions
- If more nuanced scoring is needed (e.g., time-decay, personalized weights), replace the `(weight, timestamp)` tuple with a single computed numeric score and keep the same min-heap approach.
- For DB-backed systems, the heap approach can be applied in-memory in the service or implemented via a priority index / SQL query for batch recomputation.
- Authentication token is loaded from `authentication.json` at runtime. Ensure the file is present in the working directory.
- The fallback mock data provides a deterministic test case with 30 notifications cycling through all three types.

## Files added in this stage
- `notifications.py` — streaming top-n implementation with live API and mock fallback.
- `sample_output.txt` — sample output from the deterministic run in `notifications.py`.
- `Notification_System_Design.md` — this file.

**Label**: Stage 1
