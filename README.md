# CV Management System

A full-stack web application for managing CVs, positions, and recruitment workflows. Recruiters can post openings and review candidate CVs; candidates build and publish their profiles; administrators manage the platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core Web API |
| ORM | Entity Framework Core |
| Database | PostgreSQL / SQL Server |
| Frontend | React + TypeScript |
| Auth | JWT Bearer |

---

## Roles

| Role | Capabilities |
|---|---|
| **Administrator** | Full platform access — manage users, positions, attributes |
| **Recruiter** | Create positions, post job announcements, review CVs |
| **Candidate** | Build CV, attach projects, apply to positions |

---
## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- SQL Server instance
- Node.js (for frontend)

### 1. Clone the repository

```bash
git clone https://github.com/YodgorbekSheraliyev/CV-Management.git
cd CV-Management
```

### 2. Configure the database

Update `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=cvmanagement;Username=postgres;Password=password"
  }
}
```

### 3. Apply migrations

```bash
cd backend
dotnet ef database update
```

### 4. Run the backend

```bash
dotnet run
```
## Seed Data

The app seeds initial data automatically on startup via `DataSeeder.cs`.

To trigger it manually, ensure this is in `Program.cs`:

```csharp
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DataContext>();
    await DataSeeder.SeedAsync(db);
}
```

### Default Accounts

| Role | Email | Password |
|---|---|---|
| Administrator | admin@cvmanager.com | Admin@123 |
| Recruiter | recruiter1@cvmanager.com | Recruiter@123 |
| Recruiter | recruiter2@cvmanager.com | Recruiter@123 |
| Candidate | candidate1@cvmanager.com | Candidate@123 |
| Candidate | candidate2@cvmanager.com | Candidate@123 |
| Candidate | candidate3@cvmanager.com | Candidate@123 |

> **Change all passwords before going to production.**

---

## Key Features

- **Dynamic Attributes** — Positions define which attributes (skills, certifications, personal info) are required on a CV
- **Position Access Rules** — Rule-based filtering of candidates using comparison operators on attribute values
- **CV Likes** — Recruiters can like published CVs
- **Posts / Job Announcements** — Recruiters publish posts linked to positions
- **Optimistic Concurrency** — `Version` field on `User`, `CV`, and `Position` prevents lost updates

---

## License

MIT