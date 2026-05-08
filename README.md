# Linkly | Premium Link Shortener & Analytics

Linkly is a robust, full-stack URL shortener built for speed, security, and deep insights. It features a modern FastAPI backend and a premium React frontend with glassmorphism aesthetics.

![Premium Design](https://img.shields.io/badge/Design-Premium-blueviolet)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)
![Analytics](https://img.shields.io/badge/Analytics-Real--time-ff69b4)

## ✨ Features

- **🚀 Lightning Fast Redirection**: Redis-backed caching ensures your links redirect in milliseconds.
- **📊 Deep Analytics**: Track total clicks, device types, operating systems, browsers, and location data.
- **🔐 User Authentication**: Secure JWT-based auth. Manage your links in a private dashboard.
- **🎨 Premium UI**: A high-end, responsive dark-mode interface with smooth animations.
- **📱 Responsive**: Works perfectly on Desktop, Tablet, and Mobile.

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (SQLAlchemy ORM)
- **Caching**: Redis
- **Auth**: JWT (jose), Password hashing (bcrypt)
- **Validation**: Pydantic v2

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (Design Tokens & Glassmorphism)
- **Icons**: Lucide React
- **Charts**: Recharts

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Redis

### 1. Backend Setup

```bash
# Clone the repository
cd link-shortener-analytics/backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file (see .env.example)
# Run the application
uvicorn app.main:app --reload
```

### 2. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 📝 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PROJECT_NAME="Linkly API"
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=link_shortener
REDIS_HOST=localhost
REDIS_PORT=6379
SECRET_KEY=your-super-secret-key
```

---

## 📸 Screenshots

### Home Page
![Home Page]([./docs/screenshots/home.png](https://github.com/Viper-07/File-Shortener-Analytics/blob/240273f132d95fc07be823f48f190159127ddae8/Screenshot%202026-05-08%20233447.png))

### Create Account
![Create Account]([./docs/screenshots/register.png](https://github.com/Viper-07/File-Shortener-Analytics/blob/894fc83a47bf84b2dfb05c944c1d6c092a0cdbba/Screenshot%202026-05-08%20233526.png))

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
