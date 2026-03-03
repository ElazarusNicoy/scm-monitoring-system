# SCM Monitoring System - Workflow Tracking Module

A comprehensive web-based monitoring system for tracking supply chain management transactions, approval workflows, and aging alerts.

## Overview

The Workflow Tracking Module is the first module of the SCM Monitoring System, designed to help organizations monitor transaction statuses, track approval stages, and identify aging transactions that require attention.

## Features

### 📊 Dashboard Summary
- **Active Transactions**: Real-time count of ongoing transactions
- **Completed Transactions**: Total completed transactions
- **Aging Transactions**: Transactions requiring attention (4+ days)
- **Critical Alerts**: High-priority aging transactions (8+ days)

### 🔍 Advanced Filtering & Search
- **Search**: Find transactions by ID, Vendor, or PO Number
- **Status Filter**: Filter by Active, Completed, Pending, or Rejected
- **Aging Filter**: Filter by Normal (0-3 days), Warning (4-7 days), or Critical (8+ days)
- **Stage Filter**: Filter by workflow stage (Submission, Review, Approval, Processing, Completed)

### 📋 Dual View Modes
1. **Table View**: Comprehensive tabular display with all transaction details
2. **Card View**: Visual card-based layout for easier scanning

### 🔄 Workflow Tracking
- Visual timeline showing transaction progress through stages:
  - Submission
  - Review
  - Approval
  - Processing
  - Completed
- Color-coded status indicators (Green: Completed, Orange: Current, Blue: Pending)
- User and timestamp tracking for each stage

### ⚠️ Aging Monitoring
- **Normal (0-3 days)**: Green indicator
- **Warning (4-7 days)**: Orange indicator
- **Critical (8+ days)**: Red indicator with pulse animation

### 🎯 Priority Management
- **Low Priority**: Green badge with down arrow
- **Medium Priority**: Orange badge with minus icon
- **High Priority**: Red badge with up arrow

### 📱 Responsive Design
- Fully responsive layout that works on desktop, tablet, and mobile devices
- Adaptive grid system for optimal viewing on any screen size

## File Structure

```
scm-monitoring-system/
├── workflow-tracking.html    # Main HTML structure
├── styles.css                # Complete styling and animations
├── script.js                 # JavaScript functionality and data management
├── analysis-planning.txt     # Project analysis and planning document
├── designing.txt             # Design specifications
└── README.md                 # This file
```

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with flexbox, grid, animations, and transitions
- **JavaScript (ES6+)**: Dynamic functionality and data management
- **Font Awesome 6.4.0**: Icon library (via CDN)

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server or build tools required - runs directly in the browser

### Installation

1. Clone or download the repository to your local machine
2. Navigate to the project directory
3. Open `workflow-tracking.html` in your web browser

```bash
# If using a local server (optional)
# Navigate to the project directory and run:
python -m http.server 8000
# Then open http://localhost:8000/workflow-tracking.html
```

### Usage

1. **View Dashboard**: The dashboard displays summary cards with key metrics
2. **Search Transactions**: Use the search box to find specific transactions
3. **Apply Filters**: Use dropdown filters to narrow down results
4. **Switch Views**: Toggle between Table View and Card View
5. **View Details**: Click "View" or "View Details" button to see complete transaction information
6. **Monitor Workflow**: Check the workflow timeline in the detail modal to track progress
7. **Refresh Data**: Click the Refresh button to update the display

## Key Features Explained

### Transaction Status Badges
- **ACTIVE**: Blue badge - Transaction is in progress
- **COMPLETED**: Green badge - Transaction finished successfully
- **PENDING**: Orange badge - Awaiting action
- **REJECTED**: Red badge - Transaction was rejected

### Aging Indicators
The system automatically calculates aging based on the submission date:
- Transactions are color-coded based on how long they've been in the system
- Critical aging transactions (8+ days) have a pulsing animation to draw attention

### Workflow Timeline
Each transaction has a detailed workflow timeline showing:
- All stages of the approval process
- Completion dates and responsible users
- Current stage with visual indicator
- Pending stages

### Pagination
- Displays 10 transactions per page
- Easy navigation with Previous/Next buttons
- Current page indicator

## Sample Data

The system includes 8 sample transactions demonstrating various scenarios:
- Different transaction amounts ($89,500 - $675,000)
- Various workflow stages
- Different aging periods (1-15 days)
- Multiple status types
- Different priority levels

## Customization

### Adding New Transactions
Edit the `sampleTransactions` array in [`script.js`](script.js:3) to add or modify transactions.

### Changing Colors
Modify the CSS variables in [`styles.css`](styles.css:9) to customize the color scheme:
```css
:root {
    --primary-color: #2563eb;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    /* ... more variables */
}
```

### Adjusting Aging Thresholds
Modify the aging logic in the `getAgingClass()` function in [`script.js`](script.js:445):
```javascript
function getAgingClass(days) {
    if (days <= 3) return 'normal';
    if (days <= 7) return 'warning';
    return 'critical';
}
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Future Enhancements

Planned features for future releases:
- Real-time data integration with backend API
- Export functionality (PDF, Excel)
- Email notifications for aging transactions
- Advanced analytics and reporting
- User authentication and role-based access
- Additional modules (Alerts, Reports, Analytics)
- Mobile app version

## Performance

- Lightweight and fast loading
- Efficient DOM manipulation
- Smooth animations and transitions
- Optimized for large datasets with pagination

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast color scheme
- Clear visual indicators

## License

This project is part of the SCM Monitoring System. All rights reserved.

## Support

For questions or issues, please contact the development team.

## Version History

- **v1.0.0** (March 2024) - Initial release with Workflow Tracking Module
  - Dashboard summary cards
  - Transaction list with table and card views
  - Advanced filtering and search
  - Workflow timeline visualization
  - Aging monitoring with color-coded indicators
  - Responsive design

---

**Note**: This is the first module of the complete SCM Monitoring System. Additional modules (Alerts, Reports, Analytics) will be added in future releases.
