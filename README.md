# 🛕 Thattu Kaasu (தட்டு காசு)

A premium, localized React Native mobile application built with Expo and TypeScript to manage temple collections, donations, and pooja accounts. It integrates a smart **Tamil Astro-Calendar parser** to automatically calculate Tamil months, dates, and identify auspicious festivals or special observances (like Amavasai, Pournami, Pradosham, Ekadasi, and deity-specific special days).

---

## ✨ Features

- **🌸 Dedicated Spiritual Onboarding**
  - Customizable setup flow to configure your specific temple deity: **Perumal (Vishnu)**, **Shiva**, **Amman (Shakti)**, **Murugan**, **Vinayagar (Ganesha)**, or general worship.
  - Custom profiles for Temple Name and Priest / Archakar credentials.

- **📊 Interactive Bento Dashboard**
  - Instant financial overview showing **Today's Collections**, **Weekly Trends**, **Monthly Totals**, and **Lifetime Revenue**.
  - Advanced metrics: daily average revenue calculation, total transaction counts, and month-over-month growth rates.
  - List of recent transaction history with details.

- **✍️ Intuitive Collection Logger**
  - Input amounts with quick chips suggestion (₹100, ₹500, ₹1000, ₹2000).
  - Add specific purpose or devotee name in the notes section (e.g., *Special Abhishekam*, *Pradosha Ubhayam*, *Devotee Donation*).

- **📅 Tamil Astro-Calendar Parser**
  - Automatic translation of Gregorian dates to corresponding **Tamil Months** (*Chithirai, Vaigasi, Aani, Aadi, Aavani, Purattasi, Aippasi, Karthigai, Margazhi, Thai, Maasi, Panguni*) and **Tamil dates**.
  - Syncs with a synodic lunar age algorithm to dynamically calculate Tithi indices.

- **🔔 Auspicious Observances Detection**
  - Automatically tags specific days with respective festivals: **Amavasai**, **Pournami**, **Ekadasi**, **Pradosham**, **Pongal**, **Tamil New Year**, **Navaratri**, and **Skanda Shashti**.
  - Deity-specific observances:
    - *Aadi Fridays* for Amman temples
    - *Purattasi Saturdays* for Perumal temples
    - *Sankatahara Chaturthi* for Vinayagar temples
    - *Skanda Shashti* for Murugan temples

- **📄 Ledger PDF Export & Share**
  - Compiles accounts ledger into a highly-stylized print layout.
  - Native print-to-file generation and instant sharing sheet integration using `expo-print` and `expo-sharing`.

- **🎨 Harmonious Spiritual Theme**
  - Designed with a custom-tailored Material-inspired color system (warm copper, sacred amber, soft backgrounds, and crisp text colors) that gives the app a serene, premium temple aesthetic.

---

## 🛠️ Technology Stack

- **Framework:** [Expo](https://expo.dev/) (SDK 54) & [React Native](https://reactnative.dev/)
- **Language:** TypeScript
- **Database:** SQLite via [`expo-sqlite`](https://docs.expo.dev/versions/latest/sdk/sqlite/) for fast local storage
- **Documents & Sharing:** [`expo-print`](https://docs.expo.dev/versions/latest/sdk/print/) and [`expo-sharing`](https://docs.expo.dev/versions/latest/sdk/sharing/)
- **Icons:** Material Icons via `@expo/vector-icons`

---

## 📁 Project Structure

```text
thattu-kaasu/
├── assets/                  # App icons, splash screens, and design media
├── src/
│   ├── screens/
│   │   ├── Onboarding.tsx   # Initial setup (temple name, deity selection)
│   │   ├── Dashboard.tsx    # Home screen featuring bento statistics grid
│   │   ├── AddCollection.tsx# Ledger income input form
│   │   ├── Calendar.tsx     # Calendar viewer displaying Gregorian/Tamil dates
│   │   ├── Analytics.tsx    # Transaction insights and charts
│   │   └── Reports.tsx      # Monthly totals and PDF statement generation
│   ├── theme/
│   │   └── colors.ts        # Harmonious color tokens and font definitions
│   └── utils/
│     ├── db.ts              # SQLite table initializations and queries
│     └── tamilCalendar.ts   # Astro-calendar lunar calculations & festival tagging
├── App.js                   # Application root routing and state manager
├── app.json                 # Expo project configuration
└── package.json             # NPM dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/thattu-kaasu.git
   cd thattu-kaasu
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the Expo development server:

```bash
npx expo start
```

#### 🌐 Running in Offline Mode

If you do not have an active internet connection, or if you run into `TypeError: fetch failed` due to network proxies/firewalls checking native module versioning:

```bash
npx expo start --offline
```
*Alternatively, you can start the project by setting the environment variable `EXPO_OFFLINE=1`.*

Once Metro Bundler is running, you can open the app on:
- **Android Emulator / Device:** Press `a` (requires Android Studio or Expo Go app)
- **iOS Simulator / Device:** Press `i` (requires Xcode or Expo Go app)

---

## 🔒 Offline & Data Privacy

This app is **100% offline-first**. All financial entries, settings, and temple logs are saved locally using SQLite. No data is transmitted to external servers, ensuring absolute privacy and security for the temple records.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

*Akshyam.*
