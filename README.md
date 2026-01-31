<div align="center">

# 🛒 **Shopifyr** 🛒

### _E-commerce platform — shopifyr.vercel.app_

[![Build Passing](https://img.shields.io/badge/build-passing-success?style=flat-square)](https://github.com/alienx5499/Shopifyr/actions)
[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-brightgreen?style=flat-square)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)](https://nextjs.org/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat-square)](https://github.com/alienx5499/Shopifyr/blob/main/CONTRIBUTING.md)
[![License: MIT](https://custom-icon-badges.herokuapp.com/github/license/alienx5499/Shopifyr?logo=law&logoColor=white)](https://github.com/alienx5499/Shopifyr/blob/main/LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web-brightgreen?style=flat-square)](https://shopifyr.vercel.app/)
[![Views](https://visitor-badge.laobi.icu/badge?page_id=alienx5499.Shopifyr)](https://visitor-badge.laobi.icu/badge?page_id=alienx5499.Shopifyr)
[![⭐ GitHub stars](https://img.shields.io/github/stars/alienx5499/Shopifyr?style=social)](https://github.com/alienx5499/Shopifyr/stargazers)
[![🍴 GitHub forks](https://img.shields.io/github/forks/alienx5499/Shopifyr?style=social)](https://github.com/alienx5499/Shopifyr/network)
[![Commits](https://badgen.net/github/commits/alienx5499/Shopifyr)](https://github.com/alienx5499/Shopifyr/commits/main)
[![🐛 GitHub issues](https://img.shields.io/github/issues/alienx5499/Shopifyr)](https://github.com/alienx5499/Shopifyr/issues)
[![📂 GitHub pull requests](https://img.shields.io/github/issues-pr/alienx5499/Shopifyr)](https://github.com/alienx5499/Shopifyr/pulls)
[![💾 GitHub code size](https://img.shields.io/github/languages/code-size/alienx5499/Shopifyr)](https://github.com/alienx5499/Shopifyr)

</div>

---

## 🎯 **What is Shopifyr?**

Shopifyr is a full-stack e-commerce web application with a Spring Boot backend and a Next.js frontend. It provides product catalog, cart, checkout, user auth, orders, wishlist, and reviews—suitable for learning or as a base for your own store.

### 🌟 **Key Features**

- **Product catalog**: Categories, brands, search, and product detail pages
- **Cart & checkout**: Add to cart, update quantities, and place orders
- **User auth**: Register, login, JWT-based sessions, profile
- **Orders**: Order history and order detail views
- **Wishlist**: Save products for later
- **Reviews**: Product reviews and ratings
- **Responsive UI**: Works on desktop and mobile

> _"Browse, add to cart, checkout—simple e-commerce."_

<div align="center">

### 🚀 **Help Us Build Something Amazing Together!**

**Using Shopifyr for learning or a project? Star the repo!** ✨  
_Help other developers discover this stack_ 💝

<a href="https://github.com/alienx5499/Shopifyr">
  <img src="https://img.shields.io/badge/⭐%20Star%20this%20repo-Be%20part%20of%20our%20community!-yellow?style=for-the-badge&logo=github" alt="Star this repo" />
</a>

<a href="https://shopifyr.vercel.app/">
  <img src="https://img.shields.io/badge/🎮%20Try%20the%20App-Live%20demo-brightgreen?style=for-the-badge&logo=vercel" alt="Try Shopifyr Live" />
</a>

**💭 "Every star motivates us to add more features!" - The Shopifyr Team**

</div>

---

## 📚 **Table of Contents**

1. [✨ Features](#-features)
2. [🦾 Tech Stack](#-tech-stack)
3. [📂 Project Structure](#-project-structure)
4. [🚀 Quick Start](#-quick-start)
5. [👨‍🔧 Detailed Setup](#-detailed-setup)
6. [🤝 Contributing](#-contributing)
7. [🌟 Awesome Contributors](#-awesome-contributors)
8. [📜 License](#-license)
9. [📬 Feedback & Suggestions](#-feedback--suggestions)

---

## ✨ **Features**

### 🛍️ **E-commerce**

- Product listing with categories and brands
- Product search and detail pages
- Add to cart, update quantity, remove items
- Checkout flow and order placement
- Order history and order details

### 👤 **User & Auth**

- User registration and login
- JWT-based authentication
- Profile and account management
- Protected routes for cart, orders, profile

### 📦 **Catalog & Content**

- Categories and brands
- Product images and descriptions
- Inventory and stock
- Product reviews and ratings
- Wishlist

### 🎨 **Frontend**

- Next.js App Router, React, TypeScript
- Tailwind CSS, responsive layout
- Cart and auth context
- API client with auth and error handling

---

## 🦾 **Tech Stack**

### 🔧 **Backend**

- **Framework**: Spring Boot 4
- **Language**: Java 21
- **Database**: PostgreSQL, JPA/Hibernate
- **Auth**: JWT (login/register)
- **API**: REST, OpenAPI/Swagger
- **Build**: Maven

### 🌐 **Frontend**

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Context (auth, cart)
- **HTTP**: Axios, env-based API URL

### 🛠️ **Dev & Deploy**

- **Containers**: Docker, Docker Compose
- **Version control**: Git
- **Deployment**: Vercel (frontend), Railway (backend)

---

## 📂 **Project Structure**

```
Shopifyr/
├─ .github/                    # GitHub configuration
│  └─ CODEOWNERS               # Code owners
├─ backend/                    # Spring Boot API
│  ├─ src/main/java/com/shopifyr/backend/
│  │  ├─ config/               # Security, CORS, JWT, DB, etc.
│  │  ├─ controller/           # REST controllers
│  │  ├─ dto/                  # Request/response DTOs
│  │  ├─ exception/           # Global exception handling
│  │  ├─ model/               # JPA entities
│  │  ├─ repository/           # JPA repositories
│  │  ├─ service/              # Business logic
│  │  └─ util/                # JWT, etc.
│  ├─ src/main/resources/     # application.properties, etc.
│  ├─ Dockerfile
│  ├─ pom.xml
│  └─ railway.toml             # Railway deploy config
├─ frontend/                   # Next.js app
│  ├─ src/
│  │  ├─ app/                  # Pages (cart, checkout, login, orders, products, etc.)
│  │  ├─ components/          # UI, layout, features
│  │  ├─ contexts/            # Auth, Cart
│  │  └─ lib/                 # API client, utils
│  ├─ public/                 # Static assets
│  ├─ Dockerfile
│  ├─ package.json
│  └─ next.config.ts
├─ .env.example                # Env template (DB, JWT, mail)
├─ .gitignore
├─ docker-compose.yml         # DB + backend + frontend
├─ seed-mock-data.sh          # Optional DB seed script
└─ README.md                  # This file
```

### 📁 **Key Directories**

- **`backend/`**: Spring Boot API (auth, products, cart, orders, wishlist, reviews)
- **`frontend/`**: Next.js app (pages, components, contexts)
- **`docker-compose.yml`**: Run PostgreSQL, backend, and frontend locally
- **`.env.example`**: Copy to `.env` and set DB, JWT, and mail variables

---

## 🚀 **Quick Start**

1. **Try the app**  
   [Live site](https://shopifyr.vercel.app/)

2. **Run with Docker**
   ```bash
   cp .env.example .env
   # Edit .env with DB password, JWT secret, etc.
   docker compose up --build
   ```
   - Frontend: http://localhost:3000  
   - Backend API: http://localhost:8080

3. **Or run backend and frontend separately**  
   See [Detailed Setup](#-detailed-setup) below.

---

## 👨‍🔧 **Detailed Setup**

### **Prerequisites**

- **Java 21** (backend)
- **Node.js** 18+ and **npm** or **pnpm** (frontend)
- **PostgreSQL** (or use Docker for DB only)
- **Git**

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/alienx5499/Shopifyr.git
   cd Shopifyr
   ```

2. **Backend**
   ```bash
   cd backend
   cp ../.env.example ../.env
   # Set DB_URL, DB_USERNAME, DB_PASSWORD, APP_JWT_SECRET in ../.env
   # Or use: export DB_URL=jdbc:postgresql://localhost:5432/shopifyr etc.
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   ```
   API runs at http://localhost:8080

3. **Frontend**
   ```bash
   cd frontend
   npm install
   # or pnpm install
   # Set NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api in .env.local
   npm run dev
   # or pnpm dev
   ```
   App runs at http://localhost:3000

4. **Optional: seed data**  
   Use `seed-mock-data.sh` (or call backend seed endpoints) if available.

### **Docker (all services)**

```bash
cp .env.example .env
# Edit .env: POSTGRES_PASSWORD, APP_JWT_SECRET, etc.
docker compose up --build
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:8080  
- DB: localhost:5432 (credentials from `.env`)

### **Environment variables**

See `.env.example`. Main ones:

- **Backend**: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `APP_JWT_SECRET`, optional mail vars
- **Frontend**: `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:8080/api`)

---

## 🤝 **Contributing**

We welcome contributions.

### **How to contribute**

1. **Fork the repo**
   ```bash
   git clone https://github.com/your-username/Shopifyr.git
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Commit and push**
   ```bash
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature
   ```

4. **Open a Pull Request** on [GitHub](https://github.com/alienx5499/Shopifyr/pulls).

### **Guidelines**

- Follow existing code style
- Add or update tests where relevant
- Update docs/README if you change setup or behavior

---

## 🌟 **Awesome Contributors**

<div align="center">
	<h3>Thank you for contributing to Shopifyr</h3><br>
	<p align="center">
		<a href="https://github.com/alienx5499/Shopifyr/contributors">
			<img src="https://contrib.rocks/image?repo=alienx5499/Shopifyr" width="720" height="380" alt="Contributors" />
		</a>
	</p>
</div>

---

## 📜 **License**

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 📬 **Feedback & Suggestions**

_We value your input! Share your thoughts via [GitHub Issues](https://github.com/alienx5499/Shopifyr/issues)._

💡 _Let's make Shopifyr better together!_

</div>
