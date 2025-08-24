# Pharmacy App Backend API

A comprehensive REST API for the Pharmacy App built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication & Authorization** - JWT-based authentication with role-based access control
- 👥 **User Management** - Complete user registration, login, and profile management
- 💊 **Medicine Management** - CRUD operations for medicines with search and filtering
- 👨‍⚕️ **Doctor Management** - Doctor profiles, specializations, and availability
- 🛒 **Order Management** - Complete order lifecycle with status tracking
- 🧪 **Lab Tests** - Laboratory test booking and management
- 📊 **Admin Dashboard** - Administrative functions for managing users and content

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Security**: bcryptjs, helmet, cors
- **Logging**: Morgan

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/change-password` - Change password

### Medicines
- `GET /api/medicines` - Get all medicines (with filtering)
- `GET /api/medicines/:id` - Get single medicine
- `POST /api/medicines` - Create medicine (Admin/Pharmacist)
- `PUT /api/medicines/:id` - Update medicine (Admin/Pharmacist)
- `DELETE /api/medicines/:id` - Delete medicine (Admin/Pharmacist)
- `GET /api/medicines/categories/list` - Get medicine categories
- `GET /api/medicines/dosage-forms/list` - Get dosage forms

### Doctors
- `GET /api/doctors` - Get all doctors (with filtering)
- `GET /api/doctors/:id` - Get single doctor
- `POST /api/doctors` - Create doctor profile (Admin)
- `PUT /api/doctors/:id` - Update doctor profile (Admin/Doctor)
- `GET /api/doctors/specializations/list` - Get specializations

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (Admin/Pharmacist)

### Lab Tests
- `GET /api/lab-tests` - Get available lab tests

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `config.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/pharmacy_app
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

5. **Run the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Database Schema

### User Model
- Basic info (name, email, phone, address)
- Authentication (username, password)
- Role-based access (patient, doctor, admin, pharmacist)
- Medical history and prescriptions

### Medicine Model
- Medicine details (name, generic name, description)
- Categorization (category, dosage form, strength)
- Inventory (price, stock quantity, expiry date)
- Medical info (side effects, contraindications)

### Doctor Model
- Professional info (specialization, license, experience)
- Education and certifications
- Availability and consultation types
- Ratings and reviews

### Order Model
- Order items and quantities
- Shipping and payment information
- Status tracking
- Prescription requirements

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access Control

- **Patient**: Can view medicines, place orders, manage profile
- **Doctor**: Can manage profile, view consultations
- **Pharmacist**: Can manage medicines, update orders
- **Admin**: Full access to all endpoints

## Error Handling

The API returns consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [] // Validation errors if any
}
```

## Success Responses

Successful operations return:

```json
{
  "status": "success",
  "message": "Operation description",
  "data": {
    // Response data
  }
}
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### API Documentation
The API is self-documenting. Use tools like Postman or curl to explore endpoints.

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Input validation and sanitization
- CORS protection
- Rate limiting
- Helmet security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License

