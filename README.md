# PawPraise

 A Pet Product Recommender Platform

## Getting Started

To run this project locally, follow the steps below.

## Prerequisites

Make sure you have the following installed on your machine:

- Node.js and npm
- MongoDB

## Installation

Clone the repository:

```bash
  git clone https://github.com/prudhvirekula/PawPraise.git
```

Install server dependencies:

```bash
  cd PawPraise/server
  npm install
```

Install client dependencies:

```bash
  cd ../client
  npm install
```

Configure environment variables:
Create a .env file in the server directory and add the following:

```bash
  MONGODB_URI = your_mongodb_uri
  ACCESS_TOKEN_SECRET = your_token_secret_key
```

Run the server:

```bash
 cd ../server
 node index
```

Run the client:

```bash
 cd ../server
 npm start
```

The client will be running at http://localhost:3000.

## Folder Structure
- `/client`: React client application
- `/server`: Node.js and Express.js server application

## Technologies Used
- Frontend:
  - React.js
  - Axios for HTTP requests
  - React Router for navigation
  - MD Bootstrap for styling and icons
- Backend:
  - Node.js & Express.js
  - MongoDB for database
  - Bcrypt for password hashing
