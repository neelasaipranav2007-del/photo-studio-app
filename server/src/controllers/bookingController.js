const Booking = require('../models/Booking');
const Setting = require('../models/Setting');
const { generateDocumentBuffer } = require('../utils/pdfGenerator');
const { sendEmail } = require('../utils/email');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res) => {
  try {
    const {
      customerName, email, phone, eventDate, eventTime,
      eventType, eventLocation, guestCount, budgetRange,
      specialRequirements, services, totalPrice,
      isContactQuery, neededImprovements
    } = req.body;

    const referenceNumber = `JON-${Math.floor(1000 + Math.random() * 9000)}`;

    const booking = new Booking({
      customerName, email, phone, eventDate, eventTime,
      eventType, eventLocation, guestCount, budgetRange,
      specialRequirements, services, totalPrice, referenceNumber,
      isContactQuery, neededImprovements
    });

    booking.emailsSent.push({
      emailType: 'Confirmation',
      status: 'Sent',
      subject: (isContactQuery || eventType === 'General Inquiry')
        ? `Thank you for contacting Jonathan Studio - Message Ref #${referenceNumber}`
        : `Your Photography Booking Confirmation - By Jonathan Studio`
    });

    const createdBooking = await booking.save();

    let attachments = [];
    if (!isContactQuery && eventType !== 'General Inquiry') {
      try {
        // To safely generate PDF we need to populate services if they aren't fully populated.
        await createdBooking.populate('services', 'title price');

        // Generate PDFs
        const invoicePdfBuffer = await generateDocumentBuffer(createdBooking, 'INVOICE');
        const summaryPdfBuffer = await generateDocumentBuffer(createdBooking, 'BOOKING SUMMARY');

        attachments = [
          { filename: `Invoice_${referenceNumber}.pdf`, content: invoicePdfBuffer },
          { filename: `Summary_${referenceNumber}.pdf`, content: summaryPdfBuffer }
        ];
      } catch (pdfErr) {
        console.error('Error generating booking PDFs:', pdfErr.message);
      }
    }

    // Fetch settings to get notification email and contact info
    let adminEmail = 'admin@jonathanportfolio.com';
    let contactPhone = '+91 98765 43210';
    let contactEmail = '';
    try {
      const settings = await Setting.findOne();
      if (settings) {
        if (settings.notificationEmail) {
          adminEmail = settings.notificationEmail;
        }
        if (settings.contactPhone) {
          contactPhone = settings.contactPhone;
        }
        if (settings.contactEmail) {
          contactEmail = settings.contactEmail;
        }
      }
    } catch (dbErr) {
      console.error('Error fetching settings for booking email:', dbErr.message);
    }

    // Send confirmation emails (wrapped in try-catch to prevent booking creation failure if offline/SMTP fails)
    try {
      if (isContactQuery || eventType === 'General Inquiry') {
        // Send confirmation to customer
        await sendEmail({
          to: email,
          replyTo: contactEmail || undefined,
          subject: `Thank you for contacting Jonathan Studio - Message Ref #${referenceNumber}`,
          text: `Dear ${customerName},\n\nThank you for reaching out to us! We have received your inquiry regarding "${eventType || 'General Inquiry'}".\n\nMessage Reference: ${referenceNumber}\nYour Query:\n"${specialRequirements}"\n\nNeeded Improvements / Suggestions:\n"${neededImprovements || 'None'}"\n\nOur team will review your message and get back to you shortly.\n\nBest Regards,\nBy Jonathan Studio\nPhone: ${contactPhone}`,
          attachments: attachments
        });

        // Send notification to admin
        await sendEmail({
          to: adminEmail,
          replyTo: email,
          subject: `New Contact Inquiry - Event: ${eventType || 'General Inquiry'} - Ref #${referenceNumber}`,
          text: `New contact form submission received.\n\nSender Name: ${customerName}\nSender Email: ${email}\nEvent Interest: ${eventType || 'General Inquiry'}\n\nQuery:\n"${specialRequirements}"\n\nNeeded Improvements / Suggestions:\n"${neededImprovements || 'None'}"\n\nReference: ${referenceNumber}\n\nPlease check the admin dashboard for details.`
        });
      } else {
        // Send confirmation to customer
        await sendEmail({
          to: email,
          replyTo: contactEmail || undefined,
          subject: `Your Photography Booking Confirmation - By Jonathan Studio`,
          text: `Dear ${customerName},\n\nThank you for booking with us! Your booking inquiry has been received.\n\nReference Number: ${referenceNumber}\nEvent Details: ${eventType || 'Photography Service'} on ${new Date(eventDate).toLocaleDateString()}\nEstimated Cost: ₹${totalPrice}\n\nOur team will review your inquiry and contact you shortly to confirm the details.\n\nBest Regards,\nBy Jonathan Studio\nPhone: ${contactPhone}`,
          attachments: attachments
        });

        // Send notification to admin
        await sendEmail({
          to: adminEmail,
          replyTo: email,
          subject: `New Photography Booking Inquiry - Booking ID #${referenceNumber}`,
          text: `New booking inquiry received.\n\nCustomer: ${customerName} (${email} / ${phone})\nEvent: ${eventType || 'Photography Service'} on ${new Date(eventDate).toLocaleDateString()} at ${eventTime}\nLocation: ${eventLocation}\nGuests: ${guestCount}\nSpecial Requirements: ${specialRequirements}\nTotal Estimated: ₹${totalPrice}\nReference: ${referenceNumber}\n\nPlease check the admin dashboard for more details.`
        });
      }
    } catch (emailError) {
      console.error('Failed to send booking emails:', emailError.message);
      // Update email log status to failed
      if (createdBooking.emailsSent && createdBooking.emailsSent.length > 0) {
        createdBooking.emailsSent[0].status = 'Failed (SMTP Timeout)';
        await createdBooking.save();
      }
    }

    res.status(201).json(createdBooking);
  } catch (error) {
    console.error('CREATE BOOKING ERROR:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('services', 'title price').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      booking.status = status;
      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Download Booking Invoice PDF
// @route   GET /api/bookings/:id/invoice
// @access  Private/Admin
const downloadInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('services', 'title price');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.isContactQuery || booking.eventType === 'General Inquiry') {
      return res.status(400).json({ message: 'Invoices are not generated for general contact inquiries.' });
    }

    const pdfBuffer = await generateDocumentBuffer(booking, 'INVOICE');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${booking.referenceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('DOWNLOAD INVOICE ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Send custom email reply to customer
// @route   POST /api/bookings/:id/email-reply
// @access  Private/Admin
const sendEmailReply = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await sendEmail({
      to: booking.email,
      subject: subject || `Regarding your booking inquiry #${booking.referenceNumber}`,
      text: message
    });

    booking.emailsSent.push({
      emailType: 'Reply',
      status: 'Sent',
      subject: subject || `Regarding your booking inquiry #${booking.referenceNumber}`
    });
    
    await booking.save();
    res.json({ message: 'Email sent successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Send invoice email manually to customer
// @route   POST /api/bookings/:id/send-invoice
// @access  Private/Admin
const sendInvoiceEmail = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('services', 'title price');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.isContactQuery || booking.eventType === 'General Inquiry') {
      return res.status(400).json({ message: 'Invoices are not generated for general contact inquiries.' });
    }

    const invoicePdfBuffer = await generateDocumentBuffer(booking, 'INVOICE');
    const attachments = [
      { filename: `Invoice_${booking.referenceNumber}.pdf`, content: invoicePdfBuffer }
    ];

    await sendEmail({
      to: booking.email,
      subject: `Invoice for Booking #${booking.referenceNumber} - By Jonathan Studio`,
      text: `Dear ${booking.customerName},\n\nPlease find attached the invoice for your photography booking #${booking.referenceNumber}.\n\nTotal Price: ₹${booking.totalPrice}\n\nBest Regards,\nBy Jonathan Studio`,
      attachments
    });

    booking.emailsSent.push({
      emailType: 'Invoice',
      status: 'Sent',
      subject: `Invoice for Booking #${booking.referenceNumber} - By Jonathan Studio`
    });

    await booking.save();
    res.json({ message: 'Invoice email sent successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Send quotation email manually to customer
// @route   POST /api/bookings/:id/send-quotation
// @access  Private/Admin
const sendQuotationEmail = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('services', 'title price');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.isContactQuery || booking.eventType === 'General Inquiry') {
      return res.status(400).json({ message: 'Quotations are not generated for general contact inquiries.' });
    }

    const quotationPdfBuffer = await generateDocumentBuffer(booking, 'QUOTATION');
    const attachments = [
      { filename: `Quotation_${booking.referenceNumber}.pdf`, content: quotationPdfBuffer }
    ];

    await sendEmail({
      to: booking.email,
      subject: `Quotation for Services - Booking #${booking.referenceNumber}`,
      text: `Dear ${booking.customerName},\n\nPlease find attached the quotation summary for your booking inquiry #${booking.referenceNumber}.\n\nTotal Estimated Amount: ₹${booking.totalPrice}\n\nIf you have any questions, feel free to reply to this email.\n\nBest Regards,\nBy Jonathan Studio`,
      attachments
    });

    booking.emailsSent.push({
      emailType: 'Quotation',
      status: 'Sent',
      subject: `Quotation for Services - Booking #${booking.referenceNumber}`
    });

    await booking.save();
    res.json({ message: 'Quotation email sent successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Cancel booking by reference number (Public)
// @route   PUT /api/bookings/cancel-by-ref/:ref
// @access  Public
const cancelBookingByRef = async (req, res) => {
  try {
    const booking = await Booking.findOne({ referenceNumber: req.params.ref });
    if (!booking) {
      return res.status(404).json({ message: 'Booking reference not found.' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    booking.status = 'Cancelled';
    
    booking.emailsSent.push({
      emailType: 'Cancellation',
      status: 'Sent',
      subject: `Booking Cancellation Confirmation - Ref #${booking.referenceNumber}`
    });

    const updatedBooking = await booking.save();

    // Fetch settings to get dynamic emails
    let adminEmail = 'admin@jonathanportfolio.com';
    let contactPhone = '+91 98765 43210';
    try {
      const settings = await Setting.findOne();
      if (settings) {
        if (settings.notificationEmail) adminEmail = settings.notificationEmail;
        if (settings.contactPhone) contactPhone = settings.contactPhone;
      }
    } catch (dbErr) {
      console.error(dbErr);
    }

    // Send emails
    try {
      await sendEmail({
        to: booking.email,
        subject: `Booking Cancellation Confirmation - Ref #${booking.referenceNumber}`,
        text: `Dear ${booking.customerName},\n\nThis is to confirm that your booking inquiry Ref #${booking.referenceNumber} has been successfully cancelled as requested.\n\nIf this was a mistake or you wish to schedule a new shoot, please visit our booking portal or contact us at ${contactPhone}.\n\nBest Regards,\nBy Jonathan Studio`
      });

      await sendEmail({
        to: adminEmail,
        replyTo: booking.email,
        subject: `Booking Inquiry Cancelled - Ref #${booking.referenceNumber}`,
        text: `The following booking inquiry has been cancelled by the customer.\n\nCustomer: ${booking.customerName} (${booking.email})\nReference: ${booking.referenceNumber}\nEvent Type: ${booking.eventType || 'Photography Service'}\n\nPlease check the admin dashboard for details.`
      });
    } catch (emailError) {
      console.error('Failed to send cancellation emails:', emailError.message);
    }

    res.json({ message: 'Booking cancelled successfully', booking: updatedBooking });
  } catch (error) {
    console.error('CANCEL BOOKING BY REF ERROR:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { 
  createBooking, 
  getBookings, 
  updateBookingStatus, 
  downloadInvoice,
  sendEmailReply,
  sendInvoiceEmail,
  sendQuotationEmail,
  cancelBookingByRef
};

