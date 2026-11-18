
# 🔗 LinkLite – URL Shortener & Analytics Platform

A full-stack **URL Shortener and Link Management Platform** built using **Java 21, Spring Boot, Spring Security, JWT, React.js, and MySQL**.

LinkLite transforms long URLs into short, shareable links and provides a complete workspace to manage links, track clicks, generate QR codes, configure expiration, create custom aliases, and understand link performance through analytics.

---

## ✨ Features

### 🔐 Authentication & Account Management
- User registration and login
- JWT-based authentication
- Secure password hashing with BCrypt
- Protected REST APIs
- User-specific URL ownership and access control

### 🔗 URL Shortening & Management
- Generate short URLs with unique 7-character codes
- Create custom aliases
- Copy short URLs
- Redirect users to original destinations
- Search and filter shortened URLs
- Sort links
- View individual URL details

### 📊 Analytics Dashboard
- Total URLs and total clicks
- Clicks within the selected period
- Daily average click statistics
- Daily click performance chart
- Top performing links
- Link-by-link performance comparison
- Current-period versus previous-period insights
- Recent click activity
- Today, 7-day, 30-day, and custom date-range filters
- CSV export
- Refresh analytics data

### 📱 QR Code Management
- Generate QR codes for shortened URLs
- Preview QR codes
- Customize QR code size and colors
- Download QR codes as PNG
- Copy the associated short URL

### ⏳ URL Expiration & Status Management
- Set an optional expiration date and time
- Update or remove expiration
- Activate and deactivate URLs
- Automatically deactivate expired URLs
- Prevent redirects for expired or inactive links
- Bulk activate, deactivate, and delete selected links

### 🎨 User Interface
- Responsive React interface
- Light and dark themes
- Modern dashboard layout
- Search, filters, and sorting
- Clean URL cards and analytics tables

---

## 🖥️ Application Screenshots

### Welcome Page

The LinkLite welcome page introduces the URL shortening platform and provides access to the application.

| 🌐 LinkLite Welcome Page |
|:---:|
| ![LinkLite Welcome Page](screenshots/01-welcome-page.png) |

### Authentication

Secure login and registration pages allow users to access their own URL workspace.

| 🔐 Login Page | 📝 Register Page |
|:---:|:---:|
| ![Login Page](screenshots/02-login.png) | ![Register Page](screenshots/03-register.png) |

### URL Shortener

Create short URLs by entering a destination URL. Optionally configure an expiration date and a custom alias.

| 🌙 URL Shortener – Dark Mode |
|:---:|
| ![URL Shortener Dark](screenshots/04-url-shortener-dark.png) |

### My Links – URL Management

Manage shortened URLs, search by URL or short code, filter by status and expiration, and perform bulk actions.

| 🌙 My Links – Dark Mode | ☀️ My Links – Light Mode |
|:---:|:---:|
| ![My Links Dark](screenshots/05-my-links-dark.png) | ![My Links Light](screenshots/06-my-links-light.png) |

### Analytics Overview

The analytics dashboard provides an overview of URL activity, click statistics, and performance trends.

| 🌙 Analytics – Dark Mode | ☀️ Analytics – Light Mode |
|:---:|:---:|
| ![Analytics Dark](screenshots/07-analytics-dark.png) | ![Analytics Light](screenshots/08-analytics-light.png) |

### Click Performance

Visualize daily click activity and understand how shortened URLs perform over a selected period.

| 🌙 Click Performance – Dark Mode | ☀️ Click Performance – Light Mode |
|:---:|:---:|
| ![Click Performance Dark](screenshots/09-performance-dark.png) | ![Click Performance Light](screenshots/10-performance-light.png) |

| 📈 Click Performance Graph |
|:---:|
| ![Click Performance Graph](screenshots/11-click-performance-graph.png) |

### Top Performing Links

View the most-clicked shortened URLs, compare their click counts, and access QR codes and link details.

| ☀️ Top Performing Links – Light Mode | 🌙 Top Performing Links – Dark Mode |
|:---:|:---:|
| ![Top Performing Links Light](screenshots/12-top-performing-light.png) | ![Top Performing Links Dark](screenshots/13-top-performing-dark.png) |

### Link-by-Link Comparison

Compare each link's total clicks, current-period clicks, previous-period clicks, and growth.

| ☀️ Link Comparison – Light Mode | 🌙 Link Comparison – Dark Mode |
|:---:|:---:|
| ![Link Comparison Light](screenshots/14-link-comparison-light.png) | ![Link Comparison Dark](screenshots/15-link-comparison-dark.png) |

