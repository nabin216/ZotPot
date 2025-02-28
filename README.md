# Zotpot - Instant Delivery Mobile App

Zotpot is a full-featured instant delivery mobile application built with Expo and React Native, offering real-time order placement, live tracking, and instant delivery services.

## Features

- 🚀 Real-time order tracking and updates
- 👥 Multi-user interface (Customers, Delivery Agents, Administrators)
- 🗺️ Live location tracking with Google Maps
- 💳 Secure payment processing (Stripe/Razorpay)
- 🔐 Authentication and authorization
- 📱 Push notifications for order updates
- 📊 Admin dashboard for business analytics
- ⚡ High-performance architecture

## Tech Stack

### Mobile App (Frontend)
- React Native with Expo
- React Native Paper for UI components
- Redux Toolkit for state management
- React Query for data fetching
- Google Maps API integration
- Firebase SDK
- Stripe/Razorpay SDK

### Backend
- Django & Django REST Framework
- PostgreSQL database
- JWT authentication
- WebSocket for real-time updates
- Celery for background tasks

## Prerequisites

- Node.js (v16 or higher)
- Python 3.9+
- PostgreSQL
- Expo CLI
- Firebase account
- Google Maps API key
- Stripe/Razorpay account

## Setup Instructions

### Mobile App Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```
Edit .env with your API keys and configuration.

3. Start the development server:
```bash
npx expo start
```

### Backend Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Setup database:
```bash
python manage.py migrate
```

4. Start the development server:
```bash
python manage.py runserver
```

## Project Structure

```
zotpot/
├── mobile/              # React Native mobile app
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── screens/     # Screen components
│   │   ├── navigation/  # Navigation configuration
│   │   ├── store/       # Redux store and slices
│   │   ├── services/    # API services
│   │   └── utils/       # Helper functions
│   └── assets/          # Images, fonts, etc.
│
└── backend/             # Django backend
    ├── core/            # Core functionality
    ├── users/           # User management
    ├── orders/          # Order management
    ├── payments/        # Payment processing
    └── tracking/        # Location tracking
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 