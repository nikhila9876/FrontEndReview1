# FSAD39 Full Stack Setup (Upgraded)

## 1. What Is Included

### Backend (`backend/`)
- Spring Boot 3.3.5
- Layered structure:
  - `controller`
  - `service` + `service/impl`
  - `repository`
  - `model`
  - `dto`
  - `config`
  - `exception`
- JWT auth with roles (`ADMIN`, `STUDENT`)
- Role-based authorization
- Swagger UI
- ModelMapper DTO mapping
- Global exception handling

### Frontend (`src/`)
- React + Vite
- Axios with JWT auth header
- Register with role selection
- Role-based routing and dashboards
- Admin pages:
  - students list
  - milestone add/edit/delete
  - feedback create/list
- Student pages:
  - milestones from backend
  - feedback from backend
  - editable profile
- Common profile page support for both roles

## 2. Database Design (MySQL)

Tables:
- `users`
- `profiles`
- `milestones`
- `feedbacks`
- `projects` (existing feature retained)

Schema file:
- `backend/mysql-schema.sql`

Auto-creation:
- `spring.jpa.hibernate.ddl-auto=update`

## 3. Backend Run

1. Open terminal:
```powershell
cd C:\Users\nikhi\Downloads\fsad39-main\backend
```

2. Set DB credentials (important):
```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
```

3. Start backend:
```powershell
mvn spring-boot:run
```

4. Verify startup:
- `Tomcat started on port 8080`
- no MySQL access denied errors

5. Swagger:
- `http://localhost:8080/swagger-ui.html`

## 4. Frontend Run

1. Open new terminal:
```powershell
cd C:\Users\nikhi\Downloads\fsad39-main
npm install
npm run dev
```

2. Open:
- `http://localhost:5173`

## 5. API Groups

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Admin APIs
- `GET /api/admin/students`
- `POST /api/admin/students/{studentId}/milestones`
- `PUT /api/admin/milestones/{milestoneId}`
- `DELETE /api/admin/milestones/{milestoneId}`
- `POST /api/admin/students/{studentId}/feedbacks`
- `GET /api/admin/feedbacks`

### Student APIs
- `GET /api/student/milestones`
- `GET /api/student/feedbacks`
- `GET /api/student/profile`
- `PUT /api/student/profile`

### Common APIs
- `GET /api/users/me`
- `GET /api/profile/me`
- `PUT /api/profile/me`

### Required Milestone Endpoint
- `GET /api/milestones/student/{id}`

### Existing Feature Retained
- Project CRUD under `/api/projects`

## 6. JWT + Roles

- JWT generated on login/register
- Role included in token claims
- Role authorization enforced:
  - `/api/admin/**` => ADMIN only
  - `/api/student/**` => STUDENT only
  - `/api/profile/**`, `/api/users/me`, `/api/milestones/student/{id}`, `/api/projects/**` => authenticated role-based access checks

## 7. Postman

Import:
- `postman/FSAD39.postman_collection.json`
- `postman/FSAD39.local.postman_environment.json`

Suggested order:
1. Register Student
2. Register Admin
3. Login Admin
4. View All Students (sets `studentId`)
5. Add Milestone to Student (sets `milestoneId`)
6. Give Feedback to Student
7. Login Student
8. View Own Milestones
9. View Own Feedbacks
10. Get Milestones By Student ID (`/api/milestones/student/{id}`)

## 8. Verify Data in MySQL Workbench

```sql
USE fsad_portal;

SELECT id, name, email, role, created_at FROM users ORDER BY id DESC;
SELECT id, user_id, phone, branch, college, updated_at FROM profiles ORDER BY id DESC;
SELECT id, title, status, student_id, updated_at FROM milestones ORDER BY id DESC;
SELECT id, message, admin_id, student_id, created_at FROM feedbacks ORDER BY id DESC;
SELECT id, title, status, progress, owner_id, updated_at FROM projects ORDER BY id DESC;
```

## 9. Frontend Validation Flow

1. Register as `ADMIN` and `STUDENT`
2. Login as `ADMIN`
3. Open Admin Milestones page and add/edit/delete milestone
4. Open Admin Feedback page and submit feedback
5. Login as `STUDENT`
6. Open Student Milestones page and verify dynamic data from backend
7. Open Student Feedback page and verify admin feedback
8. Open Profile page and update details
9. Refresh and verify profile persists
