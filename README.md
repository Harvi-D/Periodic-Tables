# Periodic Tables

[Live Application](https://restaurant-reservation-nu.vercel.app/dashboard)


## Installation

1. Clone this repository to a local directory.
1. Run `cp ./back-end/.env.sample ./back-end/.env`.
1. Update the `./back-end/.env` file with the connection URLs to your PostgreSQL database instances.
1. Run `cp ./front-end/.env.sample ./front-end/.env`.
1. You should not need to make changes to the `./front-end/.env` file unless you want to connect to a backend at a location other than `http://localhost:5000`.
1. Run `npm install` to install project dependencies.
1. Run `npm run start:dev` to start the application in development mode.
<hr />

## Usage

A full-stack reservation system designed to simplify the management of a restaurant's daily reservations. 
Using ***Periodic Tables*** allows restaurant employees to:

* Create and Edit new reservations for customers
* Browse existing reservations by date
* Find specific reservations using the associated customers phone number
* Edit the number of tables in the restaurant and their capacity
* Seat reservations at a table, and mark that table as 'occupied' 
* Mark a table as 'free' once a party has left and the table is ready for the next guests 

## Tech Stack

* Node.js: server environment for backend execution
* Express: web app framework for developing the API
* React: UI logic and rendering
* Bootstrap: UI styling
* PostgreSQL: SQL database for application data
* ElephantSQL: host of postgreSQL instance
* Vercel: hosts production deployment

## Application Previews
### Navigation
![Navigation Menu](/front-end/screenshots/nav-bar.png)

Provides links to: the Dashboard, New Reservations, New Tables, and the Search feature.

### Dashboard
![Dashboard](/front-end/screenshots/dash.png)

This is the primary interface for browsing the restaurants tables and managing reservations by selecting a corresponding date at the top of the page. Reservations can be viewed here in order of the reservation time, and display all the crucial information regarding the party.

### New Reservation
![New Reservation](/front-end/screenshots/new-reservation.png)

This is the form that allows workers to create a new reservation for a customer. All inputs are required and validated based on the hours and days that the restaurant operates, the party size, and ensures that the requested date is made for a past date.

Once submitted the user will be redirected to the dashboard, and the new reservation will be displayed on the date requested. The cancel button will return users to the previous screen, and the reset button will return all inputs to their initial empty state.

![Submitted Reservation](/front-end/screenshots/new-reservation-after.png)

### Edit Reservation

Once a new reservation is displayed on the dashboard, users can click the 'Edit' button to make changes to it. Users will be returned to the Reservation form and can resubmit the reservation once the desired changes have been made.

### Cancel Reservation
![Cancel Reservation](/front-end/screenshots/new-reservation-cancel.png)

The 'Cancel' button on a reservation listed on the dashboard will permanentely delete it from the database.

### Seat Reservation
![Seat Reservation](/front-end/screenshots/seat-reservation.png)

This page will allow users to select a table for a reservation once the party is ready to be seated. The application will verify that the table capacity is not too small compared to the party size, and allow the user to submit the selection. Once a table is selected and submitted, the user will be returned to the dashboard, and the selected table will now be marked as occupied.

![Seat](/front-end/screenshots/seat.png)

Once the party has left the table, the user can now click the 'Finish' button to mark the table as 'free' again after clicking 'OK' on the dialogue box that appears.

![Finish Seat](/front-end/screenshots/seat-finish.png)

### New Table
![New Table](/front-end/screenshots/new-table.png)

This form will let users create new tables and add them to the database. New tables must have a name longer than two characters and a minimum capacity of one.

### Search by Number
![Search by Number](/front-end/screenshots/search.png)

This page allows users to enter a customers phone number to locate their reservation. This gives users an alternate method to find reservations when it is not optimal to find a reservation based on the date.

![Found Reservation](/front-end/screenshots/search-after.png)


## API Routes
| Method   | Route                                 | Function                                                                                                                                                                                                          |
|----------|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `GET`    | `/reservations`                       | Gets the complete list of reservations, sorted by `reservation_date` and `reservation_time`.                                                                                                                      |
| `GET`    | `/reservations?date=YYYY-MM-DD`       | Gets all reservations made for the specified date, sorted by `reservation_time`.                                                                                                                                  |
| `POST`   | `/reservations`                       | Validates the posted reservation, adding it to the database if validations pass.                                                                                                                                  |
| `GET`    | `/reservations/:reservationId`        | Gets the reservation with the specified ID, assuming such a reservation exists in the database.                                                                                                                   |
| `PUT`    | `/reservations/:reservationId`        | Validates the updated reservation information, updating the reservation with the specified ID using the sent data if validations pass.                                                                            |
| `PUT`    | `/reservations/:reservationId/status` | Updates the status of the reservation with the specified ID according to the `status` parameter inside of the request body data.                                                                                  |
| `GET`    | `/tables`                             | Gets the complete list of tables.                                                                                                                                                                                 |
| `POST`   | `/tables`                             | Validates the posted table, adding it to the database if validations pass.                                                                                                                                        |
| `PUT`    | `/tables/:tableId/seat`               | Seats the specified table using the reservation specified in the request body data. Updates the reservation's entry to a status of `seated` and the table's entry to the reservation_id of the given reservation. |
| `DELETE` | `/tables/:tableId/seat`               | Finishes the specified table. Updates the table's reservation_id to `null` and the associated reservation's status to `finished`.  

