# ArtTrident

ArtTrident is a premium, artist-first social network built to empower visual artists to showcase their portfolios, build connections, and curate exceptional collections. Designed with a stunning, high-contrast, "glassmorphism" aesthetic, it prioritizes the art itself over traditional social media clutter.

## 🌟 Key Features

*   **Role-Based Access:** Distinct experiences for Artists, Collectors, and Viewers.
*   **Dynamic Portfolios:** Artists can easily upload high-resolution artwork, complete with metadata (medium, description, price).
*   **Masonry Grid Feed:** A beautiful, responsive masonry layout for discovering art organically.
*   **Interactions:** Follow your favorite creators and curate personal collections by saving artworks.
*   **Activity Feed:** Keep track of who is engaging with your portfolio.
*   **Profile Customization:** Fully editable artist profiles (Bio, Display Name, Avatar) without breaking permanent URLs.
*   **Cloudinary Integration:** Seamless and optimized image hosting.

## 🛠️ Technology Stack

**Frontend:**
*   React 18
*   Vite
*   TypeScript
*   Tailwind CSS (Custom Glassmorphism Design System)
*   React Router DOM
*   Zustand (State Management)
*   Lucide React (Icons)

**Backend:**
*   Java 17
*   Spring Boot 3
*   Spring Security (JWT Authentication)
*   Spring Data JPA
*   PostgreSQL
*   Cloudinary Web SDK

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   Java Development Kit (JDK 17)
*   PostgreSQL
*   A Cloudinary Account

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a database in PostgreSQL named `arttrident`.
3.  Configure your `application.properties` (or set environment variables) with your database credentials and Cloudinary API keys:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/arttrident
    spring.datasource.username=your_db_username
    spring.datasource.password=your_db_password
    
    jwt.secret=your_super_secret_jwt_key
    jwt.expiration=86400000
    
    cloudinary.cloud-name=your_cloud_name
    cloudinary.api-key=your_api_key
    cloudinary.api-secret=your_api_secret
    ```
4.  Run the application:
    ```bash
    ./gradlew bootRun
    ```

### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root of the frontend directory and add your backend API URL (if different from default):
    ```env
    VITE_API_URL=http://localhost:8080/api/v1
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

## 📜 License

This project is open-source and available under the MIT License.
