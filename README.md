# Edumerge Admission Management System

A minimal yet fully functional Admission Management system built on the **MERN** stack (MongoDB, Express, React, Node.js). It strictly enforces real-time seat quota limitations and offers a premium UI design built meticulously using **pure Vanilla CSS** (no Tailwind/Bootstrap).




---

## 🚀 Features Implemented

- **Master Setup (Admin)**: Create institution programs and define hard seat allocation quotas (e.g., KCET, COMEDK, Management). Includes deep validation to ensure total target quotas equal total program intake limits.
- **Strict Seat Allocation Engine**: Prevents seat overbooking entirely. Validates availability in real-time before locking an applicant to a specific programmatic quota.
- **Full Admission Workflow**: A sequential 3-step timeline handling: *Seat Locking* ➡️ *Document Verification* ➡️ *Fee Confirmation*.
- **Immutable Admission ID Generation**: Unique admission numbers (e.g., `INST/2026/UG/CSE/KCET/0001`) are safely generated only *after* fees are fully paid.
- **Aggregated Analytics Dashboard**: Role-based visual data tracking overall Intake vs Admitted metrics along with live progress tracking corresponding to granular quotas.
- **Premium Aesthetics**: Developed an ultra-modern aesthetic standard utilizing Glassmorphism, deep Slate gradients, and subtle DOM transition animations leveraging only pure Vanilla CSS.

---

## 🥞 Tech Stack

- **Database**: MongoDB (Local/Atlas via Mongoose)
- **Backend/API**: Node.js, Express.js (REST APIs, JWT Auth)
- **Frontend**: React.js (via Vite)
- **Styling**: Vanilla CSS (`index.css`)
- **State Management**: React Context API

---

## 🛠️ Step-by-Step Local Setup

### 1. Requirements Before You Start
- Ensure **Node.js** (v16+) is installed.
- Ensure **MongoDB** is installed and running locally on standard port `27017` (or replace the URI in the `.env` file with a cloud Atlas connection string).

### 2. Backend Installation (Server)
Start by opening a terminal at the root of the project:

```bash
cd server
npm install
```

Ensure your `server/.env` file is properly configured. A default `.env` is already provided:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edumerge-assignment
JWT_SECRET=super_secret_jwt_key_for_edumerge
```

Start the backend:
```bash
npm start
```
*(The Express API will boot up on `http://localhost:5000`)*

### 3. Frontend Installation (Client)
Open a **new** terminal window at the root of the project:

```bash
cd client
npm install
npm run dev
```

*(The React app should now be running locally on `http://localhost:5173`)*

---

## 🔑 Demo Accounts (Automatic Seeding)
To save time during testing/evaluation, the system will **automatically create** three demo users the very first time you attempt to log in using the `admin@edumerge.com` email. 

You do not need to seed the database manually.

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@edumerge.com` | `password` | Master Setup, Full Management |
| **Admission Officer** | `officer@edumerge.com` | `password` | Create Users, Verify Docs, Lock seats |
| **Management** | `management@edumerge.com` | `password` | View-only Dashboard Metrics |

*(Note: The `admin123`, `officer123`, and `management123` passwords also work as fallbacks if you prefer).*

---

## 🧪 How to Test and Use The System

To fully evaluate the requested user journeys, follow these steps:

**1. Create the Master Setup**
- Log in as **Admin**.
- Navigate to **"Master Setup"** on the sidebar.
- Create a new Program (e.g. `CSE` Total Intake: `100`).
- Distribute exactly `100` seats into the Quotas (e.g. 40 KCET, 40 COMEDK, 20 Management). The form will enforce matching allocations before you can save.

**2. Register & Process an Applicant**
- Log in as the **Admission Officer**.
- Navigate to **"New Applicant"** and submit the streamlined application pointing to your new `CSE` program.
- You will be redirected to the **Admission Workflow Details** page.

**3. Execute The 3-Step Admission Path**
- **Step 1:** Select the `KCET` quota and lock the seat. *(The system executes an atomic MongoDB `$inc` to ensure the seat is available and logs it).*
- **Step 2:** Mark their documents as "Verified".
- **Step 3:** Confirm their Fee is "Paid". The system immediately generates their immutable, perfectly formatted Admission Number.

**4. View Dashboard Aggregations**
- Switch accounts and log in as **Management**.
- View the unified real-time dashboard tracking the locked seats and quota progress metrics.

---

## 🧠 Approach & Logic Spotlight (Interview Guide)

**Q: How does the system ensure no Seat Overbooking happens during high concurrency?**
*A:* Rather than just checking if a seat is available and then locking it in a second request (which causes race conditions), the seat locking operation utilizes MongoDB's atomic document update parameters. It uses `$expr` to verify that `filled < allocated` simultaneously while executing an `$inc: { "quotas.$.filled": 1 }` command inside the exact same database call. If the request returns null, the backend knows the quota was breached without risking overallocation!

**Q: How is the immutable sequential Admission Number Generated?**
*A:* I implemented a discrete `Sequence` Mongoose collection. It guarantees sequential `$inc: { sequence_value: 1 }` generation across the database even if 5 students pay their fees simultaneously. It safely concatenates format templates (`INST/2026/UG/CSE/KCET/[paddedsequence]`).
