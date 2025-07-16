# STAR Challenge Backend

[![Node.js CI](https://github.com/fekikarim/star_backend/actions/workflows/node.js.yml/badge.svg)](https://github.com/fekikarim/star_backend/actions/workflows/node.js.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A robust backend system for STAR Challenge, designed to manage and track corporate performance challenges. This Node.js application provides secure APIs for handling users, challenges, performance criteria, participants, winners, rewards, and progress tracking.

## 🌟 Features

- **User Management**: Secure authentication and authorization with JWT
- **Challenge Management**: Create, update, and track performance challenges
- **Real-time Tracking**: Monitor participant progress in real-time
- **Reward System**: Manage and distribute rewards for achievements
- **Analytics Dashboard**: Comprehensive performance metrics and reporting
- **RESTful API**: Well-documented endpoints for easy integration
- **Scalable Architecture**: Built with performance and scalability in mind

## 🚀 Quick Start

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- SQLite (for development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/fekikarim/star_backend.git
   cd star_backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Initialize the database:
   ```bash
   npm run init-db
   ```

5. Start the development server:
   ```bash
   npm start
   ```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

For detailed API documentation, please refer to the [API Guide](./API_GUIDE.md).

### Available Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/challenges` - List all challenges
- `POST /api/challenges` - Create a new challenge
- `GET /api/participants` - List all participants
- `POST /api/rewards` - Create a new reward
- `GET /api/analytics` - Get performance analytics

## 🛠 Development

### Project Structure

```
├── config/           # Configuration files
├── controllers/      # Request handlers
├── database/         # Database initialization and migrations
├── middleware/       # Custom middleware
├── models/           # Database models
├── routes/           # API route definitions
├── services/         # Business logic
└── tests/            # Test files
```

### Testing

Run the test suite:

```bash
npm test
```

### Linting

```bash
npm run lint
```

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- Environment-based configuration
- Security headers and CORS protection

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- Built with ❤️ by [Karim Feki](https://github.com/fekikarim)
- Special thanks to all contributors

---

<div align="center">
  <sub>Made with ❤️ by <a href="https://github.com/fekikarim">Karim Feki</a></sub>
</div>
