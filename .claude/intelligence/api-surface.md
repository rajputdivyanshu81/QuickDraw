# API Surface (REST)

All routes are hosted on the `http-backend` service.

## 🔑 Authentication
Most routes require a `Authorization` header containing a Clerk JWT and are protected by the `middleware.ts`.

## 🏠 Room Management
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/room` | Creates a new drawing room. | Yes |
| `GET` | `/room/:slug` | Fetches metadata for a room by its slug. | No |
| `GET` | `/chats/:roomId` | Fetches the message/event history for a room. | Yes |

## 🧠 AI & Utilities
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai-chat` | Proxies chat requests to Groq (Llama 3.3). | No |
| `POST` | `/generate-ppt` | Generates a .pptx file from canvas captures. | No |

## 💳 Payments (PayU)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/create-payment` | Initiates a PayU payment transaction. | Yes |
| `POST` | `/api/payment-callback` | Webhook for PayU payment status updates. | No |
