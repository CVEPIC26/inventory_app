# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
- `css/style.css` - Updated header and related component styles; Added admin dashboard styles
- `index.html` - Updated header HTML structure, added admin dashboard section, updated auth state JavaScript
- `js/dashboard.js` - Added admin dashboard functions, updated menu handling for admin role
- `CHANGELOG.md` - Documented all changes