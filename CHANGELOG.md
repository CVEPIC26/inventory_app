# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- `css/style.css` - Updated header and related component styles
- `index.html` - Updated header HTML structure and auth state JavaScript