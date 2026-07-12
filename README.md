# TransitOps

TransitOps is a smart transport operations platform designed to manage company vehicles, drivers, trips, and transportation expenses from one centralized system.

It replaces manual logbooks and spreadsheets with a digital workflow that improves safety, fleet visibility, and operational efficiency.

## Problem Statement

Companies managing delivery fleets often face problems such as:

- Driver and vehicle scheduling conflicts
- Assignment of unavailable drivers or vehicles
- Expired driving licences
- Vehicle overloading
- Poor tracking of fuel, toll, repair, and maintenance costs
- Limited visibility into trip status

TransitOps solves these problems through a centralized transport management system.

## Core Modules

### Vehicle Management

- Add and manage vehicles
- Track mileage and load capacity
- Monitor availability
- Track maintenance status
- Prevent vehicles marked `In Shop` from being assigned

### Driver Management

- Maintain driver profiles
- Track licence expiry
- Record safety scores
- Manage driver availability
- Block expired or suspended drivers

### Trip Management

- Create and schedule trips
- Assign eligible drivers and vehicles
- Record source, destination, load, and timing
- Track trip status
- Update vehicle and driver availability automatically

### Expense Management

- Record fuel expenses
- Track toll charges
- Store repair costs
- Track maintenance costs
- View trip-wise expenses

## Smart Business Rules

### Driver Eligibility

A driver cannot be assigned when:

- Their licence has expired
- They are suspended
- They are already on another trip

### Vehicle Capacity Validation

A vehicle cannot be assigned a load greater than its capacity.

Example:

```text
Vehicle capacity: 500 kg
Trip load: 600 kg
Result: Assignment blocked
```

### Automatic Status Updates

When a trip starts:

```text
Driver status -> On Trip
Vehicle status -> On Trip
```

When a trip is completed:

```text
Driver status -> Available
Vehicle status -> Available
```

### Maintenance Protection

Vehicles marked `In Shop` are removed from the available vehicle selection list.

## Project Structure

```text
TransitOps-Oodo/
├── backend/
├── frontend/
└── README.md
```

## Getting Started

### Clone the repository

```bash
git clone https://github.com/your-username/TransitOps-Oodo.git
```

### Install backend dependencies

```bash
cd backend
npm install
```

### Install frontend dependencies

```bash
cd ../frontend
npm install
```

### Run the project

Use the scripts available in the respective `package.json` files.

Frontend example:

```bash
cd frontend
npm run dev
```

Backend example:

```bash
cd backend
npm run dev
```

## Current Status

- Repository setup completed
- Frontend structure created
- Backend structure created
- PostgreSQL configuration added
- Core modules under development

## Team Workflow

Each team member works on a separate Git branch and submits changes using a pull request.

Example branches:

```text
docs/readme
feature/vehicle-management
feature/driver-management
feature/trip-management
feature/expense-dashboard
```

## Team

Developed by a team of four for a hackathon project.

## License

This project is intended for educational and hackathon use.