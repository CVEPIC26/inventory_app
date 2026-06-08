# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Operator Dashboard
- **New Operator Dashboard Page** - Built comprehensive operator dashboard following wireframe from `operator-dashboard.md`
  - Operator Header: Avatar, name, date, sync status
  - Progress Cards: Tasks completed, items counted, variance found
  - Task Hari Ini: List of assigned tasks with priority, status, and action buttons
  - Opname Aktif: Active opname card with progress bar and continue scan button

- **Role-Based Dashboard Display**
  - Non-admin users see operator dashboard when selecting Stok Opname
  - Admin users see full opname tab with all features

- **Operator Functions** - Added JavaScript functions for operator dashboard interactions
  - `loadOperatorDashboard()` - Initialize operator dashboard on menu selection
  - `populateMockOperatorProgress()` - Load progress data
  - `startTask()`, `continueTask()`, `viewTask()` - Task action handlers
  - `continueOpname()` - Continue to opname scan mode
  - `navigateToOperatorSection()` - Navigation helper

#### Admin Dashboard
- **New Admin Dashboard Page** - Built comprehensive admin dashboard following wireframe from `admin-dashboard.md`
  - KPI Cards: Total Stock, Stock Alert, Pending Opname, Pending Approval
  - Warehouse Health Panel: Health score, stock availability, restock risk, opname variance, data integrity indicators
  - Pending Approvals Panel: List of pending approvals with priority, requester, age, and review action
  - Recent Activity Timeline: Filterable activity log showing latest stock movements, opnames, approvals, and audits
  - Refresh button to reload dashboard data

- **Admin Menu Item** - Added Admin Panel menu item in sidebar (only visible for admin role)
  - Role-based visibility (hidden for non-admin users)
  - Icon and styling consistent with app theme

- **Navigation Functions** - Added JavaScript functions for admin dashboard interactions
  - `loadAdminDashboard()` - Initialize admin dashboard on menu selection
  - `refreshAdminDashboard()` - Refresh KPI data
  - `navigateToAdminSection()` - Navigate to related menu sections
  - `filterRecentActivity()` - Filter activity timeline by type

### Changed

#### Sidebar Redesign
- **Enhanced Brand Section**
  - New `sidebar-brand` component with gradient accent at top
  - Improved logo display with rounded corners and background
  - Better typography hierarchy (tag and title)
  - More compact and modern design

- **Section Labels**
  - Added "Menu Utama" section for main navigation (Dashboard, Admin)
  - Added "Operasional" section for operational modules (Persediaan, Forecasting, Stok Opname)
  - Visual divider between sections

- **Improved Navigation Items**
  - Added left border accent on hover (gradient from primary to accent color)
  - Better active state with subtle glow effect
  - Larger icons (20px) for better visibility
  - Better spacing and border-radius

- **Sidebar Footer**
  - Added version info footer with info icon
  - Subtle styling to not distract from main navigation

- **Responsive Improvements**
  - Better mobile adaptation with proper flex layout
  - Adjusted brand and menu item sizing for mobile
  - Improved touch targets

#### Header Redesign
- **Enhanced Brand Section**
  - Added gradient accent bar for visual distinction
  - Improved typography with better spacing and letter-spacing
  - Better visual hierarchy with subtle background styling

- **Improved User Info Display**
  - New avatar with initial letter fallback (displays first letter of username)
  - Display full username and role badge
  - Role indicator with color-coded badges (Admin in red, User in green)
  - Improved hover effects on user info card

- **Better Action Buttons**
  - Redesigned login button with gradient background matching app theme
  - Improved logout button with subtle styling
  - Added icons to both buttons (log-in, log-out from Lucide icons)
  - Better hover animations and transitions

- **Responsive Improvements**
  - Better mobile adaptation (hides text on small screens, keeps icons)
  - Improved breakpoint handling at 860px and 640px
  - Adjusted container margin-top for new header height

- **Visual Polish**
  - Added backdrop blur effect
  - Improved border and shadow styling
  - Better color consistency with app theme
  - Smooth transitions on all interactive elements

### Files Changed
- `css/style.css` - Updated sidebar and header styles; Added admin and operator dashboard styles
- `index.html` - Updated sidebar HTML structure; Added admin and operator dashboard sections; Updated auth state JavaScript
- `js/dashboard.js` - Added admin and operator dashboard functions; Updated menu handling for role-based dashboard
- `CHANGELOG.md` - Documented all changes