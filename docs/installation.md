# Installation

## Prerequisites

- Node.js (v18+ recommended)
- Python 3.10+
- PostgreSQL or compatible database

## Backend Setup

1. Clone the repository:

   ```
   git clone https://github.com/your-org/edu_fullstack.git
   cd edu_fullstack
   ```

2. Install Python dependencies:

   ```
   pip install -r requirements.txt
   ```

3. Configure environment variables in `.env` (see `.env.example`).

4. Run database migrations:

   ```
   alembic upgrade head
   ```

5. Start the backend server:
   ```
   uvicorn main:app --reload
   ```

## Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd educlass-dev-branch
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the frontend:
   ```
   npm start
   ```

---
