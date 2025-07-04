# PER - Personal Expense & Revenue Management System

A multi-tenant SaaS application for companies to manage their expenses, petty cash, and revenue. Built with Node.js, Express, MongoDB, and React.

## Features

### Multi-Tenant Architecture

- **Company Isolation**: Each company has their own data space
- **Subscription Management**: Trial, Active, Inactive status tracking
- **Secure Data Segregation**: Users can only access their company's data

### User Roles

- **System Admin**: Manages all tenants and can create users for any company
- **Company Users**: HR, Accountants, CA who manage their company's finances

### Core Functionality

- **Expense Management**: Track, categorize, and approve/reject expenses
- **Petty Cash Management**: Handle small cash transactions and requests
- **Revenue Tracking**: Monitor income from various sources
- **User Management**: Admin can create users for different companies

## Project Structure

```
PER/
├── server/                 # Backend API
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   ├── pettyCashController.js
│   │   └── revenueController.js
│   ├── middlewares/
│   │   └── auth.js        # JWT authentication
│   ├── models/            # MongoDB schemas
│   │   ├── expense.js
│   │   ├── pettycash.js
│   │   ├── revenue.js
│   │   ├── tenant.js
│   │   └── user.js
│   ├── routes/            # API endpoints
│   │   ├── authRoute.js
│   │   ├── expenseRoute.js
│   │   ├── pettyCashRoute.js
│   │   └── revenueRoute.js
│   ├── .env               # Environment variables
│   ├── .env.example       # Environment template
│   └── index.js           # Server entry point
└── client/                # Frontend React app
    └── src/
        ├── components/
        │   ├── Dashboard/
        │   │   ├── AdminDashboard.jsx
        │   │   ├── Expenses.jsx
        │   │   ├── PettyCash.jsx
        │   │   └── Revenue.jsx
        │   └── Navbar.jsx # Authentication UI
        └── pages/
```

## Environment Setup

### Server Environment (.env)

```env
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/PER"
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=your_secure_admin_password
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (creates company if new)

### Admin Only

- `POST /api/auth/admin/create-user` - Create user for existing company
- `GET /api/auth/admin/tenants` - Get all companies
- `GET /api/auth/admin/tenants/:id/users` - Get users for a company

### Expenses

- `POST /api/expenses` - Create expense
- `GET /api/expenses` - Get company expenses
- `PATCH /api/expenses/:id/status` - Approve/reject expense (admin only)

### Petty Cash

- `POST /api/petty-cash` - Create petty cash entry
- `GET /api/petty-cash` - Get company petty cash entries

### Revenue

- `POST /api/revenues` - Create revenue entry
- `GET /api/revenues` - Get company revenues
- `PATCH /api/revenues/:id/status` - Update revenue status

## Database Models

### Tenant (Company)

```javascript
{
  name: String,           // Company name
  email: String,          // Contact email
  subscriptionStatus: String, // 'active', 'inactive', 'trial'
  createdAt: Date,
  updatedAt: Date
}
```

### User

```javascript
{
  email: String,
  password: String,       // Hashed
  employeeId: String,
  tenantId: ObjectId,     // Reference to Tenant
  role: String,           // 'admin', 'accountant'
  createdAt: Date
}
```

### Expense

```javascript
{
  tenantId: ObjectId,
  userId: ObjectId,
  amount: Number,
  description: String,
  category: String,       // 'office_supplies', 'travel', etc.
  date: Date,
  status: String,         // 'pending', 'approved', 'rejected'
  receiptUrl: String,
  approvedBy: ObjectId,
  approvedAt: Date
}
```

### Revenue

```javascript
{
  tenantId: ObjectId,
  userId: ObjectId,
  amount: Number,
  description: String,
  source: String,         // 'sales', 'services', 'investment', 'other'
  clientName: String,
  invoiceNumber: String,
  date: Date,
  status: String          // 'pending', 'received', 'overdue'
}
```

## Multi-Tenant Implementation

### Data Isolation

- All financial data (expenses, revenue, petty cash) is filtered by `tenantId`
- Users can only access data from their own company
- JWT tokens include `tenantId` for automatic filtering

### User Registration Flow

1. User provides email, password, employeeId, and companyName
2. System checks if company exists, creates if new
3. User is assigned to the company with 'accountant' role
4. JWT token includes user and tenant information

### Admin Management

- System admin uses hardcoded credentials from .env
- Admin can view all companies and their users
- Admin can create new users for any existing company
- Admin has special JWT token with admin privileges

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with 12 salt rounds
- **Role-based Access**: Different permissions for admin vs users
- **Data Isolation**: Automatic tenant filtering in all queries
- **Input Validation**: Required field validation on all endpoints

## Installation & Setup

### Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

### Frontend

```bash
cd client
npm install
npm start
```

## Current Admin Credentials

- Email: `itpluspoint@2025.com`
- Password: `itpp@9753`

## Key Features Implemented

1. **Multi-Tenant Registration**: Automatic company creation during user signup
2. **Admin Dashboard**: Comprehensive tenant and user management
3. **Expense Management**: Full CRUD with approval workflow
4. **Revenue Tracking**: Income management with status updates
5. **Petty Cash**: Small transaction management
6. **Secure Authentication**: JWT-based with role-based access
7. **Data Isolation**: Automatic tenant-based data filtering

## Next Steps for Production

1. Add email verification for new registrations
2. Implement password reset functionality
3. Add file upload for receipts and invoices
4. Implement subscription payment processing
5. Add comprehensive reporting and analytics
6. Set up proper logging and monitoring
7. Add data backup and recovery procedures
