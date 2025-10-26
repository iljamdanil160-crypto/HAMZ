# Todo App - JavaScript + PHP + HTML

Aplikasi todo list sederhana dengan authentication yang menggabungkan HTML, JavaScript, dan PHP. Cocok untuk deploy di Railway.

## Fitur

- ✅ User Registration & Login
- ✅ JWT Authentication
- ✅ CRUD Todo (Create, Read, Update, Delete)
- ✅ Filter Todos (All, Pending, Completed)
- ✅ Real-time Statistics
- ✅ Responsive Design
- ✅ Beautiful UI dengan gradients

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: PHP 8.0+
- **Database**: MySQL/MariaDB
- **Authentication**: JWT Tokens
- **Deployment**: Railway

## Demo Credentials

- **Username**: demo
- **Password**: demo123

## Deployment di Railway

### 1. Persiapan

1. Fork atau clone repository ini
2. Daftar di [Railway.app](https://railway.app)
3. Connect GitHub account Anda

### 2. Deploy ke Railway

1. **Create New Project** di Railway dashboard
2. Pilih **Deploy from GitHub repo**
3. Pilih repository todo-app
4. Railway akan otomatis detect sebagai PHP project

### 3. Setup Database MySQL

1. Di Railway dashboard, click **New** > **Database** > **Add PostgreSQL** atau **Add MySQL**
2. Copy database credentials (host, port, username, password, database name)

### 4. Configure Environment Variables

Di Railway dashboard, add environment variables:

```bash
# Database Configuration
DB_HOST=your-mysql-host
DB_NAME=your-database-name
DB_USER=your-username
DB_PASS=your-password

# JWT Secret (generate random string)
JWT_SECRET=your-random-secret-key

# App Name
APP_NAME=Todo App
```

### 5. Setup Database

1. Railway akan otomatis assign database credentials ke environment variables
2. Use Railway's database connection string untuk setup DB_HOST, DB_NAME, etc.
3. Import database schema:

```sql
-- Run di Railway database console atau via PHPMyAdmin
CREATE DATABASE todoapp;
USE todoapp;

-- Copy contents dari database.sql
-- Atau import langsung file database.sql
```

### 6. Configure PHP

Tambahkan file `.user.ini` di root directory:

```ini
display_errors=Off
log_errors=On
memory_limit=256M
```

### 7. Deploy & Test

1. Railway akan build dan deploy otomatis
2. Check build logs untuk memastikan tidak ada error
3. Visit URL yang diberikan Railway
4. Test dengan credentials: demo / demo123

## Local Development

### Requirements

- PHP 8.0+
- MySQL/MariaDB
- Composer

### Setup

1. Clone repository:
```bash
git clone <repository-url>
cd todo-app
```

2. Install dependencies:
```bash
composer install
```

3. Setup database:
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE todoapp;"

# Import schema
mysql -u root -p todoapp < database.sql
```

4. Configure environment:
Edit `php/config.php` untuk development:

```php
// Development settings
public const DB_HOST = 'localhost';
public const DB_NAME = 'todoapp';
public const DB_USER = 'root';
public const DB_PASS = 'your-password';
public const JWT_SECRET = 'your-dev-secret';
```

5. Start local server:
```bash
php -S localhost:8000
```

6. Visit `http://localhost:8000`

## Project Structure

```
todo-app/
├── index.html          # Main todo app
├── login.html          # Login/register page
├── css/
│   └── style.css      # Styles
├── js/
│   └── app.js         # Frontend JavaScript
├── php/
│   ├── config.php     # Database & JWT config
│   ├── auth.php       # Authentication handlers
│   └── todo.php       # Todo CRUD handlers
├── composer.json      # PHP dependencies
├── Procfile          # Railway deployment config
├── database.sql      # Database schema
└── README.md         # This file
```

## API Endpoints

### Authentication (`php/auth.php`)

- `POST /php/auth.php` with `{"action":"register","username":"","email":"","password":""}`
- `POST /php/auth.php` with `{"action":"login","username":"","password":""}`
- `POST /php/auth.php` with `{"action":"verify","token":"..."}`

### Todos (`php/todo.php`)

- `POST /php/todo.php` with `{"action":"get","token":"..."}`
- `POST /php/todo.php` with `{"action":"add","token":"...","text":"..."}`
- `POST /php/todo.php` with `{"action":"toggle","token":"...","id":1}`
- `POST /php/todo.php` with `{"action":"delete","token":"...","id":1}`

## Troubleshooting

### Database Connection Error
- Check environment variables di Railway
- Ensure database is created dan accessible
- Verify DB_HOST, DB_NAME, DB_USER, DB_PASS

### Build Failed
- Check Railway build logs
- Ensure PHP version compatibility
- Check Procfile configuration

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration time
- Ensure CORS headers are correct

## Support

Jika ada masalah atau pertanyaan, silakan buat issue di repository.

## License

MIT License - free to use and modify.