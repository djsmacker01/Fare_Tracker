# Fare Tracker - Transportation Price Monitor

**Fare Tracker** is a responsive front-end web application that empowers users to monitor and optimize their transportation costs across multiple ride-sharing and taxi services. With features like real-time fare tracking, price alerts, and intelligent travel insights, the platform helps commuters make smarter travel decisions.

---

## 🚀 Features

- 🔍 **Real-time Fare Estimates** for Uber, Bolt, and traditional taxis  
- 🔔 **Custom Price Alerts** when fares drop below your chosen threshold  
- 📈 **Historical Fare Trends** to spot patterns and peak hours  
- 🧠 **Smart Travel Recommendations** based on fare data  
- 📊 **Peak Demand Analysis** to help avoid surge pricing  

---

## 🎯 Target Users

- **Daily Commuters** – Monitor recurring routes for price efficiency  
- **Budget-Conscious Travelers** – Set alerts to catch cheaper fares  
- **Business Travelers** – Track and plan for transportation budgets  
- **Urban Residents** – Compare services to minimize peak-time costs  

---

## 🧭 How It Works

### ✅ Input

- Pickup and destination locations (manual text input)  
- Preferred transport service (Uber, Bolt, Taxi)  
- Price alert threshold ($10 - $100)  
- Real-time tracking toggle (Start / Stop)

### 📤 Output

- Live fare estimates for all selected services  
- Graphical view of historical trends  
- Notifications for price drops or spikes  
- Suggested best travel times  
- Peak demand warnings

---

## 🔄 Workflow

1. Enter your route (pickup and destination)
2. Choose your preferred ride service
3. Set a price alert threshold (e.g. $20)
4. Enable real-time tracking
5. Monitor fare updates and receive smart alerts
6. Use insights to travel at the most affordable times

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **APIs:** Uber API, Google Maps API *(or alternatives)*  
- **Alerting System:** In-browser notifications / Webhooks *(optional)*

---

## 📦 Future Enhancements

- Integration with real-time traffic data  
- User accounts with route history  
- Multi-city support  
- SMS/email alert support  
- PWA (Progressive Web App) functionality

## 🎨 UI Design Components

### 1. Route Setup Interface
```
┌─────────────────────────────────────────────────────────┐
│ 📍 Route Setup                                          │
├─────────────────────────────────────────────────────────┤
│ From: [Downtown                    ]                    │
│ To:   [Airport                     ]                    │
└─────────────────────────────────────────────────────────┘
```
**Design Elements:**
- Clean input fields with location icons
- Placeholder text for guidance
- Responsive grid layout (2 columns on desktop, stacked on mobile)
- Focus states with blue accent colors

