# 📦 CoreInventory - Advanced IMS Platform

CoreInventory is a high-performance, full-stack Inventory Management System built with the **MERN** stack (MongoDB, Express, React, Node.js). It offers a premium, dark-themed user experience designed for modern warehouses and retail businesses.

![Licence](https://img.shields.io/github/license/RushiPatel24/CoreInventory?style=flat-square)
![Stars](https://img.shields.io/github/stars/RushiPatel24/CoreInventory?style=flat-square)

---

## ✨ Key Features

- **🚀 Real-time Dashboard**: Track stock levels, recent operations, and KPIs at a glance.
- **🛠️ Full Stock Lifecycle**: Manage Receipts (inbound), Deliveries (outbound), and Internal Transfers.
- **📱 Fully Responsive**: Optimized for Desktop, Tablet, and Mobile devices.
- **🎨 Premium UI**: Modern dark mode with a glassmorphism feel using Tailwind CSS.
- **🔒 Secure Auth**: JWT-based authentication with OTP password recovery.
- **📊 Kanban Workflow**: Specialized Kanban view for tracking delivery stages (Draft > Ready > Done).
- **📉 Reorder Rules**: Proactive inventory management with automated reorder triggers.

## 🛠️ Tech Stack

**Frontend:**
- **React.js** (Vite)
- **Redux Toolkit** (State Management)
- **Tailwind CSS** (Styling)
- **Lucide React** (Iconography)

**Backend:**
- **Node.js** & **Express**
- **MongoDB** & **Mongoose** (Database)
- **JWT** (Authentication)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local installation

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RushiPatel24/CoreInventory.git
   cd CoreInventory
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   CLIENT_URL=http://localhost:5173
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start Server (from `/server`)**
   ```bash
   npm run dev
   ```

2. **Start Client (from `/client`)**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

---

## 📸 Screenshots

> [!TIP]
> Add your actual project screenshots here to wow your visitors!

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ by [Rushi Patel](https://github.com/RushiPatel24)**
