# ShoeStop - E-Commerce Platform

A full-stack e-commerce platform built with React frontend and Spring Boot backend, featuring complete user authentication, product management, shopping cart, order processing, and comprehensive admin dashboard functionality.

## 🚀 Features

### Frontend (React + Vite)
- **Modern, responsive UI** with custom CSS styling
- **User authentication** - Login, register, and profile management
- **Product catalog** - Browse shoes with detailed views, search, and filtering
- **Shopping cart** - Add, update, remove items with size selection
- **Order management** - Place orders, view order history, and track status
- **Admin dashboard** - Comprehensive inventory, order, and user management
- **Toast notifications** - User feedback for all actions
- **Multi-page navigation** - Landing, home, product pages, checkout

### Backend (Spring Boot)
- **JWT-based authentication** - Secure token-based user sessions
- **RESTful API endpoints** - Complete CRUD operations for all entities
- **Password encryption** - BCrypt hashing for secure storage
- **Spring Security** - Role-based access control (USER, ADMIN)
- **H2 file-based database** - Persistent data storage
- **CORS configuration** - Frontend integration support

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **CSS3** - Styling
- **JavaScript ES6+** - Programming language

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.2.0** - Framework
- **Spring Security** - Authentication & authorization
- **Spring Data JPA** - Data access
- **H2 Database** - File-based persistent database
- **JJWT** - Token-based authentication (v0.11.5)
- **Maven** - Build tool
- **Axios** - HTTP client for API calls

## 📁 Project Structure

```
IndustryE/
├── ecommerce/          # React Frontend
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── css/        # Styling files
│   │   └── assets/     # Static assets
│   ├── public/
│   └── package.json
├── backend/            # Spring Boot Backend
│   ├── src/main/java/com/industryE/ecommerce/
│   │   ├── config/     # Configuration classes
│   │   ├── controller/ # REST controllers
│   │   ├── dto/        # Data transfer objects
│   │   ├── entity/     # JPA entities
│   │   ├── repository/ # Data repositories
│   │   ├── security/   # Security components
│   │   └── service/    # Business logic
│   ├── src/main/resources/
│   └── pom.xml
└── README.md          # This file
```

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Java 17** or higher
- **Maven 3.6** or higher

### Installing Maven (If Not Installed)

Download and install Maven:
1. **Download**: Go to https://maven.apache.org/download.cgi
2. **Extract**: Extract to a location like `C:\apache-maven-3.9.6`
3. **Add to PATH**: 
   - Open System Properties → Environment Variables
   - Add `C:\apache-maven-3.9.6\bin` to your PATH variable
   - Restart your terminal
4. **Verify**: Run `mvn --version` to confirm installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd IndustryE
```

### 2. Start the Backend

First, ensure you're in the backend directory:

```bash
cd backend
```

Then build and run the backend:

```bash
mvn clean install
mvn spring-boot:run
```

> **Note**: If you get "mvn not recognized" error, you need to install Maven. See "Installing Maven" above.

The backend will be available at:
- **API**: `http://localhost:8080`
- **H2 Console**: `http://localhost:8080/h2-console`

### 3. Start the Frontend
```bash
cd ecommerce
npm install
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## 🔑 Authentication

### Default Admin User
The system automatically creates an admin user on first startup:
- **Email**: `admin@shoestop.com`
- **Password**: `admin123`
- **Role**: ADMIN

### Create Test Customer
Register a new customer account through the frontend or use the `/api/auth/register` endpoint.

### API Endpoints

#### Register
```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## 🔒 Security Features

- **JWT Authentication**: Stateless token-based authentication
- **Password Hashing**: BCrypt encryption for secure password storage
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Bean validation for all API requests
- **Spring Security**: Comprehensive security configuration

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean and intuitive user interface
- **Interactive Components**: Product modals, cart management
- **Toast Notifications**: User feedback for actions
- **Authentication Flow**: Seamless login/register experience

## 🛒 E-Commerce Features

- **Product Catalog**: Browse shoes with detailed information
- **Shopping Cart**: Add, remove, and modify cart items
- **User Profiles**: Manage personal information and preferences
- **Authentication**: Secure user registration and login
- **Responsive Navigation**: Easy-to-use navigation system

## 🔧 Development

### Frontend Development
```bash
cd ecommerce
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

### Backend Development
```bash
cd backend
mvn spring-boot:run  # Start development server
mvn test            # Run tests
mvn clean install   # Build project
```

### Database Access
Access the H2 Console to view your database:
- **URL**: `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:file:./data/dbshoestop`
- **Username**: `sa`
- **Password**: (leave empty)

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login existing user

### Product Endpoints (Public)
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/category/{category}` - Get products by category
- `GET /api/products/search?keyword={keyword}` - Search products

### Cart Endpoints (Require Authentication)
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/items/{itemId}` - Update cart item quantity
- `DELETE /api/cart/items/{itemId}` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Order Endpoints (Require Authentication)
- `POST /api/orders/create` - Create a new order
- `GET /api/orders/user` - Get user's order history
- `GET /api/orders/{orderId}` - Get order details

### User Profile Endpoints (Require Authentication)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password

### Admin Endpoints (Require ADMIN Role)
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/products` - Get all products (admin view)
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product
- `GET /api/admin/products/low-stock` - Get low stock products
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/{id}` - Get order details
- `PUT /api/admin/orders/{id}` - Update order status

## 🎯 Implemented Features

- [x] **User Authentication** - JWT-based login/register with secure password hashing
- [x] **Product Management** - CRUD operations for products with inventory tracking
- [x] **Shopping Cart** - Full cart functionality with size selection and quantity management
- [x] **Order System** - Place orders, view order history, and track status
- [x] **Admin Dashboard** - Complete admin panel for managing products, orders, and statistics
- [x] **Search & Filtering** - Product search by keyword and category filtering
- [x] **User Profiles** - Profile management and password change functionality
- [x] **Inventory Management** - Size-based inventory tracking with low stock alerts
- [x] **Persistent Database** - H2 file-based database for data persistence
- [x] **API Integration** - Complete RESTful API with authentication

## 🚧 Future Enhancements

- [ ] Payment integration (Stripe, PayPal)
- [ ] Email notifications for orders
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced analytics dashboard
- [ ] Product image upload
- [ ] Shipping address management
- [ ] Order tracking updates

## 🔧 Troubleshooting

### Backend Issues
- **Maven not found**: Install Maven and add to PATH. See `backend/SETUP.md` for details
- **Database connection error**: Ensure H2 database files exist in `backend/data/` directory
- **Port 8080 already in use**: Change `server.port` in `application.properties`

### Frontend Issues
- **npm install fails**: Clear cache with `npm cache clean --force`
- **Dependencies not found**: Delete `node_modules` and `package-lock.json`, then run `npm install`

### Database Issues
- **Access H2 Console**: Use `jdbc:h2:file:./data/dbshoestop` as JDBC URL

## 📄 Notes

- Admin credentials are created automatically on first startup
- All passwords are hashed using BCrypt
- JWT tokens expire after 24 hours (configurable)
- Database persists to disk at `backend/data/dbshoestop.mv.db`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
