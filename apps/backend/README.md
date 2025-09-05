# 🚀 Rased AI Backend

A high-performance, secure backend API for behavioral analytics and fraud detection. Built with **Hono.js**, **Drizzle ORM**, **PostgreSQL**, and **Bun**.

## 🏗️ Architecture Overview

This backend implements a **stateful, rotating token authentication system** designed for secure web SDK integration. It provides three core APIs:

### 🔐 **Security Architecture**

1. **Domain Validation**: All requests are validated against organization-specific whitelisted domains
2. **Stateful Authentication**: Session tokens are tracked in the database with expiration
3. **Token Rotation**: Automatic token rotation on each event submission for enhanced security
4. **Multi-tenant**: Full organization isolation with API key-based server-to-server auth

### 📊 **Core APIs**

- **`/v1/config`** - Server-to-server API for generating SDK configurations
- **`/v1/token/{hash}`** - Web SDK authentication and token generation
- **`/v1/event`** - Event ingestion with automatic token rotation

## 🚀 Quick Start

### 1. **Environment Setup**

Create a `.env` file:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/rased_ai"
PORT=8000
```

### 2. **Install Dependencies**

```bash
bun install
```

### 3. **Database Setup**

```bash
# Push schema to database and seed with sample data
bun run setup
```

### 4. **Start Development Server**

```bash
bun run dev
```

Server will start on `http://localhost:8000`

### 5. **View Interactive Documentation**

Visit `http://localhost:8000/docs` for Swagger UI with interactive API testing!

## 📖 API Documentation

### 🚀 **Interactive Documentation**

**Swagger UI**: `http://localhost:8000/docs`

- Interactive API testing interface
- Complete request/response examples
- Schema validation and documentation
- Authentication testing

### 📋 **API Reference**

### 🔧 **Configuration API**

#### `GET /v1/config`

**Server-to-server authentication required**

Generate SDK configuration for client applications.

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     "http://localhost:8000/v1/config?device_id=unique-device-id"
```

**Response:**

```json
{
  "base_api_url": "http://localhost:8000",
  "organization_id": "org-0vhk0196-6cn954w2-j6rd7vx3q-fcssk2xj",
  "session_id": "ssn-726b93fb-741b-40c9-968a-a677a632d0b9",
  "transaction_id": "txn-a22706a9-1587-41e3-995c-b3990503a2c3",
  "trigger": "{\"#trigger\":\"submit\"}",
  "expires_at": "2024-01-15T12:00:00.000Z",
  "created_at": "2024-01-15T11:45:00.000Z"
}
```

### 🎫 **Token API**

#### `GET /v1/token/{hash}`

**Web SDK endpoint for token generation**

Validates handshake hash and issues session token.

```bash
curl -H "x-organisationid: org-0vhk0196-6cn954w2-j6rd7vx3q-fcssk2xj" \
     -H "x-sessionid: ssn-726b93fb-741b-40c9-968a-a677a632d0b9" \
     -H "x-transactionid: txn-a22706a9-1587-41e3-995c-b3990503a2c3" \
     "http://localhost:8000/v1/token/HANDSHAKE_HASH"
```

**Response Headers:**

```
x-session-token: d853f51e577d34e97a216789ba2eff5ee28ac834b84bbbc6658923fe0ade87a6
```

### 📊 **Event API**

#### `POST /v1/event`

**Event ingestion with token rotation**

Submit behavioral data batches from web SDK.

```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -H "x-organisationid: org-0vhk0196-6cn954w2-j6rd7vx3q-fcssk2xj" \
     -H "x-session-token: d853f51e577d34e97a216789ba2eff5ee28ac834b84bbbc6658923fe0ade87a6" \
     -d '{
       "deviceId": "device-123",
       "batchId": "batch-456",
       "batchTimestamp": "2024-01-15T12:00:00.000Z",
       "modules": {
         "mouse": [{"x": 100, "y": 200, "timestamp": 1642248000000}],
         "keyboard": [{"key": "a", "timestamp": 1642248001000}]
       }
     }' \
     "http://localhost:8000/v1/event"
```

**Response:**

```json
{
  "success": true,
  "events_processed": 2,
  "batch_id": "batch-456",
  "transaction_id": "txn-a22706a9-1587-41e3-995c-b3990503a2c3",
  "processed_at": "2024-01-15T12:00:01.000Z"
}
```

**Response Headers:**

```
x-session-token: NEW_ROTATED_TOKEN
```

## 🔄 **Authentication Flow**

1. **Config Generation**: Bank server calls `/config` with API key to get SDK configuration
2. **SDK Initialization**: Bank's frontend initializes web-SDK with the configuration
3. **Token Handshake**: Web-SDK generates hash and calls `/token/{hash}` to get session token
4. **Event Submission**: Web-SDK submits events to `/event` using session token
5. **Token Rotation**: Backend returns new token with each event submission for security

## 🗄️ **Database Schema**

### **Organizations**

- Multi-tenant organization management
- Domain whitelisting for security
- API key authentication

### **Sessions**

- User session tracking across transactions
- Token management and expiration
- Device association

### **Transactions**

- Individual user actions (login, transfer, etc.)
- Status tracking (pending → active → completed)
- Context linking for analytics

### **Events**

- Behavioral data storage (mouse, keyboard, etc.)
- Batch processing and organization
- Real-time ingestion

## 🛠️ **Development Scripts**

```bash
# Development
bun run dev              # Start development server with hot reload
bun run start            # Start production server

# Database
bun run db:generate      # Generate new migrations
bun run db:push          # Push schema to database
bun run db:studio        # Open Drizzle Studio
bun run db:seed          # Seed with sample data
bun run setup           # Complete setup (push + seed)

# Documentation
# Visit http://localhost:8000/docs after starting the server
```

## 🔒 **Security Features**

### **Domain Validation**

- Whitelist-based origin checking
- Wildcard domain support (`*.example.com`)
- Automatic request blocking for unauthorized domains

### **Token Security**

- Cryptographically secure token generation
- Automatic token rotation on each request
- Session expiration and cleanup
- Stateful validation (no JWT vulnerabilities)

### **Hash Validation**

- SHA-256 handshake validation
- Context binding (org + session + transaction + device)
- Replay attack prevention

## 📈 **Performance Optimizations**

- **Database Indexing**: Optimized queries for high-throughput event ingestion
- **Batch Processing**: Efficient bulk event storage
- **Connection Pooling**: PostgreSQL connection management
- **Middleware Pipeline**: Lightweight request processing

## 🧪 **Testing**

After running `bun run setup`, use these test organizations:

### **Example Bank**

```bash
Organization ID: org-0vhk0196-6cn954w2-j6rd7vx3q-fcssk2xj
Domains: localhost:3000, *.example-bank.com
```

### **Demo Organization**

```bash
Organization ID: org-demo-12345678-abcd-efgh-ijkl-mnopqrstuvwx
Domains: localhost:3000, localhost:3001, *.demo.com
```

The seed script will output the generated API keys for testing.

## 🚀 **Production Deployment**

1. Set production `DATABASE_URL`
2. Configure proper domain whitelist
3. Use HTTPS for all endpoints
4. Set up database connection pooling
5. Configure monitoring and logging

## 🔧 **Environment Variables**

```env
DATABASE_URL=postgresql://user:pass@host:port/dbname
PORT=8000                          # Server port
NODE_ENV=production               # Environment mode
```

---

Built with ❤️ for secure, real-time behavioral analytics.
