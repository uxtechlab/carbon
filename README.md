# 🌱 EcoTrack AI

An AI-powered Carbon Footprint Awareness Platform that helps users calculate, monitor, understand, and reduce their environmental impact. It integrates a personalized **AI Carbon Coach** for bespoke habit recommendations, **Target Goal Trackers**, a **Daily Ecological Logger** with streaks/gamified badges, and a **Green Career & AI Roadmap Advisor** to align professional careers with global decarbonization efforts.

---

## 🚀 Key Features

1. **Carbon Footprint Calculator**: A multi-step wizard computing emissions across **Transportation**, **Home Energy**, **Water Consumption**, **Food Habits**, and **Waste Generation** using validated environmental coefficients.
2. **AI Carbon Coach**: Provides bespoke feedback by analyzing emissions profiles. Utilizes **Google Gemini (gemini-1.5-flash)** if an API key is provided, with an automatic fallback to an intelligent local heuristic rule engine. Includes an interactive chat interface.
3. **Interactive Dashboard**: Renders HSL-themed Recharts visualizations including carbon category breakdowns, peer average comparisons, and weekly savings trend lines, along with a circular Sustainability Score gauge.
4. **Target Goals Tracker**: Allows setting and tracking specific carbon reduction deadlines (e.g. "Save 20% transport emissions") relative to baseline calculations.
5. **Daily Ecological Logger & Streaks**: Records daily green habits (commutes, water savings, diet choices) to calculate daily saved CO2 and track consecutive log streaks, unlocking gamified ecological badges (e.g., "Plant Powered", "Carbon Slayer").
6. **Green Career & AI Roadmap Advisor**: Curates specialized green tech careers, matches users based on their skills/interests, shows how the career's annual carbon offset potential mitigates their personal footprint, and generates step-by-step transition roadmaps.

---

## 🛠️ Technical Architecture

EcoTrack AI is built as a monorepo containing a frontend client and a backend API:

- **Frontend**:
  - **Framework**: React 18 + TypeScript + Vite (Fast HMR)
  - **Styling**: Tailwind CSS v3 (Custom obsidian dark theme & glassmorphic layout)
  - **Charts**: Recharts (Responsive charts)
  - **State Management**: React Context with **Dual-Mode Sync/Fallback**: If the backend API is offline, the client automatically falls back to browser `LocalStorage` and local mathematical engines, guaranteeing 100% offline stability.
- **Backend**:
  - **Runtime**: Node.js + Express + TypeScript (`ts-node`/CommonJS)
  - **Database**: Local JSON Storage (Repository pattern with atomic writes preventing file corruption)
  - **AI Model**: Google Generative AI SDK (`@google/generative-ai`)
  - **Validation**: Zod (Ensuring strict parameters boundary check)
  - **Testing**: Jest + Supertest (Unit testing, validation, and endpoint integration tests)

---

## 📐 Carbon Calculation Methodology

Emissions factors are derived from IPCC, US EPA, and UK DEFRA standards:

1. **Transportation**:
   - **Car**: Annual Miles × Fuel Coefficient (Petrol: `0.40 kg/mile`, Diesel: `0.38 kg/mile`, Hybrid: `0.20 kg/mile`, Electric: `0.10 kg/mile`).
   - **Public Transit**: Hours/week × 52 weeks × `1.2 kg CO2e/hour`.
   - **Flights**: Flights/year × `280 kg CO2e/flight` (medium-haul average).
2. **Home Energy**:
   - **Electricity**: (Monthly kWh × 12 months × `0.38 kg CO2e/kWh`) ÷ Household size.
   - **Heating**: Shared utility constant ÷ Household size (Natural Gas: `1200 kg/year`, Oil: `1800 kg/year`, Electric: `600 kg/year`, None: `0`).
3. **Water**:
   - Daily Gallons × 365 days × `0.0035 kg CO2e/gallon` (pumping & water heating energy).
4. **Food & Diet**:
   - Diet Category constant: Heavy Meat (red meat daily): `3300 kg/year`, Average Meat: `2500 kg/year`, Vegetarian: `1700 kg/year`, Vegan: `1200 kg/year`.
5. **Waste & Recycling**:
   - Gross Landfill Waste: Weekly Trash Bags × 52 × `4.5 kg CO2e/bag`.
   - Recycling Offset: Gross Landfill Waste × (Recycling% / 100) × `0.40` (up to 40% reduction).
   - Net Waste = Gross Landfill Waste − Recycling Offset.

### Sustainability Score (out of 100)
The score evaluates overall carbon footprint. A score of `100` corresponds to the sustainable target footprint of **2,000 kg (2 tons) CO2e/year**. A score of `10` corresponds to the national average baseline of **16,000 kg CO2e/year**. The score is interpolated dynamically:
$$\text{Score} = \max\left(10, \min\left(100, 100 - \frac{\text{Total Emissions} - 2000}{16000 - 2000} \times 90\right)\right)$$

---

## 💻 Installation & Local Running

1. **Prerequisites**: Ensure [Node.js](https://nodejs.org) (v18+ recommended) is installed.
2. **Clone & Configure**:
   - Inside the repository root, create a `.env` file in the `server/` directory:
     ```env
     PORT=5000
     GEMINI_API_KEY=your_google_gemini_api_key_here
     ```
3. **Install Dependencies**:
   - From the repository root, install all monorepo packages:
     ```bash
     npm run install:all
     ```
4. **Run the Application**:
   - Launch both the client (Vite on port 5173) and server (Express on port 5000) concurrently:
     ```bash
     npm run dev
     ```

---

## 🧪 Testing

The backend includes Jest unit and API integration tests:

- **Run Tests**:
  ```bash
  npm run test:server
  ```
- **Tests Cover**:
  - `Low-Emissions` vs. `High-Emissions` calculator personas verification.
  - Zod API body validation rules (boundary limits on mileage, invalid engines).
  - REST controllers for footprints creation, habit logs, and streaks calculations.

---

## 🌐 Production Deployment

### Frontend (Static SPA to Vercel/Netlify/GitHub Pages)
1. **GitHub Pages**:
   - Set up the repository's GitHub Pages settings to deploy from the `/docs` folder or run a GitHub action.
2. **Vercel**:
   - Import the repository. Set the root directory to `client/`.
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: `dist`

### Backend (REST API to Render/Railway)
1. **Render**:
   - Create a new "Web Service" from your GitHub repository.
   - Set the root directory to `server/`.
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Add environment variables: `PORT` and `GEMINI_API_KEY`.
2. **Railway / Fly.io**:
   - Deploy the node package using the provided start command.

---

## 📝 Design Assumptions & Future Work
- **Static API Paths**: Client targets `http://localhost:5000/api`. If deployed, set `API_BASE` in `client/src/context/AppContext.tsx` to the production URL.
- **Future Enhancements**:
  - Direct integration with smart utility meters via IoT APIs.
  - Collaborative peer groups to allow neighborhoods to group-track decarbonization goals.
  - True LLM-agent capability for EcoCoach AI allowing it to trigger actions directly on the dashboard.
