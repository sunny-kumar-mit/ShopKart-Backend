# ShopKart - Modern E-Commerce Platform

ShopKart is a full-featured, production-ready e-commerce application built with the MERN stack (MongoDB, Express.js, React, Node.js). It features a modern, responsive UI, secure authentication with dual OTP verification, and a comprehensive set of e-commerce functionalities including product browsing, cart management, and secure payments.

<div align="center">
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite" />
  <img src="https://img.shields.io/badge/Node.js-18-339933?style=for-the-badge&logo=nodedotjs" />
  <img src="https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwindcss" />
</div>

## 🚀 Features

### for Users
- **Authentication**: Secure Signup/Login with Email & Mobile OTP (Dual Verification), Google OAuth, and Password Reset.
- **Product Discovery**: Advanced search, filtering by category/price, and sorting.
- **Shopping Experience**: Add to Cart, Wishlist, Coupons, and detailed Product Pages.
- **Checkout & Payment**: Secure checkout flow integrated with **Razorpay** and Address management.
- **Order Management**: Order history, detailed order tracking, and downloadable invoices.
- **User Profile**: Manage personal details, addresses, and notification preferences.
- **Support**: Integrated Help Center and Chat Widget.

### for Developers
- **Modern Tech Stack**: Built with the latest best practices using React Hooks, Zustand for state management, and Shadcn UI components.
- **Responsive Design**: Mobile-first approach ensuring perfect rendering across all devices.
- **Secure Backend**: JWT-based authentication, hashed passwords, and secure API endpoints.
- **Integration Ready**: Pre-configured for Resend (Email), Twilio (SMS), and Razorpay (Payments).

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Shadcn UI (Radix Primitives)
- **State Management**: Zustand + React Query (@tanstack/react-query)
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form + Zod Validation
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens) + Passport.js (Google OAuth)
- **Email Service**: Resend
- **SMS Service**: Twilio
- **Payments**: Razorpay

## 📂 Project Structure

```bash
Shopkart/
├── frontend/           # React + Vite Frontend Application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Application routes/pages
│   │   ├── services/   # API service layer
│   │   └── hooks/      # Custom React hooks
│   └── ...
└── backend/            # DC Node.js + Express Backend API
    ├── models/         # Mongoose Data Models
    ├── routes/         # API Routes (Auth, Products, Orders)
    ├── utils/          # Utility functions (Notifications)
    └── server.js       # Entry point
```

## ⚡ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas URL)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/sunny-kumar-mit/ShopKart.git
cd ShopKart
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173

# Email & SMS Services
RESEND_API_KEY=your_resend_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```
Start the server:
```bash
npm run dev
```

### 3. Setup Frontend
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```
Start the development server:
```bash
npm run dev
```

Your app should now be running at `http://localhost:5173`! 🚀

## 🧪 API Documentation

The backend API exposes the following main endpoints:

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-otp`, `/api/auth/google`
- **Products**: `/api/products` (GET, POST), `/api/products/:id`
- **Orders**: `/api/orders` (Create, List, Details)
- **User**: `/api/user/profile`, `/api/user/address`

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---

Made with ❤️ by [Sunny Kumar](https://github.com/sunny-kumar-mit)
