# Booking cases

Scope: the Booking screen in `sample/`. Expected prices below are requirements in this file. Do not recompute them from application code.

## BK-01 Confirm a booking when the driver, vehicle, and rate are ready

- Origin: supplied case
- Role: dispatcher on the sample environment. No login screen exists.
- Preconditions: driver Ana is available. Vehicle Sedan is assigned to Ana. Sedan rate is 42.00 USD.

| Step | Action | Expected result | Source |
| --- | --- | --- | --- |
| 1 | Open Booking | Driver and Vehicle fields are shown. Confirm booking is unavailable until a rate is shown. | This case |
| 2 | Select driver Ana | Ana can be selected. Vehicles for Ana become available. | This case |
| 3 | Select vehicle Sedan | The page shows Rate 42.00 USD. Confirm booking becomes available. | This case |
| 4 | Confirm booking | The booking result names Ana, Sedan, and 42.00 USD, and includes a booking id of the form BK-####. | This case |

- Cleanup: delete the booking created by the run.

## BK-02 An unavailable driver cannot be assigned

- Origin: supplied case
- Preconditions: driver Ben is unavailable.

| Step | Action | Expected result | Source |
| --- | --- | --- | --- |
| 1 | Open Booking | Ben is listed as unavailable and cannot be selected. | This case |
| 2 | Leave Ben unselected | No booking is created for Ben. | This case |

## BK-03 A missing rate blocks confirmation

- Origin: supplied case
- Preconditions: driver Ana is available. Vehicle Van is assigned to Ana. Van has no configured rate.

| Step | Action | Expected result | Source |
| --- | --- | --- | --- |
| 1 | Select driver Ana and vehicle Van | The page states that no rate is configured. | This case |
| 2 | Attempt to confirm | Confirm booking stays unavailable. No booking is created. | This case |

## BK-04 A manager voids a confirmed booking

- Origin: supplied case
- Preconditions: a manager role that can void bookings.
- Expected result: after void, the booking is no longer active.
- Decision: blocked in this sample. The environment has no manager role and no void API. No run command exists until that dependency exists.
