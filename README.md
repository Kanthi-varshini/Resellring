<div align="center">

```
██████╗ ███████╗███████╗███████╗██╗     ██╗     ██████╗ ██╗███╗   ██╗ ██████╗
██╔══██╗██╔════╝██╔════╝██╔════╝██║     ██║     ██╔══██╗██║████╗  ██║██╔════╝
██████╔╝█████╗  ███████╗█████╗  ██║     ██║     ██████╔╝██║██╔██╗ ██║██║  ███╗
██╔══██╗██╔══╝  ╚════██║██╔══╝  ██║     ██║     ██╔══██╗██║██║╚██╗██║██║   ██║
██║  ██║███████╗███████║███████╗███████╗███████╗██║  ██║██║██║ ╚████║╚██████╔╝
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝
```

### 💰 *The campus resale marketplace — no ghosting, no chaos, just deals.*

<br/>

![Version](https://img.shields.io/badge/version-1.0.0-d3f26a?style=for-the-badge&labelColor=060606)
![Stack](https://img.shields.io/badge/stack-MERN-d3f26a?style=for-the-badge&logo=mongodb&labelColor=060606&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&labelColor=060606&logoColor=61DAFB)
![Offers](https://img.shields.io/badge/offer--chain-live-d3f26a?style=for-the-badge&labelColor=060606)
![License](https://img.shields.io/badge/license-MIT-d3f26a?style=for-the-badge&labelColor=060606)

<br/>

> **"No more 'available?' comments. No more ghosted buyers. Just an offer, a counter, and a deal."**

</div>

---

## 💰 What is ResellRing?

**ResellRing** is a structured campus-to-campus resale marketplace that replaces the chaos of WhatsApp groups and comment threads. Every item listing has a formal **offer chain** — buyers bid real amounts, sellers counter or accept, and accepting one offer automatically declines all others.

No ghosting. No ambiguity. Transparent pricing history. Seller ratings after every completed sale.

---

## ✨ Feature Showcase

| 🏷️ Feature | 📋 Description | 🔥 Why It Matters |
|---|---|---|
| 📦 **List an Item** | Post with images, price, category, condition | Structured, not spam |
| 💬 **Offer Chain** | Buyers make offers; sellers accept or counter | No comment chaos |
| 🔒 **Exclusive Deals** | Accepting one offer auto-declines all others | No ghosted buyers |
| 📊 **Price History** | Last 3 sold prices shown per category | Set fair prices |
| 🏷️ **Categories** | Electronics, Books, Furniture, Bikes, Clothing + more | Easy browsing |
| ★ **Seller Ratings** | Rate after deal completion; public score shown | Build trust |
| 🔍 **Search and Filter** | Price range, category, condition, date | Find fast |
| 📍 **Campus Pickup** | Specify pickup spot; arrange via in-app messages | Safe meetups |

---

## 🗺️ ResellRing Mindmap

```mermaid
mindmap
  root((ResellRing))
    Listing
      Create Listing
        Title and Description
        Price and Category
        Condition
        Images Upload
        Pickup Location
      Manage Listings
        Edit
        Mark Sold
        Delete
      My Ring
        Active Listings
        Sold History
        Offer History
    Offers
      Browse Market
      Make an Offer
        Offer Amount
        Message to Seller
      Offer Chain
        Seller Counters
        Buyer Re-offers
        Accept or Decline
      Auto-Decline Others
        On Acceptance
        Notification Sent
    Ratings
      Rate Seller Post-Sale
      Rate Buyer Post-Sale
      Public Score Display
      Review History
    Discovery
      Market Browse
      Search
      Filter by Category
      Filter by Price
      Sold Price History
```

---

## 🔄 Offer Chain Flow

```mermaid
sequenceDiagram
    participant B1 as Buyer 1
    participant B2 as Buyer 2
    participant L as Listing
    participant S as Seller

    B1->>L: Make Offer ₹19,000
    B2->>L: Make Offer ₹18,500
    L->>S: 2 offers received
    S->>B1: Counter ₹20,500
    B1->>S: Accept ₹20,500
    S->>L: Mark as LOCKED
    L-->>B2: Offer auto-declined
    Note over B2: 🔔 Notification - Offer declined
    S->>B1: Arrange pickup
    B1->>S: Rate Seller
    S->>B1: Rate Buyer
```

---

## 📊 Listing Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Available: Listing Posted
    Available --> Negotiating: Offers Received
    Negotiating --> Available: All offers withdrawn
    Negotiating --> Locked: Offer Accepted
    Locked --> Sold: Pickup Complete
    Available --> Expired: 30 days inactive
    Expired --> [*]
    Sold --> Rated: Both parties rate
    Rated --> [*]: Archived

    note right of Locked
        All other offers are
        auto-declined with
        a notification
    end note
```

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph FE["🖥️ Frontend (port 5311)"]
        MK[Market Browse]
        LD[Listing Detail + Offers]
        MR[My Ring]
        SP[Seller Profile]
        CS[Create / Edit Listing]
    end
    subgraph BE["⚙️ Backend (port 5111)"]
        API["Express /api"]
        LR["/listings"]
        OR["/offers"]
        MSG["/messages"]
        RR["/ratings"]
        UP["/upload"]
    end
    subgraph DB["🍃 MongoDB"]
        LS[(Listings)]
        OF[(Offers)]
        MS[(Messages)]
        RT[(Ratings)]
        IM[(Images)]
    end

    FE -->|Axios + JWT| API
    API --> LR
    API --> OR
    API --> MSG
    API --> RR
    API --> UP
    LR --> LS
    OR --> OF
    OR -->|on accept: decline others| OF
    MSG --> MS
    RR --> RT
    UP --> IM

    style FE fill:#060606,color:#d3f26a,stroke:#d3f26a
    style BE fill:#040404,color:#d3f26a,stroke:#d3f26a
    style DB fill:#020202,color:#d3f26a,stroke:#d3f26a
```

---

## 📊 Data Model

```mermaid
erDiagram
    USER {
        string id PK
        string name
        string email
        string passwordHash
        float sellerRating
        int totalSales
    }
    LISTING {
        string id PK
        string sellerId FK
        string title
        string description
        string category
        string condition
        int askingPrice
        array imageUrls
        string pickupLocation
        string status "available|negotiating|locked|sold|expired"
    }
    OFFER {
        string id PK
        string listingId FK
        string buyerId FK
        int amount
        string message
        string status "pending|countered|accepted|declined"
        int counterAmount
    }
    RATING {
        string id PK
        string reviewerId FK
        string revieweeId FK
        string listingId FK
        int stars
        string comment
    }
    MESSAGE {
        string id PK
        string listingId FK
        string senderId FK
        string receiverId FK
        string text
    }

    USER ||--o{ LISTING : sells
    LISTING ||--o{ OFFER : receives
    USER ||--o{ OFFER : makes
    USER ||--o{ RATING : gives
    USER ||--o{ RATING : receives
    LISTING ||--o{ RATING : "is rated after"
    LISTING ||--o{ MESSAGE : "has chat"
    USER ||--o{ MESSAGE : sends
```

---

## 🎨 Design Identity

```
┌─────────────────────────────────────────────────────────────┐
│                   RESELLRING PALETTE                        │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  Extreme Void│  Acid Green  │  Ember       │  Zinc         │
│  #060606     │  #d3f26a     │  #ff6b35     │  #71717a      │
│  ████████    │  ████████    │  ████████    │  ████████     │
├──────────────┴──────────────┴──────────────┴───────────────┤
│  Typography: Unbounded (Display) + Inter + Space Mono       │
│  Aesthetic: Extreme dark · price tags · acid green brand    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

Run the backend and frontend in **two separate terminals**.

```bash
# Terminal 1 - Backend (in-memory DB, pre-seeded)
cd resellring/backend
cp .env.example .env
npm install
npm run dev

# Terminal 2 - Frontend
cd resellring/frontend
npm install
npm run dev
```

Then open **http://localhost:5311** in your browser.

### 🎭 Demo Accounts

| Role | Email | Password | What's Inside |
|------|-------|----------|---------------|
| 🏪 Seller | `kabir@demo.com` | `Demo@1234` | Active listings, incoming offers |
| 🛒 Buyer | `tara@demo.com` | `Demo@1234` | Pending offers, purchase history |

---

## 📁 Project Structure

```
resellring/
├── frontend/
│   └── src/
│       ├── pages/        # Landing, Market, ListingDetail, MyRing, SellerProfile
│       └── components/   # Navbar, states, SceneBackground
└── backend/
    ├── routes/           # listings, offers, ratings, messages, upload
    ├── models/           # User, Listing, Offer, Rating, Message
    └── seed/             # Demo listings with offer chains
```

---

<div align="center">

### 💰 Structured deals. Zero ghosting. Campus hustle, done right.

![Zero Ghosting](https://img.shields.io/badge/Zero-Ghosting-d3f26a?style=for-the-badge&labelColor=060606)
![Offer Chain](https://img.shields.io/badge/Offer-Chain%20System-d3f26a?style=for-the-badge&labelColor=060606)
![Campus](https://img.shields.io/badge/For-Campus%20Resale-ff6b35?style=for-the-badge&labelColor=060606)

</div>