### Recent Click Activity

Review the latest recorded visits, including the short link, destination, relative click time, and date and time.

| 🌙 Recent Click Activity – Dark Mode | ☀️ Recent Click Activity – Light Mode |
|:---:|:---:|
| ![Recent Activity Dark](screenshots/16-recent-activity-dark.png) | ![Recent Activity Light](screenshots/17-recent-activity-light.png) |

### Application Interface

| 🔗 LinkLite Application Interface |
|:---:|
| ![LinkLite Application](screenshots/18-linklite-interface.png) |

---

## 🛠️ Technology Stack

### Backend
- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- JWT Authentication
- BCrypt Password Encoding
- Maven
- REST APIs

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite
- Fetch API / Axios

### Database
- MySQL

### Development Tools
- Spring Tool Suite (STS)
- Visual Studio Code
- MySQL Workbench
- Postman
- Git
- GitHub

---

## 🏗️ Application Architecture

```text
                 ┌─────────────────────────┐
                 │      React Frontend     │
                 │       (Vite + CSS)      │
                 └────────────┬────────────┘
                              │ HTTP / REST
                              ▼
                 ┌─────────────────────────┐
                 │    Spring Boot Backend  │
                 │                         │
                 │  Controllers            │
                 │  Services               │
                 │  Repositories           │
                 │  Spring Security + JWT  │
                 └────────────┬────────────┘
                              │ JPA / Hibernate
                              ▼
                 ┌─────────────────────────┐
                 │       MySQL Database    │
                 └─────────────────────────┘
```

---

## 📁 Project Structure

```text
LinkLite/
│
├── linklite-frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── styles/
│   ├── package.json
│   └── vite.config.js
│
├── linklite-backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── mvnw
│
├── screenshots/
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

Install the following before running the project:

- Java 21
- Node.js and npm
- MySQL Server
- Maven (or use the included Maven Wrapper)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/LinkLite.git
cd LinkLite
```

Replace `YOUR_USERNAME` with your GitHub username and use your actual repository URL.

### 2. Configure MySQL Database

Start MySQL and create the database:

```sql
CREATE DATABASE linklite_db;
```

Configure the backend database connection in your application configuration file.

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/linklite_db
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

Set your database credentials as environment variables. Never commit real passwords or secrets to GitHub.

### 3. Configure JWT

Set your JWT secret as an environment variable:

```text
LINKLITE_JWT_SECRET=your-secure-secret
```

Use a strong secret and never publish the actual secret.

### 4. Run the Backend

Open a terminal in the backend directory:

```bash
cd linklite-backend
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Or, if Maven is installed:

```bash
mvn spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

### 5. Run the Frontend

Open another terminal:

```bash
cd linklite-frontend
npm install
npm run dev
```

Open the Vite URL displayed in the terminal. By default:

```text
http://localhost:5173
```

---

## 🔌 API Overview

| Module | Purpose |
|:---|:---|
| Authentication | User registration and login |
| URL Management | Create, list, view, update, and delete URLs |
| Redirection | Redirect a short code to its original destination |
| Analytics Summary | Retrieve dashboard statistics |
| Daily Analytics | Retrieve click activity by day |
| Top URLs | Retrieve the most-clicked links |
| URL Analytics | Retrieve analytics for an individual URL |
| Recent Clicks | Retrieve recent click activity |
| QR Code | Generate and download QR codes in the frontend |
| Expiration | Configure URL expiration and status |

---

## 🔒 Security & Validation

- JWT-based authentication for protected endpoints
- BCrypt password hashing
- User ownership checks for URL operations
- Users can access and manage only their own URLs
- Validation for custom aliases
- Duplicate custom aliases are rejected
- Expired and inactive URLs cannot be redirected
- Invalid expiration dates are rejected
- Sensitive credentials are supplied through environment variables

---

## 🚀 Future Enhancements

Potential improvements for future versions:

- Custom domains
- Geo-location analytics
- Device and browser analytics
- Link password protection
- Link sharing and team workspaces
- API rate limiting
- Docker deployment
- Cloud hosting and CI/CD integration

---

## 👨‍💻 Author

**Sunil J S**

- GitHub: [Sunilgowda2003](https://github.com/Sunilgowda2003)

---


## 📄 License

This project was developed for personal learning, skill development, and portfolio purposes.

© 2026 Sunil J S. All rights reserved.


---

⭐ If you find this project useful, consider giving the repository a star!
