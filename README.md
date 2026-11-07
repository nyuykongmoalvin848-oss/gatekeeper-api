# Gatekeeper API

An atomic, transactional event ticketing and booking engine powered by Node.js

## Prerequisites

    Node.js
    PostgreSQL

## Set Up

    Clone the repository.
    Copy environment properties: cp .env.example .env
    Configure the DATABASE_URL string inside .env.
    Run schema migrations: npx node-pg-migrate up

## Execution

    Start the server: npm run start

## Verification Suites

Execute validation rules, transactional behaviors, and structural regressions:
