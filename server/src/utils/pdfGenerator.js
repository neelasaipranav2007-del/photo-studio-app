const PDFDocument = require('pdfkit');

const generateDocumentBuffer = (booking, docType = 'INVOICE') => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fillColor('#333333')
         .fontSize(28)
         .text('By Jonathan Studio', 50, 50);
         
      doc.fontSize(10)
         .text('123 Luxury Lane', 50, 85)
         .text('Hyderabad, India 500081', 50, 100)
         .text('hello@jonathanportfolio.com', 50, 115)
         .text('+91 98765 43210', 50, 130);

      // Document Title
      doc.fillColor('#d4af37')
         .fontSize(20)
         .text(docType, 50, 160, { align: 'right' });

      doc.fillColor('#333333')
         .fontSize(10)
         .text(`Date: ${new Date().toLocaleDateString()}`, 50, 190, { align: 'right' })
         .text(`Reference: ${booking.referenceNumber}`, 50, 205, { align: 'right' });

      doc.moveDown();

      // Customer Info
      doc.fontSize(14).fillColor('#000000').text('Customer Details', 50, 240);
      doc.fontSize(10).fillColor('#333333')
         .text(`Name: ${booking.customerName}`, 50, 260)
         .text(`Email: ${booking.email}`, 50, 275)
         .text(`Phone: ${booking.phone}`, 50, 290);

      // Event Info
      doc.fontSize(14).fillColor('#000000').text('Event Details', 300, 240);
      doc.fontSize(10).fillColor('#333333')
         .text(`Type: ${booking.eventType || 'N/A'}`, 300, 260)
         .text(`Date: ${new Date(booking.eventDate).toLocaleDateString()}`, 300, 275)
         .text(`Time: ${booking.eventTime}`, 300, 290)
         .text(`Location: ${booking.eventLocation}`, 300, 305)
         .text(`Guests: ${booking.guestCount || 'N/A'}`, 300, 320);

      // Table Header
      let y = 370;
      doc.lineWidth(1).moveTo(50, y).lineTo(550, y).strokeColor('#dddddd').stroke();
      y += 10;
      doc.fontSize(10).fillColor('#000000').text('SERVICE', 50, y);
      doc.text('PRICE', 450, y, { width: 100, align: 'right' });
      y += 20;
      doc.lineWidth(1).moveTo(50, y).lineTo(550, y).strokeColor('#dddddd').stroke();
      y += 15;

      // Services List
      booking.services.forEach(service => {
        doc.fillColor('#333333').text(service.title, 50, y);
        doc.text(`Rs. ${service.price.toLocaleString('en-IN')}`, 450, y, { width: 100, align: 'right' });
        y += 25;
      });

      doc.lineWidth(1).moveTo(50, y).lineTo(550, y).strokeColor('#dddddd').stroke();
      y += 20;

      // Total
      doc.fontSize(14).fillColor('#000000').text('TOTAL AMOUNT', 300, y);
      doc.text(`Rs. ${booking.totalPrice.toLocaleString('en-IN')}`, 450, y, { width: 100, align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateDocumentBuffer };
