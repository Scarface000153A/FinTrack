# Finance Tracker Web Application

A modern finance tracking web application built with FastAPI backend and Vue.js frontend.

## 🚀 Tech Stack

**Backend:**
- FastAPI (Python web framework)
- PostgreSQL (Production database)
- SQLAlchemy (ORM)
- JWT Authentication
- Password hashing with bcrypt

**Frontend:**
- HTML5/CSS3/JavaScript
- Vue.js 3 (Progressive framework)
- Responsive design
- Modern UI components

## 📋 Features

- ✅ User registration and authentication
- ✅ Secure password hashing
- ✅ JWT token-based authentication
- ✅ Income and expense tracking
- ✅ Transaction management (CRUD operations)
- ✅ Category-based organization
- ✅ Summary statistics and analytics
- ✅ RESTful API architecture
- ✅ CORS enabled for frontend integration

## 🛠️ Installation

### Prerequisites
- Python 3.9+
- PostgreSQL 12+
- Node.js (optional, for Vue.js development)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and secret key
   ```

5. **Set up PostgreSQL database:**
   ```sql
   CREATE DATABASE finance_tracker;
   CREATE USER finance_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE finance_tracker TO finance_user;
   ```

6. **Run the application:**
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Open with a local server:**
   - Use VS Code Live Server extension, or
   - Use Python: `python -m http.server 8080`
   - Or use Node.js: `npx http-server`

   The frontend will be available at `http://localhost:8080`

## 📚 API Documentation

Once the backend is running, visit:
- **Interactive API docs:** http://localhost:8000/docs
- **Alternative docs:** http://localhost:8000/redoc

### Main Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user info

**Transactions:**
- `POST /api/transactions/` - Create transaction
- `GET /api/transactions/` - Get all transactions (with filters)
- `GET /api/transactions/{id}` - Get specific transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction
- `GET /api/transactions/summary/stats` - Get summary statistics
- `GET /api/transactions/categories/list` - Get all categories

## 🔐 Security

- Passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- CORS protection configured
- SQL injection protection via SQLAlchemy ORM
- Input validation with Pydantic

## 🌐 Deployment

### Database Configuration for Production

Update your `.env` file with production database URL:
```env
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=generate-a-strong-random-secret-key
DEBUG=False
```

### Deployment Options

**Option 1: Traditional VPS (DigitalOcean, Linode, etc.)**
```bash
# Install dependencies
pip install -r requirements.txt gunicorn

# Run with gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**Option 2: Platform as a Service (Render, Railway, Heroku)**
1. Push code to GitHub
2. Connect repository to platform
3. Set environment variables
4. Deploy automatically

**Option 3: Docker**
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📁 Project Structure

```
finance-tracker-web/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Configuration settings
│   │   │   ├── database.py        # Database connection
│   │   │   └── security.py        # Authentication utilities
│   │   ├── models/
│   │   │   ├── user.py            # User model
│   │   │   └── transaction.py     # Transaction model
│   │   ├── routers/
│   │   │   ├── auth.py            # Authentication endpoints
│   │   │   └── transactions.py    # Transaction endpoints
│   │   └── schemas/
│   │       ├── user.py            # User schemas
│   │       └── transaction.py     # Transaction schemas
│   ├── main.py                    # FastAPI application entry
│   ├── requirements.txt           # Python dependencies
│   └── .env.example              # Environment variables template
└── frontend/
    ├── index.html                 # Landing page
    ├── signup.html               # Registration page
    ├── login.html                # Login page
    ├── dashboard.html            # Main dashboard
    ├── css/
    │   └── styles.css           # Stylesheet
    └── js/
        ├── app.js               # Vue.js application
        └── api.js               # API client
```

## 🧪 Testing

Run backend tests:
```bash
pytest
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💡 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ using FastAPI and Vue.js**
