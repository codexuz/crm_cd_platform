# CRM + Computer-Delivered IELTS Platform

A comprehensive multi-tenant CRM and IELTS test management platform built with NestJS, TypeORM, and MySQL.

## 🌟 Features

### Multi-Tenant Architecture
- **Centers Management**: Multiple learning centers with isolated data
- **Role-Based Access Control**: Admin, Manager, Teacher, and Student roles
- **Secure Authentication**: JWT-based authentication with role-based permissions

### CRM Features
- **Lead Management**: Track potential students with interest levels and follow-ups
- **Trail Lessons**: Schedule and manage trial lessons for leads
- **Student Groups**: Organize students into learning groups by level
- **Payment Tracking**: Complete payment management system
- **Teacher Salary**: Automated salary calculations and management

### IELTS Test Builder
- **Test Creation**: Build Academic and General IELTS tests
- **Section Management**: Listening, Reading, Writing, and Speaking sections
- **Question Types**: Multiple choice, true/false, matching, fill-in-blanks, essays, and more
- **Media Support**: Audio and image integration for questions

## 🏗️ Database Schema

### Multi-Tenant Structure
```
centers              (id, name, address, owner_id, phone, email, description)
users                (id, name, phone, email, password, center_id, is_active)
roles                (id, role_name) // admin, manager, teacher, student
user_roles           (user_id, role_id)
```

### CRM Tables
```
leads                (id, name, phone, interest_level, assigned_to, center_id, status)
lead_trail_lessons   (id, lead_id, teacher_id, status, note, added_by, lesson_date)
groups               (id, group_name, level, teacher_id, center_id, class_time)
group_students       (group_id, student_id)
payments             (id, student_id, amount, date, method, center_id, status)
teacher_salary       (teacher_id, month, amount, status, hours_taught)
```

### IELTS Test Tables
```
tests                (id, title, type, duration, center_id, status)
test_sections        (id, test_id, section_type, title, instructions, duration)
questions            (id, section_id, question_type, content, audio_url, correct_answer)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MySQL (v8.0+ recommended)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd crm_cd_platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Update the `.env` file with your database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=crm_cd_platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# App Configuration
PORT=3000
NODE_ENV=development
```

4. **Create MySQL database**
```sql
CREATE DATABASE crm_cd_platform;
```

5. **Run database migrations and seed**
```bash
# The application will auto-create tables on first run (development mode)
npm run seed
```

6. **Start the development server**
```bash
npm run start:dev
```

### Default Credentials
After running the seed script:
- **Email**: admin@demo-ielts.com
- **Password**: admin123

## 📖 API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:3000/api
- **Application**: http://localhost:3000

## 🛡️ Available Scripts

```bash
# Development
npm run start:dev        # Start in watch mode
npm run start:debug      # Start in debug mode

# Production
npm run build           # Build the application
npm run start:prod      # Start production server

# Database
npm run seed           # Seed database with initial data

# Testing
npm run test           # Run unit tests
npm run test:e2e       # Run e2e tests
npm run test:cov       # Run tests with coverage

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

## 🏛️ Architecture

### Module Structure
```
src/
├── config/             # Configuration files
├── entities/           # TypeORM entities
├── modules/
│   ├── auth/          # Authentication & JWT
│   ├── centers/       # Learning centers management
│   ├── users/         # User management
│   ├── leads/         # Lead & CRM management
│   ├── groups/        # Student groups
│   ├── payments/      # Payment processing
│   ├── tests/         # IELTS test builder
│   └── salary/        # Teacher salary management
├── common/
│   ├── guards/        # Authentication guards
│   ├── decorators/    # Custom decorators
│   └── dto/           # Common DTOs
└── database/          # Database seeders
```

### Key Features
- **Multi-tenancy**: Data isolation by learning center
- **Role-based permissions**: Fine-grained access control
- **RESTful API**: Clean, documented endpoints
- **Data validation**: Request/response validation with class-validator
- **Error handling**: Comprehensive error handling
- **Security**: Password hashing, JWT tokens, CORS enabled

## 🔐 Authentication & Authorization

### Roles
- **Admin**: Full system access
- **Manager**: Center management and user operations
- **Teacher**: Access to assigned groups and lessons
- **Student**: Access to personal data and tests

### Endpoints Security
All endpoints (except auth) require JWT authentication. Role-based access control is implemented using guards and decorators.

## 📱 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Centers
- `GET /centers` - List all centers
- `POST /centers` - Create new center
- `GET /centers/:id` - Get center details
- `PATCH /centers/:id` - Update center
- `DELETE /centers/:id` - Delete center

### Users
- `GET /users` - List users
- `POST /users` - Create user
- `GET /users/profile` - Get current user profile
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

*[More endpoints available in Swagger documentation]*

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the [NestJS Documentation](https://docs.nestjs.com)
- Review the API documentation at `/api` endpoint

---

Built with ❤️ using [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), and [MySQL](https://mysql.com/)