# Gatekeeper API

An atomic, transactional event ticketing and booking engine powered by Node.js

## Prerequisites
- Node.js
- PostgreSQL

## Set Up
1. Clone the repository.
2. Copy environment properties: `cp .env.example .env`
3. Configure the `DATABASE_URL` string inside `.env`.
4. Run schema migrations: `npx node-pg-migrate up`

## Execution
- Start the server: `npm run start`

## Verification Suites
Execute validation rules, transactional behaviors, and structural regressions:
```bash
npm test
```
