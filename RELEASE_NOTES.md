# 🛕 Thattu Kaasu (தட்டு காசு) — Version 1.0.0 Release Notes

We are thrilled to announce the official release of **Thattu Kaasu (தட்டு காசு) Version 1.0.0**! 

Thattu Kaasu is a premium, localized, and offline-first React Native mobile application built with Expo and TypeScript. It is specifically designed for temple priests, archakars, and administrators to seamlessly track and manage temple collections, pooja donations, and accounts with deep spiritual context.

---

## 🌟 Key Highlights

### 🎨 Sacred Design Language & Bento Layout
* **Spiritual Palette:** Immersive custom design theme featuring warm copper (`#8f4e00`), sacred saffron (`#ff9933`), gold (`#735c00`), and a soft cream background (`#faf9f6`).
* **Bento Grid Dashboard:** A modern, premium bento-style user interface presenting instant financial metrics including **Today's Collections**, **Weekly Trend graphs**, **Monthly Totals**, **Lifetime Revenue**, **Daily Average Revenue**, and **Month-over-Month Growth**.
* **Micro-Animations & Shadows:** Elevation styling with custom saffron glows and rich umber shadows that create a pristine, divine feel.

### 📅 Tamil Astro-Calendar & Muhurtham Parser
* **Double Calendar Mapping:** Synchronizes Western Gregorian dates with corresponding **Tamil Months** (*Chithirai, Vaigasi, Aani, Aadi, Aavani, Purattasi, Aippasi, Karthigai, Margazhi, Thai, Maasi, Panguni*) and **Tamil dates**.
* **Tithi Calculation:** Integrates a synodic lunar age algorithm to dynamically calculate lunar Tithi indices.
* **Daily Auspicious Schedules:** Automatically calculates and displays daily hours for **Rahu Kalam**, **Yamagandam**, **Kuligai**, and **Nalla Neram** based on the day of the week.

### 🔔 Auspicious Days & Deity-Specific Observations
* **Festival Auto-Tagging:** Automatically tags dates with important observances: **Amavasai**, **Pournami**, **Ekadasi**, **Pradosham**, **Pongal**, **Tamil New Year**, **Navaratri**, and **Skanda Shashti**.
* **Deity-Specific Highlights:** 
  * *Aadi Fridays* for Amman temples.
  * *Purattasi Saturdays* for Perumal temples.
  * *Sankatahara Chaturthi* for Vinayagar temples.
  * *Skanda Shashti* for Murugan temples.

### ✍️ Intuitive Collection Logger (Add Ledger Entry)
* **Amount Chips:** Pre-configured quick-input chips for ₹100, ₹500, ₹1000, and ₹2000.
* **Metadata Logging:** Fields to capture specific purposes (e.g. *Special Abhishekam*, *Pradosha Ubhayam*) and devotee names for transparent bookkeeping.

### 📄 Professional PDF Statement Generator & Sharing
* **Stunning Print Templates:** Generates a highly-stylized, clean HTML-to-PDF print layout containing the temple's logo, credentials, financial totals, and transaction ledger.
* **Native Share Sheet:** Instant sharing and export options utilizing native iOS and Android sharing sheets via `expo-print` and `expo-sharing`.

### 🔒 Enterprise-Grade Security & Offline-First Privacy
* **Biometric Lock Screen:** Integrates Face ID, Fingerprint, and device passcode authentication via `expo-local-authentication` to restrict access to sensitive ledger data.
* **100% Local Storage:** Built with `expo-sqlite` for complete data privacy. No financial data ever leaves the device.

---

## 🛠️ Technical Stack Details

* **Framework:** Expo SDK 54 (React Native 0.81.5)
* **Language:** TypeScript
* **Database:** Local SQLite (`expo-sqlite`)
* **Assets & Styling:** Custom CSS stylesheet-driven theme, SVGs (`react-native-svg`), and Material Icons.
* **Build Targets:** iOS & Android (Optimized for Portrait view and Tablet support)

---

> [!IMPORTANT]
> **Thattu Kaasu** is a 100% offline-first application. To ensure your ledger records remain safe, we recommend backing up your device using standard iCloud or Android backups.

*Akshyam (அக்ஷயம்).*
