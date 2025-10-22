# LMS Admin Dashboard

A fully responsive Admin Dashboard UI built with Next.js (App Router), TypeScript, Tailwind CSS, and ShadCN UI components featuring a beautiful glassmorphism design.

## ✨ Features

- **Glassmorphism Design**: Clean, minimal UI with soft blur effects and transparency
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Collapsible Sidebar**: Smooth animations with mobile-friendly overlay
- **Interactive Charts**: Line and bar charts using Recharts
- **Real-time Statistics**: Dashboard cards with trend indicators
- **Data Tables**: Clean, sortable tables with user information
- **Activity Feed**: Recent activities and notifications
- **Modern UI Components**: Built with ShadCN UI and Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000/admin](http://localhost:3000/admin) in your browser

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6)
- **Secondary**: Green (#10b981) 
- **Accent**: Orange (#f59e0b)
- **Background**: Light gradient with subtle pattern
- **Glass Effects**: Semi-transparent white overlays with backdrop blur

### Glassmorphism Effects
- `bg-card/60` - Semi-transparent card backgrounds
- `backdrop-blur-md` - Blur effects for depth
- `shadow-glass-sm` - Soft shadows for elevation
- `border-border/50` - Subtle borders

## 📁 Project Structure

```
├── app/
│   └── (dashboard)/
│       └── admin/
│           ├── layout.tsx      # Dashboard layout with sidebar
│           └── page.tsx        # Main dashboard page
├── components/
│   └── ui/
│       ├── Sidebar.tsx         # Collapsible navigation sidebar
│       ├── Navbar.tsx          # Top navigation bar
│       ├── StatCard.tsx       # Statistics display cards
│       ├── ChartCard.tsx      # Chart container component
│       ├── DataTable.tsx      # Data table component
│       └── [shadcn components] # Button, Card, Input, etc.
├── config/
│   └── constants.ts           # Data constants and configuration
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   └── utils.ts              # Utility functions
└── tailwind.config.ts        # Tailwind configuration with glassmorphism
```

## 🧩 Components

### Sidebar
- Collapsible navigation with smooth animations
- Active state highlighting
- Mobile-responsive with overlay
- Glassmorphism styling

### Navbar
- Fixed top bar with search functionality
- Notification bell with badge
- User avatar dropdown menu
- Responsive design

### StatCard
- Displays key metrics with trend indicators
- Hover animations
- Glassmorphism styling
- Responsive grid layout

### ChartCard
- Line charts for user growth
- Bar charts for course engagement
- Interactive tooltips
- Responsive design

### DataTable
- User information display
- Status badges
- Avatar integration
- Hover effects

## 📱 Responsive Design

- **Desktop**: Full sidebar with expanded navigation
- **Tablet**: Collapsible sidebar with touch-friendly interactions
- **Mobile**: Overlay sidebar with hamburger menu

## 🎯 Key Features

1. **Dashboard Overview**: Welcome section with key metrics
2. **Statistics Cards**: 4 main KPI cards with trend indicators
3. **Charts Section**: User growth and course engagement visualizations
4. **Activity Feed**: Recent system activities and notifications
5. **Quick Stats**: Additional metrics in a grid layout
6. **User Table**: Recent user registrations with status indicators

## 🔧 Customization

### Colors
Update colors in `tailwind.config.ts`:
```typescript
colors: {
  primary: { DEFAULT: "#3b82f6", foreground: "#ffffff" },
  // ... other colors
}
```

### Glass Effects
Modify glassmorphism intensity in `config/constants.ts`:
```typescript
glassStyles: {
  card: "bg-card/60 backdrop-blur-sm",
  // ... other styles
}
```

### Data
Replace dummy data in `config/constants.ts` with real API data:
```typescript
export const statsData = [
  // Replace with API data
];
```

## 🚀 Future Enhancements

- [ ] Dark mode support
- [ ] Real-time data updates
- [ ] Advanced filtering and search
- [ ] Export functionality
- [ ] More chart types
- [ ] User management features
- [ ] Course management
- [ ] Analytics dashboard

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and ShadCN UI