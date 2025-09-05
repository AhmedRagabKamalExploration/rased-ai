# 📚 Swagger API Documentation Examples

This file provides examples of how to use the interactive Swagger documentation for testing your APIs.

## 🚀 Getting Started

1. **Start the backend server:**

   ```bash
   bun run dev
   ```

2. **Open Swagger UI:**
   Navigate to `http://localhost:8000/docs`

3. **View the OpenAPI specification:**
   JSON format available at `http://localhost:8000/docs/doc`

## 🔐 Authentication Examples

### API Key Authentication (Config API)

1. **Get your API key** from the seed script output or database
2. **In Swagger UI**, click the "Authorize" button
3. **Enter your API key** in the `bearerAuth` section:
   ```
   Bearer your_api_key_here
   ```

### Session Token Authentication (Token/Event APIs)

1. **First get a session token** using the `/v1/token/{hash}` endpoint
2. **Copy the token** from the response headers
3. **Use the token** in subsequent requests with header:
   ```
   x-session-token: your_session_token_here
   ```

## 🧪 Testing Flow Examples

### Complete SDK Flow Test

1. **Generate Config** (`POST /v1/config`):

   ```json
   {
     "device_id": "device-123",
     "session_duration": 900,
     "trigger": "{\"#trigger\":\"submit\"}"
   }
   ```

2. **Get Session Token** (`GET /v1/token/{hash}`):
   - Calculate hash: `SHA256(org_id + transaction_id + session_id + device_id)`
   - Add required headers:
     - `x-organisationid`: From config response
     - `x-sessionid`: From config response
     - `x-transactionid`: From config response

3. **Submit Events** (`POST /v1/event`):

   ```json
   {
     "deviceId": "device-123",
     "batchId": "batch-456",
     "batchTimestamp": "2024-01-15T12:00:00.000Z",
     "modules": {
       "mouse": [{ "x": 100, "y": 200, "timestamp": 1642248000000 }],
       "keyboard": [{ "key": "a", "timestamp": 1642248001000 }]
     }
   }
   ```

4. **Complete Transaction** (`POST /v1/event/complete`):
   ```json
   {
     "transaction_id": "txn-from-config-response"
   }
   ```

## 📊 Response Examples

### Successful Config Response

```json
{
  "base_api_url": "http://localhost:8000",
  "organization_id": "org-0vhk0196-6cn954w2-j6rd7vx3q-fcssk2xj",
  "session_id": "ssn-726b93fb-741b-40c9-968a-a677a632d0b9",
  "transaction_id": "txn-a22706a9-1587-41e3-995c-b3990503a2c3",
  "trigger": "{\"#trigger\":\"submit\"}",
  "expires_at": "2024-01-15T12:15:00.000Z",
  "created_at": "2024-01-15T12:00:00.000Z"
}
```

### Event Ingestion Response

```json
{
  "success": true,
  "events_processed": 2,
  "batch_id": "batch-456",
  "transaction_id": "txn-a22706a9-1587-41e3-995c-b3990503a2c3",
  "processed_at": "2024-01-15T12:00:01.000Z"
}
```

## 🚨 Error Examples

### 401 Unauthorized

```json
{
  "error": "Invalid API key",
  "message": "The provided API key is not valid or has been revoked"
}
```

### 403 Forbidden (Domain Validation)

```json
{
  "error": "Unauthorized origin",
  "message": "Request origin is not whitelisted for this organization"
}
```

### 400 Bad Request

```json
{
  "error": "Missing required headers",
  "missing": ["x-organisationid", "x-sessionid"]
}
```

## 🔧 Swagger UI Features

### Try It Out

- Click "Try it out" on any endpoint
- Fill in parameters and request body
- Click "Execute" to test the API

### Schema Validation

- Request bodies are validated against schemas
- Required fields are clearly marked
- Data types and formats are enforced

### Response Documentation

- All possible response codes are documented
- Response schemas show expected data structure
- Headers are documented (like `x-session-token`)

### Authentication Testing

- Test different authentication methods
- See which endpoints require which auth
- Validate token responses

## 📈 Advanced Testing

### Bulk Testing

Use the batch validation endpoint to test event structures:

```json
{
  "deviceId": "device-123",
  "batchId": "batch-test",
  "batchTimestamp": "2024-01-15T12:00:00.000Z",
  "modules": {
    "test_module": [{ "test_data": "example" }]
  }
}
```

### Health Monitoring

Monitor API health using health check endpoints:

- `/health` - Global health
- `/v1/health` - V1 API health
- `/v1/event/health` - Event service health

## 💡 Tips

1. **Use the schema examples** - Copy and modify the provided examples
2. **Check response headers** - Token rotation returns new tokens in headers
3. **Validate domains** - Ensure your request origin is whitelisted
4. **Monitor rate limits** - Keep track of request frequency
5. **Use proper timestamps** - Ensure timestamps are in ISO 8601 format

---

Happy testing! 🚀