### 2. Current Fares Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ 💵 Current Fares                    [Stop Tracking] │
├─────────────────────────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌─────────┐                  │
│ │🚗 Uber  │  │⚡ Bolt  │  │🚕 Taxi  │                  │
│ │ $28.50  │  │ $26.80  │  │ $32.00  │                  │
│ │ ↗ +2.1% │  │ ↘ -1.5% │  │ ↗ +3.2% │                  │
│ └─────────┘  └─────────┘  └─────────┘                  │
└─────────────────────────────────────────────────────────┘
```
**Design Elements:**
- Service cards with brand colors and icons
- Real-time price display with large, bold typography
- Price change indicators with trend arrows
- Start/Stop tracking toggle button
- Selected service highlighting with blue border

### 3. Price History Visualization
```
┌─────────────────────────────────────────────────────────┐
│ 📈 Today's Price Trends                                 │
├─────────────────────────────────────────────────────────┤
│    $45 ┤                                               │
│    $40 ┤     ●                                         │
│    $35 ┤   ●   ●                                       │
│    $30 ┤ ●       ●   ●                                 │
│    $25 ┤           ●   ●                               │
│    $20 ┤ ●               ●                             │
│        └┬───┬───┬───┬───┬───┬───┬                      │
│         6AM 7AM 8AM 9AM 10AM 11AM 12PM                 │
│                                                         │
│ Legend: ⚫ Uber  🟢 Bolt  🟠 Taxi                      │
└─────────────────────────────────────────────────────────┘
```
**Design Elements:**
- Interactive line chart with hover tooltips
- Multi-service comparison with distinct colors
- Time-based X-axis with clear labeling
- Responsive chart sizing
- Color-coded legend

### 4. Price Alert Setup
```
┌─────────────────────────────────────────────────────────┐
│ 🔔 Price Alerts                                         │
├─────────────────────────────────────────────────────────┤
│ Alert me when Uber price drops below:                  │
│ $ [25.00          ]                                     │
│ Current Uber price: $28.50                             │
│                                                         │
│ ⚠️  Waiting for price drop...                          │
└─────────────────────────────────────────────────────────┘
```
**Design Elements:**
- Clear labeling with selected service name
- Number input with dollar sign prefix
- Current price reference
- Status indicator with color-coded feedback
- Visual alert state (waiting/triggered)

### 5. Best Travel Times Recommendations
```
┌─────────────────────────────────────────────────────────┐
│ ⏰ Best Travel Times                                    │
├─────────────────────────────────────────────────────────┤
│ 🥇 10:00 AM    $25.00    40% demand                    │
│ 🥈 6:00 AM     $22.00    30% demand                    │
│ 🥉 2:00 PM     $28.00    50% demand                    │
│                                                         │
│ [Demand Chart: Bar visualization]                      │
└─────────────────────────────────────────────────────────┘
```
**Design Elements:**
- Ranked list with medal indicators
- Price and demand percentage display
- Color-coded recommendations (green for best)
- Integrated demand visualization chart

## 🔧 Technical Documentation

### 1. Real-Time Fare Monitoring
**Functionality:**
- Simulates live price updates every 3 seconds when tracking is enabled
- Tracks fare fluctuations for Uber, Bolt, and Taxi services
- Displays percentage changes with visual trend indicators

**Technical Implementation:**
- Uses React useEffect hook with setInterval for periodic updates
- Applies random price variations within realistic ranges
- Maintains price boundaries (minimum thresholds) for each service

**User Interaction:**
- Toggle tracking with "Start/Stop Tracking" button
- Real-time visual feedback with price change animations
- Service selection affects alert monitoring focus

### 2. Smart Price Alert System
**Functionality:**
- Users set custom price thresholds for their preferred service
- Automatic notifications when fares drop below target price
- Alert history with timestamps for reference

**Technical Implementation:**
- Continuous price monitoring using useEffect dependency on current fares
- Alert generation with unique IDs and timestamps
- Alert queue management (displays last 5 alerts)

### 3. Historical Price Analysis
**Functionality:**
- Displays price trends throughout the day
- Multi-service comparison on single chart
- Interactive tooltips with detailed price information

**Technical Implementation:**
- Uses Recharts library for responsive line charts
- Mock historical data with realistic peak/off-peak patterns
- Dynamic legend and color coding for each service

### 4. Travel Time Optimization
**Functionality:**
- Analyzes demand patterns and average prices by hour
- Provides top 3 recommended travel times
- Displays demand visualization with bar charts

**Technical Implementation:**
- Pre-calculated peak hours data with demand percentages
- Sorting algorithm to identify lowest-price time slots
- Integrated bar chart showing demand patterns

### 5. Route Management
**Functionality:**
- Customizable pickup and destination locations
- Route information display across all price calculations
- Location-based fare estimation context

**Technical Implementation:**
- Controlled input components with React state management
- Dynamic route display in fare cards and headers
- Location context used in price calculation displays

### 6. Responsive Design System
**Functionality:**
- Mobile-first responsive design
- Adaptive grid layouts for different screen sizes
- Touch-friendly interface elements

**Technical Implementation:**
- Tailwind CSS utility classes for responsive breakpoints
- CSS Grid and Flexbox for flexible layouts
- Optimized component sizing for mobile and desktop

## 🏗️ Technical Architecture

### Frontend Framework
- React 18 with functional components and hooks
- Tailwind CSS for responsive styling and design system
- Recharts for data visualization and charts
- Lucide React for consistent iconography

### State Management
- React useState for component-level state
- useEffect for side effects and real-time updates
- No external state management (Redux/Context) needed for current scope

### Data Flow
- User inputs (route, service, alert price) update component state
- Real-time tracking generates price updates via intervals
- Price changes trigger alert system checks
- Historical data feeds into visualization components
- Recommendations calculated from demand analysis

### Performance Considerations
- Controlled component updates to prevent unnecessary re-renders
- Efficient interval management with proper cleanup
- Responsive chart library with built-in optimization
- Minimal external dependencies for fast loading

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Internet connection for real-time features
- Recommended screen resolution: 768px width or higher

### Usage Instructions
1. Setup Route: Enter your pickup and destination locations
2. Select Service: Choose your preferred transportation option
3. Configure Alerts: Set your desired price threshold
4. Start Tracking: Enable real-time monitoring
5. Monitor & Save: Watch for alerts and use recommendations

### Browser Compatibility
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile browsers on iOS Safari and Chrome Mobile
- Progressive enhancement for older browsers
