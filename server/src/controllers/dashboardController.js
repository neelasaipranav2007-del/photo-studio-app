const Booking = require('../models/Booking');
const Gallery = require('../models/Gallery');
const Service = require('../models/Service');

// @desc    Get dashboard metrics & analytics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalImages = await Gallery.countDocuments({});
    const totalServices = await Service.countDocuments({});
    const bookings = await Booking.find({}).populate('services', 'title price');
    let totalBookings = 0;
    let totalQueries = 0;

    // Calculate booking statuses
    const statuses = {
      'New Inquiry': 0,
      'Reviewed': 0,
      'Contacted': 0,
      'Confirmed': 0,
      'Completed': 0,
      'Cancelled': 0
    };

    let totalRevenue = 0;
    const monthlyStatsMap = {};

    bookings.forEach(b => {
      if (b.isContactQuery) {
        totalQueries++;
      } else {
        totalBookings++;
        // Increment status counts
        if (statuses[b.status] !== undefined) {
          statuses[b.status]++;
        }

        // Add to total revenue if confirmed or completed
        if (b.status === 'Confirmed' || b.status === 'Completed') {
          totalRevenue += b.totalPrice || 0;
        }

        // Monthly aggregation
        const date = new Date(b.eventDate);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' }); // E.g. "Jun 2026"
        
        if (!monthlyStatsMap[monthYear]) {
          monthlyStatsMap[monthYear] = { bookings: 0, revenue: 0 };
        }
        
        monthlyStatsMap[monthYear].bookings++;
        if (b.status === 'Confirmed' || b.status === 'Completed') {
          monthlyStatsMap[monthYear].revenue += b.totalPrice || 0;
        }
      }
    });

    // Convert monthly map to sorted array (last 6 months)
    const monthOrder = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const my = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthOrder.push(my);
    }

    const monthlyStats = monthOrder.map(month => {
      const stats = monthlyStatsMap[month] || { bookings: 0, revenue: 0 };
      return {
        month,
        bookings: stats.bookings,
        revenue: stats.revenue
      };
    });

    // Recent Inquiries (last 5 bookings)
    const recentInquiries = await Booking.find({ isContactQuery: { $ne: true } })
      .populate('services', 'title price')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent Activities (combine recent bookings & custom email replies)
    const recentActivities = [];
    
    // Get recent bookings
    recentInquiries.forEach(b => {
      recentActivities.push({
        type: 'booking',
        message: `New booking inquiry #${b.referenceNumber} by ${b.customerName}`,
        time: b.createdAt,
        reference: b._id
      });
    });

    // Get email logs
    bookings.forEach(b => {
      if (b.emailsSent && b.emailsSent.length > 0) {
        b.emailsSent.forEach(email => {
          recentActivities.push({
            type: 'email',
            message: `Email [${email.emailType}] sent to ${b.customerName} - "${email.subject}"`,
            time: email.dateSent,
            reference: b._id
          });
        });
      }
    });

    // Sort recent activities by time desc
    recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      metrics: {
        totalImages,
        totalServices,
        totalBookings,
        totalQueries,
        totalRevenue,
        pendingBookings: statuses['New Inquiry'] + statuses['Reviewed'] + statuses['Contacted'],
        confirmedBookings: statuses['Confirmed'],
        completedBookings: statuses['Completed']
      },
      statusDistribution: statuses,
      monthlyAnalytics: monthlyStats,
      recentInquiries,
      recentActivities: recentActivities.slice(0, 8) // Limit to 8 activities
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats
};
