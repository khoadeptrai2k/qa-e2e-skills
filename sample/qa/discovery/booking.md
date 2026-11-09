# Booking discovery

Live walk of `http://127.0.0.1:4173/` on 2026-11-09. Visited: initial form, Ana plus Sedan with rate 42.00 USD, confirm success, Ana plus Van with no rate, Ben disabled in the driver list. Not explored: refresh during an in-flight confirm, keyboard-only submit, Truck (it belongs to unavailable driver Ben and never appears).

| ID | UI evidence | Missing scenario | Expected result and source | Decision |
| --- | --- | --- | --- | --- |
| DISC-01 | After Ana / Sedan / Confirm showed `Booking BK-1003 confirmed for Ana, Sedan at 42.00 USD`, Confirm stayed enabled. A second click replaced the status with `Booking BK-1004 confirmed for Ana, Sedan at 42.00 USD`. `GET /api/bookings` then returned both BK-1003 and BK-1004. | A second confirm on an unchanged form creates another booking. | Unknown. No supplied case says whether confirm is single-shot. `index.html` submit handler does not disable the button or ignore a repeat. `server.mjs` `POST /api/bookings` allocates a new id and appends every accepted body. | Propose. Question: should the second confirm be ignored, or is a second booking correct? |

Do not automate DISC-01 until that question has an answer. No test file and no run command exist for it.
