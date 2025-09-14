# Preschool Academy App

A comprehensive school management system built with React and Node.js, designed specifically for preschools and small educational institutions. This application provides role-based dashboards for administrators, teachers, and parents.

## 🚀 Features

### 🎨 Modern UI/UX
- **Dark/Light Theme Support** - Complete theme system with persistent user preferences
- **Responsive Design** - Mobile-first approach that scales beautifully to desktop
- **Professional Styling** - Modern gradients, shadows, and animations with Framer Motion
- **Component Library** - 15+ reusable UI components with consistent design
- **Tailwind CSS + Bootstrap** - Utility-first CSS with Bootstrap components

### 👨‍💼 Admin Dashboard
- **User Management** - Create, edit, and manage students, teachers, and admin users
- **Statistics Overview** - Visual metrics cards with real-time data
- **Role-based Access Control** - Secure authentication with JWT tokens
- **Data Visualization** - Modern card-based layouts replacing traditional tables
- **Bulk Operations** - Efficient management of multiple records

### 👩‍🏫 Teacher Dashboard
- **Student Management** - View and manage assigned students
- **Daily Reports** - Create and submit daily activity reports
- **Performance Tracking** - Record and monitor student performance
- **Exam Management** - Create exams and record results
- **Parent Communication** - Direct messaging with parents

### 👨‍👩‍👧‍👦 Parent Dashboard
- **Child Overview** - Beautiful cards showing each child's information
- **Daily Reports** - View teacher-submitted daily activity reports
- **Performance Monitoring** - Track child's academic progress
- **Exam Results** - Access exam scores and feedback
- **Teacher Communication** - Direct messaging with teachers

### 💬 Messaging System
- **Real-time Communication** - Chat-like interface between users
- **Contact Management** - Organized contact lists with deduplication
- **Emoji Support** - Quick emoji picker for friendly communication
- **Mobile Optimized** - Perfect touch interface for all devices

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Latest React with hooks and functional components
- **React Router 7.8.2** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Bootstrap 5.3.8** - UI components and layout
- **Framer Motion 11.18.2** - Animation library
- **Axios 1.11.0** - HTTP client for API calls
- **React Hot Toast** - Beautiful toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express 5.1.0** - Web application framework
- **PostgreSQL** - Relational database
- **JWT (jsonwebtoken 9.0.2)** - Authentication tokens
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn** package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd preschool-academy-app
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=preschool_academy
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key
PORT=4000
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb preschool_academy

# Initialize database tables (run the initialization script)
cd backend
node config/dbInit.js
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

### 5. Start Development Servers

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## 📊 Database Schema

### Key Tables
- **users** - System users (admin, teachers, parents)
- **students** - Student records with program assignments
- **teachers** - Teacher profiles and assignments
- **messages** - Communication between users
- **daily_reports** - Teacher-submitted daily activities
- **performance** - Student performance tracking
- **exams** - Exam records and results
- **announcements** - School-wide announcements

### Important Constraints
- **students.program** - Must be either "School" or "Tuition" (case-sensitive)
- **users.phone_number** - Must be unique across all users
- **users.role** - Must be "admin", "teacher", or "parent"

## 🔐 Authentication

The application uses JWT-based authentication with the following flow:
1. User login with credentials
2. OTP verification (if enabled)
3. JWT token generation and storage
4. Token-based API access
5. Role-based route protection

### Default Admin Account
After database initialization, create an admin account through the application or directly in the database.

## 🧪 Development

### Available Scripts

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (not implemented)

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

### Project Structure
```
preschool-academy-app/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication middleware
│   ├── routes/          # API routes
│   └── server.js        # Express server setup
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # React components
│       ├── contexts/    # React contexts
│       ├── styles/      # CSS files
│       └── App.js       # Main application
└── package.json         # Root dependencies
```

## 🔧 Common Issues & Troubleshooting

### Authentication Issues
If experiencing authentication problems during development:
```javascript
// Temporarily bypass authentication in routes (DEVELOPMENT ONLY)
// Comment out authenticate/authorize middleware
router.post('/endpoint', /* authenticate, authorize, */ controller);
```

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists and is accessible

### Student Creation Errors
- Ensure `program` field uses exact values: "School" or "Tuition"
- Check for unique constraint violations (phone numbers, etc.)

### Port Conflicts
- Backend default: port 4000
- Frontend default: port 3000
- Change ports in `.env` (backend) or package.json scripts (frontend)

## 🎯 Features Roadmap

### Completed ✅
- Modern UI/UX with dark/light themes
- Role-based authentication and authorization
- Complete CRUD operations for all entities
- Real-time messaging system
- Performance tracking and reporting
- Mobile-responsive design

### Future Enhancements 🔄
- Real-time notifications with WebSocket
- File upload and document management
- Advanced reporting and analytics
- Calendar integration for events
- Mobile app development
- Email notification system

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Optimized layouts for small screens
- Fast loading on mobile networks
- Progressive Web App (PWA) ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

---

**Built with ❤️ for educational institutions**