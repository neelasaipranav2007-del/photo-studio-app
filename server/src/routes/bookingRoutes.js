const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getBookings, 
  updateBookingStatus, 
  downloadInvoice,
  sendEmailReply,
  sendInvoiceEmail,
  sendQuotationEmail,
  cancelBookingByRef
} = require('../controllers/bookingController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
  .post(createBooking)
  .get(protect, admin, getBookings);

router.route('/:id/status')
  .put(protect, admin, updateBookingStatus);

router.route('/:id/invoice')
  .get(protect, admin, downloadInvoice);

router.route('/:id/email-reply')
  .post(protect, admin, sendEmailReply);

router.route('/:id/send-invoice')
  .post(protect, admin, sendInvoiceEmail);

router.route('/:id/send-quotation')
  .post(protect, admin, sendQuotationEmail);

// Public route — customers cancel by reference number
router.route('/cancel-by-ref/:ref')
  .put(cancelBookingByRef);

module.exports = router;
