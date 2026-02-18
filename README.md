# xpr-dev-facility-booking

This is project for New Facility Booking Micro-Frontend for Xplor Rec

# Contract Management Application

A React-based contract management interface built with Vite.

## Features

- **Header Navigation**: Logo, POS, Tasks, and user profile with online status
- **Secondary Navigation**: Quick access to Clients, Classes, Facilities, Store, Marketing, and More
- **Contract Details Page**: 
  - Contract information display
  - Client, Location, Meeting, and Extras cards
  - Tabbed interface (Sessions, Attachments)
  - Sessions table with data management
  - Action buttons (Send, Save & Close, Firm Contract)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
contract-management-app/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Header.css
│   │   ├── SecondaryNav.jsx
│   │   └── SecondaryNav.css
│   ├── pages/
│   │   ├── ContractDetails.jsx
│   │   └── ContractDetails.css
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Technologies Used

- React 18
- Vite
- React Router DOM
- React Icons

## License

MIT
