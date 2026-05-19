# SplitHive

SplitHive is a full-stack expense sharing application for groups, trips, roommates, teams, and friends. It helps users track shared expenses, split costs between selected members, settle balances, and understand group spending through dashboard analytics.

## Demo Account

Use the seeded demo account to explore the app with ready-made groups, expenses, and settlements.

```text
Email: demo@splithive.dev
Password: Password123!
```

The login page includes a `Try Demo` button that signs in with this account through the normal authentication flow.

## Features

- User registration and login
- Email confirmation after sign-up
- Password reset flow
- JWT-based API authentication
- Group creation
- Member invitations
- Invite acceptance flow
- Invoice-style expense entry with multiple products
- Quantity and price calculation for expense items
- Selective expense splitting by member
- Equal split calculation for selected participants
- Settlement recording between group members
- Dashboard analytics for:
  - You owe
  - Owed to you
  - Net balance
  - Total group spend
  - Group filters
  - Expense filters
  - Balance pie chart
  - Group spending graph

## Tech Stack

Backend:

- Ruby on Rails API
- MySQL
- Devise
- Devise JWT
- Action Mailer

Frontend:

- React
- TypeScript
- Redux Toolkit
- React Router
- React Bootstrap
- Lucide icons
- Vite

## Project Structure

```text
SplitHiveProject/
  backend/    Rails API, authentication, database models, mailers
  frontend/   React app, Redux state, dashboard, auth, and group UI
```

## Requirements

- Ruby `3.3.0`
- Bundler `2.5.6`
- Node.js and npm
- MySQL
- SMTP credentials for email delivery

## Backend Setup

From the backend folder:

```bash
cd backend
bundle install
```

Create and migrate the database:

```bash
bin/rails db:create
bin/rails db:migrate
```

Load sample data:

```bash
bin/rails db:seed
```

If `bin/rails` uses macOS system Ruby, switch to the project Ruby first:

```bash
rbenv install 3.3.0
rbenv local 3.3.0
gem install bundler -v 2.5.6
bundle install
```

Run the Rails API:

```bash
bin/rails server -p 3000
```

The frontend expects the API at:

```text
http://localhost:3000
```

## Frontend Setup

From the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

If that port is already in use, Vite will choose the next available port.

## Email Setup

The development mailer reads these environment variables:

```bash
EMAIL=your.gmail.address@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

For deployment, configure SMTP credentials with your hosting provider or email service.

## Sample Data

Running:

```bash
bin/rails db:seed
```

creates a confirmed demo account and sample groups:

- Goa Trip
- Apartment Roommates
- Office Lunch

The seed also creates members, invoice-style expenses, selected participant splits, and settlements. Re-running seeds refreshes the seeded demo groups.

## Common Commands

Backend syntax checks:

```bash
ruby -c app/controllers/groups_controller.rb
ruby -c app/controllers/expenses_controller.rb
ruby -c app/controllers/settlements_controller.rb
```

Frontend production build:

```bash
npm run build
```

Direct Vite build:

```bash
npx vite build
```

Note: this project currently needs a frontend `tsconfig.json` for `npm run build` to run `tsc` successfully. `npx vite build` verifies the Vite bundle.

## Run The App

1. Start MySQL.
2. Start the Rails API on port `3000`.
3. Start the React frontend.
4. Open the frontend URL.
5. Register a new account or click `Try Demo`.
6. Create groups, invite members, add expenses, split costs, and record settlements.

## Deployment Notes

- Set production database credentials.
- Set a secure Rails secret key base.
- Configure SMTP credentials for confirmation and password reset emails.
- Point the frontend API base URL to the deployed Rails API.
- Run migrations before starting the application.
- Seed sample data only when needed.

## Future Improvements

- Add automated backend request specs
- Add frontend component tests
- Add per-member balance breakdowns inside each group
- Add richer settlement history
- Add receipt image upload
- Add export options for expenses and settlements
