# Notes App - NestJS with PostgreSQL

A scalable and feature-rich notes management application built with NestJS, PostgreSQL, and Docker. This application provides a RESTful API for managing notes with full CRUD operations, tagging, and archiving functionality.

## Features

- ✅ **CRUD Operations**: Create, Read, Update, and Delete notes
- 🏷️ **Tagging System**: Organize notes with tags
- 📁 **Archive Functionality**: Archive/unarchive notes
- 🔍 **Filter by Tags**: Find notes by specific tags
- 📚 **API Documentation**: Auto-generated Swagger documentation
- 🐳 **Docker Support**: Fully containerized with Docker Compose
- 🗄️ **Database Migrations**: TypeORM migrations for schema management
- 🛡️ **Validation**: Request validation with class-validator
- 📝 **Logging**: Request logging middleware
- 🌐 **CORS Support**: Cross-origin resource sharing
- 🔄 **Global Exception Handling**: Centralized error management

## Tech Stack

- **Backend**: NestJS (Node.js framework)
- **Database**: PostgreSQL 15
- **Package Manager**: pnpm
- **Containerization**: Docker & Docker Compose
- **ORM**: TypeORM
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- pnpm (installed globally)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd notes-app

# Copy environment variables
cp .env.example .env
```

### 2. Run with Docker

```bash
# Start the application with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f app
```

The application will be available at:

- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api
- **PostgreSQL**: localhost:5432

### 3. Local Development (without Docker)

```bash
# Install dependencies
pnpm install

# Start PostgreSQL (make sure it's running locally)
# Update .env with your local database credentials

# Run migrations
pnpm run migration:run

# Start development server
pnpm run start:dev
```

## API Endpoints

### Notes Management

| Method   | Endpoint               | Description                                   |
| -------- | ---------------------- | --------------------------------------------- |
| `POST`   | `/notes`               | Create a new note                             |
| `GET`    | `/notes`               | Get all notes (with optional archived filter) |
| `GET`    | `/notes/:id`           | Get a specific note by ID                     |
| `PATCH`  | `/notes/:id`           | Update a note                                 |
| `DELETE` | `/notes/:id`           | Delete a note                                 |
| `PATCH`  | `/notes/:id/archive`   | Archive a note                                |
| `PATCH`  | `/notes/:id/unarchive` | Unarchive a note                              |
| `GET`    | `/notes/tag/:tag`      | Get notes by tag                              |

### Request Examples

#### Create a Note

```bash
curl -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Note",
    "content": "This is the content of my note",
    "tags": ["work", "important"]
  }'
```

#### Get All Notes

```bash
curl http://localhost:3000/notes
```

#### Get Notes Including Archived

```bash
curl http://localhost:3000/notes?includeArchived=true
```

#### Update a Note

```bash
curl -X PATCH http://localhost:3000/notes/{note-id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content"
  }'
```

## Database Schema

### Notes Table

| Column       | Type         | Description                     |
| ------------ | ------------ | ------------------------------- |
| `id`         | UUID         | Primary key (auto-generated)    |
| `title`      | VARCHAR(255) | Note title                      |
| `content`    | TEXT         | Note content                    |
| `tags`       | TEXT[]       | Array of tags                   |
| `isArchived` | BOOLEAN      | Archive status (default: false) |
| `createdAt`  | TIMESTAMP    | Creation timestamp              |
| `updatedAt`  | TIMESTAMP    | Last update timestamp           |

## Development

### Available Scripts

```bash
# Development
pnpm run start:dev        # Start in watch mode
pnpm run start:debug      # Start in debug mode

# Building
pnpm run build           # Build for production
pnpm run start:prod      # Start production server

# Testing
pnpm run test            # Run unit tests
pnpm run test:e2e        # Run end-to-end tests
pnpm run test:cov        # Run tests with coverage

# Database
pnpm run migration:generate  # Generate new migration
pnpm run migration:run       # Run pending migrations
pnpm run migration:revert    # Revert last migration

# Code Quality
pnpm run lint            # Lint code
pnpm run format          # Format code
```

### Project Structure

```
src/
├── common/              # Shared utilities and middleware
│   ├── filters/         # Global exception filters
│   └── middleware/      # Custom middleware
├── database/            # Database configuration and migrations
│   ├── migrations/      # TypeORM migrations
│   ├── data-source.ts   # Database configuration
│   └── database.module.ts
├── notes/               # Notes module
│   ├── dto/             # Data Transfer Objects
│   ├── entities/        # Database entities
│   ├── notes.controller.ts
│   ├── notes.service.ts
│   └── notes.module.ts
├── app.module.ts        # Root application module
└── main.ts             # Application entry point
```

## Environment Variables

| Variable      | Description       | Default       |
| ------------- | ----------------- | ------------- |
| `NODE_ENV`    | Environment mode  | `development` |
| `PORT`        | Application port  | `3000`        |
| `DB_HOST`     | Database host     | `localhost`   |
| `DB_PORT`     | Database port     | `5432`        |
| `DB_USERNAME` | Database username | `postgres`    |
| `DB_PASSWORD` | Database password | `postgres`    |
| `DB_DATABASE` | Database name     | `notesapp`    |

## Future Expansion Considerations

This application is designed with scalability in mind. Here are some areas for future expansion:

### Authentication & Authorization

- Add JWT-based authentication
- Implement role-based access control
- User management system

### Enhanced Features

- Full-text search capabilities
- Note sharing and collaboration
- File attachments
- Note categories and folders
- Rich text editor support

### Performance & Scalability

- Redis caching layer
- Database indexing optimization
- API rate limiting
- Pagination for large datasets

### Monitoring & Observability

- Application metrics
- Health checks
- Structured logging
- Error tracking

### API Enhancements

- GraphQL endpoint
- Real-time updates with WebSockets
- Bulk operations
- Advanced filtering and sorting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please:

1. Check the existing [issues](../../issues)
2. Create a new issue with detailed information
3. Provide logs and environment details

---

**Happy coding! 🚀**
