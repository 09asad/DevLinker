# DevLinker APIs

## authRouter
- POST /signup
- POST /login
- POST /logout

## profileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

## connectionRequestRouter
- POST /request/send/interested/:userId
- POST /request/send/ignore/:userId
- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

## userRouter
- GET /user/request/received
- GET /user/connections
- GET /user/feed - GETS you the profiles of other users on platform

STATUS: interested, ignore, accepted, rejected

## pagination

/feed?page=1&limit=10 => 1-10 => .skip(0) & .limit(10)

/feed?page=2&limit=10 => 11-20 => .skip(10) & .limit(10)

/feed?page=3&limit=10 => 21-30 => .skip(20) & .limit(10)

FORMULA OF SKIP: skip = (page-1) * limit

## paymentRouter

### Create Payment
- POST /payment/create
    Protected by userAuth
    Creates a Razorpay order for the selected membership
    Stores the payment/order details in MongoDB
    Returns the Razorpay keyId and order details to the frontend

### Payment Webhook
- POST /payment/webhook
    Receives payment events from Razorpay
    Verifies the Razorpay webhook signature
    Updates payment status in the database

- On payment.captured:
    Sets user.isPremium = true
    Saves the selected membership type
    Calculates membership expiry date
    Silver → 2 months
    Gold → 6 months

- On payment.failed:
    Updates payment status to failed

## Verify Payment / User Premium Status
- GET /payment/verify
    Protected by userAuth
    Returns the logged-in user's data, including premium/membership information

## chatRouter
- GET /chat/:toUserId — Fetches previous chat messages between the logged-in user and selected user from MongoDB

### Chat
    Chat messages are stored in MongoDB
    REST API fetches previous messages
    Socket.IO handles real-time messaging
    Users can send and receive messages without refreshing

## WebSocket / Socket.IO
    Establishes real-time connection between client and server
    Real-time message sending
    Real-time message receiving
    Used for live chat between connected users