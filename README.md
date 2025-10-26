# pharmacy-pos

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

# Default User Credentials

The system has been configured with one user account for each role level. Below are the login credentials:

## User Accounts

### 1. Super Administrator

- **Username:** `superadmin`
- **Password:** `super123`
- **Full Name:** Super Administrator
- **Email:** superadmin@pharmacy.com
- **Role:** Super Admin
- **Permissions:** All system permissions including the ability to manage other admins

### 2. Administrator

- **Username:** `admin`
- **Password:** `admin123`
- **Full Name:** Administrator
- **Email:** admin@pharmacy.com
- **Role:** Admin
- **Permissions:** Full system access, can create and manage users (except other admins)

### 3. Manager

- **Username:** `manager`
- **Password:** `manager123`
- **Full Name:** Store Manager
- **Email:** manager@pharmacy.com
- **Role:** Manager
- **Permissions:** Manage operations, inventory, and reports

### 4. Pharmacist

- **Username:** `pharmacist`
- **Password:** `pharma123`
- **Full Name:** John Pharmacist
- **Email:** pharmacist@pharmacy.com
- **Role:** Pharmacist
- **Permissions:** Handle prescriptions, sales, and customer service

### 5. Cashier

- **Username:** `cashier`
- **Password:** `cashier123`
- **Full Name:** Jane Cashier
- **Email:** cashier@pharmacy.com
- **Role:** Cashier
- **Permissions:** Process sales and customer transactions

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
