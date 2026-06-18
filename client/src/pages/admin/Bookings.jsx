import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiEye, FiDownload, FiFileText, FiMail, FiPrinter, FiPlusCircle, FiList, FiClock } from 'react-icons/fi';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { AuthContext } from '../../context/AuthContext';

const Bookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modals state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [replyModal, setReplyModal] = useState(null); // stores booking object when active
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchBookings = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get('/api/bookings', config);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings', error);
    }
  };

  useEffect(() => {
    if (user?.token) fetchBookings();
  }, [user]);

  const updateStatus = async (id, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`/api/bookings/${id}/status`, { status: newStatus }, config);
      setBookings(bookings.map(b => b._id === id ? { ...b, status: newStatus } : b));
      if (selectedBooking && selectedBooking._id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status', error);
      alert('Failed to update status.');
    }
  };

  const downloadInvoice = async (id, refNum) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` }, responseType: 'blob' };
      const { data } = await axios.get(`/api/bookings/${id}/invoice`, config);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${refNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading invoice', error);
      alert('Failed to download invoice PDF.');
    }
  };

  const handleSendInvoice = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post(`/api/bookings/${id}/send-invoice`, {}, config);
      alert('Invoice email sent to client successfully!');
      fetchBookings();
      // Update selected booking detail to reflect email log
      const updated = bookings.find(b => b._id === id);
      if (updated) setSelectedBooking(updated);
    } catch (err) {
      console.error(err);
      alert('Failed to send invoice email.');
    }
  };

  const handleSendQuotation = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post(`/api/bookings/${id}/send-quotation`, {}, config);
      alert('Quotation email sent to client successfully!');
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('Failed to send quotation email.');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyModal) return;
    setSendingEmail(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post(`/api/bookings/${replyModal._id}/email-reply`, {
        subject: emailSubject,
        message: emailMessage
      }, config);

      alert('Reply email sent successfully!');
      setReplyModal(null);
      setEmailSubject('');
      setEmailMessage('');
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert('Failed to send reply email.');
    } finally {
      setSendingEmail(false);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredBookings.map(b => ({
      'Booking Ref': b.referenceNumber,
      'Customer Name': b.customerName,
      'Email': b.email,
      'Phone': b.phone,
      'Event Type': b.eventType,
      'Event Date': new Date(b.eventDate).toLocaleDateString(),
      'Location': b.eventLocation,
      'Total Price (Rs)': b.totalPrice,
      'Status': b.status
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, "Bookings_Report.xlsx");
  };

  const exportToCSV = () => {
    const headers = ['Booking Ref,Customer Name,Email,Phone,Event Type,Event Date,Location,Total Price,Status\n'];
    const rows = filteredBookings.map(b => 
      `"${b.referenceNumber}","${b.customerName}","${b.email}","${b.phone}","${b.eventType}","${new Date(b.eventDate).toLocaleDateString()}","${b.eventLocation}",${b.totalPrice},"${b.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows.join('\n')).join('');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Bookings_Report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const printBookingDetails = (b) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Summary #${b.referenceNumber}</title>
          <style>
            body { font-family: 'Georgia', serif; padding: 40px; color: #333; }
            h1 { border-bottom: 2px solid #d4af37; padding-bottom: 10px; color: #111; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f9f9f9; font-weight: bold; }
            .total { font-size: 1.2em; font-weight: bold; text-align: right; margin-top: 30px; color: #d4af37; }
          </style>
        </head>
        <body>
          <h1>By Jonathan Studio - ${b.eventType === 'General Inquiry' ? 'Contact Message Details' : 'Booking Details'}</h1>
          <p><strong>Reference Number:</strong> ${b.referenceNumber}</p>
          <p><strong>Status:</strong> ${b.status}</p>
          
          <h2>Customer Details</h2>
          <p><strong>Name:</strong> ${b.customerName}</p>
          <p><strong>Email:</strong> ${b.email}</p>
          <p><strong>Phone:</strong> ${b.phone}</p>
          
          <h2>Inquiry / Message Details</h2>
          <p><strong>Type:</strong> ${b.eventType}</p>
          <p><strong>Date Received:</strong> ${new Date(b.createdAt || b.eventDate).toLocaleDateString()}</p>
          ${b.eventType !== 'General Inquiry' ? `<p><strong>Event Time:</strong> ${b.eventTime || 'N/A'}</p>` : ''}
          ${b.eventType !== 'General Inquiry' ? `<p><strong>Location:</strong> ${b.eventLocation}</p>` : ''}
          ${b.eventType !== 'General Inquiry' ? `<p><strong>Guest Count:</strong> ${b.guestCount || 'N/A'}</p>` : ''}
          <p><strong>Message / Special Requirements:</strong> ${b.specialRequirements || 'None'}</p>
          
          ${b.eventType !== 'General Inquiry' && b.services && b.services.length > 0 ? `
          <h2>Selected Services</h2>
          <table>
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${b.services.map(s => `<tr><td>${s.title}</td><td>₹${s.price.toLocaleString('en-IN')}</td></tr>`).join('')}
            </tbody>
          </table>
          
          <div class="total">Total Estimated Price: ₹${b.totalPrice.toLocaleString('en-IN')}</div>
          ` : ''}
          
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredBookings = bookings.filter(b => {
    if (b.isContactQuery) return false;
    const matchesSearch = b.customerName?.toLowerCase()?.includes(searchTerm.toLowerCase()) || 
                          b.referenceNumber?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
                          b.eventType?.toLowerCase()?.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-white tracking-wide">Manage Bookings</h2>
          <p className="text-sm text-gray-400">View customer inquiries, invoice details & send emails</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search ref, customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/50 border border-white/10 text-white px-4 py-2 rounded focus:outline-none focus:border-luxury-gold w-full md:w-48"
          />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black/50 border border-white/10 text-white px-4 py-2 rounded focus:outline-none focus:border-luxury-gold appearance-none"
          >
            <option value="All">All Statuses</option>
            <option value="New Inquiry">New Inquiry</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Contacted">Contacted</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button 
            onClick={exportToExcel}
            className="flex items-center space-x-2 bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/40 px-4 py-2 rounded hover:bg-luxury-gold hover:text-black transition-colors whitespace-nowrap text-sm"
          >
            <FiDownload />
            <span>Excel</span>
          </button>
          <button 
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/40 px-4 py-2 rounded hover:bg-luxury-gold hover:text-black transition-colors whitespace-nowrap text-sm"
          >
            <FiDownload />
            <span>CSV</span>
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass rounded-lg border border-white/10 overflow-hidden"
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/40 border-b border-white/10 text-xs uppercase tracking-widest text-gray-400">
              <th className="p-4 font-normal">Customer</th>
              <th className="p-4 font-normal">Event Type</th>
              <th className="p-4 font-normal">Date</th>
              <th className="p-4 font-normal">Total (₹)</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-white">
                  <div className="font-semibold">{booking.customerName}</div>
                  <div className="text-xs text-gray-500">{booking.referenceNumber}</div>
                </td>
                <td className="p-4 text-gray-300">{booking.eventType}</td>
                <td className="p-4 text-gray-300">{new Date(booking.eventDate).toLocaleDateString()}</td>
                <td className="p-4 text-luxury-gold font-semibold">₹{booking.totalPrice?.toLocaleString('en-IN')}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 text-xs rounded-full border ${
                    booking.status === 'Confirmed' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                    booking.status === 'New Inquiry' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                    booking.status === 'Reviewed' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                    booking.status === 'Contacted' ? 'border-indigo-500/50 text-indigo-400 bg-indigo-500/10' :
                    booking.status === 'Completed' ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' :
                    'border-gray-500/50 text-gray-400 bg-gray-500/10'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end space-x-1">
                  <button title="View Details" onClick={() => setSelectedBooking(booking)} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-all"><FiEye /></button>
                  {booking.eventType !== 'General Inquiry' ? (
                    <button title="Download Invoice" onClick={() => downloadInvoice(booking._id, booking.referenceNumber)} className="p-2 text-luxury-gold hover:text-white hover:bg-white/5 rounded transition-all"><FiFileText /></button>
                  ) : (
                    <span className="p-2 text-gray-600 cursor-not-allowed" title="No Invoice for Inquiries"><FiFileText /></span>
                  )}
                  <button title="Send Custom Email" onClick={() => setReplyModal(booking)} className="p-2 text-blue-400 hover:text-white hover:bg-white/5 rounded transition-all"><FiMail /></button>
                  
                  {booking.status === 'New Inquiry' && (
                    <button title="Mark Reviewed" onClick={() => updateStatus(booking._id, 'Reviewed')} className="px-2 text-xs text-blue-400 hover:bg-blue-500/10 border border-blue-500/30 rounded uppercase">Reviewed</button>
                  )}
                  {booking.status === 'Reviewed' && (
                    <button title="Mark Contacted" onClick={() => updateStatus(booking._id, 'Contacted')} className="px-2 text-xs text-indigo-400 hover:bg-indigo-500/10 border border-indigo-500/30 rounded uppercase">Contact</button>
                  )}
                  {booking.status !== 'Confirmed' && booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
                    <button title="Confirm Booking" onClick={() => updateStatus(booking._id, 'Confirmed')} className="p-2 text-green-400 hover:text-white hover:bg-white/5 rounded transition-all"><FiCheck /></button>
                  )}
                  {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                    <button title="Cancel Booking" onClick={() => updateStatus(booking._id, 'Cancelled')} className="p-2 text-red-400 hover:text-white hover:bg-white/5 rounded transition-all"><FiX /></button>
                  )}
                </td>
              </tr>
            ))}
            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">No bookings matching criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* VIEW DETAILS MODAL */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass border border-white/10 p-8 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto text-white relative space-y-6"
            >
              <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white text-xl">
                <FiX />
              </button>

              <div className="border-b border-white/10 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-serif text-white uppercase tracking-widest">{selectedBooking.customerName}</h3>
                    <p className="text-luxury-gold text-sm font-mono mt-1">Ref: {selectedBooking.referenceNumber}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full border ${
                    selectedBooking.status === 'Confirmed' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                    selectedBooking.status === 'New Inquiry' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                    'border-gray-500/50 text-gray-400 bg-gray-500/10'
                  }`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              {/* Booking & Event Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
                <div className="space-y-3">
                  <h4 className="text-luxury-gold font-serif text-base border-b border-white/5 pb-1">Contact Info</h4>
                  <p><strong>Email:</strong> {selectedBooking.email}</p>
                  <p><strong>Phone:</strong> {selectedBooking.phone}</p>
                  <p><strong>Budget Range:</strong> {selectedBooking.budgetRange || 'N/A'}</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-luxury-gold font-serif text-base border-b border-white/5 pb-1">Event Details</h4>
                  <p><strong>Event Type:</strong> {selectedBooking.eventType}</p>
                  <p><strong>Date:</strong> {new Date(selectedBooking.eventDate).toLocaleDateString()} at {selectedBooking.eventTime || 'N/A'}</p>
                  <p><strong>Location:</strong> {selectedBooking.eventLocation}</p>
                  <p><strong>Guests:</strong> {selectedBooking.guestCount || 'N/A'}</p>
                </div>
              </div>

              {selectedBooking.specialRequirements && (
                <div className="text-sm bg-black/40 border border-white/5 p-4 rounded text-gray-300">
                  <h4 className="font-semibold text-white mb-2">Special Requirements / Notes:</h4>
                  <p className="font-light italic">{selectedBooking.specialRequirements}</p>
                </div>
              )}

              {selectedBooking.neededImprovements && (
                <div className="text-sm bg-black/40 border border-white/5 p-4 rounded text-gray-300">
                  <h4 className="font-semibold text-white mb-2">💡 Suggestions / Improvements Needed:</h4>
                  <p className="font-light italic">{selectedBooking.neededImprovements}</p>
                </div>
              )}

              {/* Selected Services & Price */}
              {selectedBooking.eventType !== 'General Inquiry' && (
                <div className="space-y-3">
                  <h4 className="text-luxury-gold font-serif text-base border-b border-white/5 pb-1">Selected Services Package</h4>
                  <div className="space-y-2">
                    {selectedBooking.services && selectedBooking.services.map((s, idx) => (
                      <div key={idx} className="flex justify-between text-sm bg-white/5 px-4 py-2 rounded">
                        <span className="text-white font-medium">{s.title}</span>
                        <span className="text-luxury-gold">₹{s.price.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-base pt-3 border-t border-white/10 px-4">
                      <span className="font-serif uppercase tracking-widest text-white">Estimated Amount</span>
                      <span className="text-luxury-gold font-bold text-xl">₹{selectedBooking.totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Communications Log */}
              <div className="space-y-3">
                <h4 className="text-luxury-gold font-serif text-base border-b border-white/5 pb-1 flex items-center">
                  <FiClock className="mr-2" /> Communications History
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {selectedBooking.emailsSent && selectedBooking.emailsSent.map((mail, idx) => (
                    <div key={idx} className="flex items-start justify-between text-xs bg-black/30 border border-white/5 p-3 rounded">
                      <div>
                        <span className="px-2 py-0.5 mr-2 rounded text-[10px] bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30">
                          {mail.emailType}
                        </span>
                        <span className="text-gray-300 font-light">{mail.subject}</span>
                      </div>
                      <span className="text-gray-500 font-mono">
                        {new Date(mail.dateSent).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {(!selectedBooking.emailsSent || selectedBooking.emailsSent.length === 0) && (
                    <div className="text-center py-4 text-gray-500 text-xs italic">No email logs found.</div>
                  )}
                </div>
              </div>

              {/* Manual Communication and Status controls */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                <button onClick={() => printBookingDetails(selectedBooking)} className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded text-sm transition-all">
                  <FiPrinter /> <span>Print Summary</span>
                </button>
                {selectedBooking.eventType !== 'General Inquiry' && (
                  <>
                    <button onClick={() => downloadInvoice(selectedBooking._id, selectedBooking.referenceNumber)} className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded text-sm transition-all">
                      <FiFileText /> <span>Download Invoice PDF</span>
                    </button>
                    <button onClick={() => handleSendInvoice(selectedBooking._id)} className="flex items-center space-x-2 bg-luxury-gold/20 hover:bg-luxury-gold text-luxury-gold hover:text-black border border-luxury-gold/30 px-4 py-2 rounded text-sm transition-all">
                      <FiMail /> <span>Email Invoice PDF</span>
                    </button>
                    <button onClick={() => handleSendQuotation(selectedBooking._id)} className="flex items-center space-x-2 bg-luxury-gold/20 hover:bg-luxury-gold text-luxury-gold hover:text-black border border-luxury-gold/30 px-4 py-2 rounded text-sm transition-all">
                      <FiMail /> <span>Email Quotation PDF</span>
                    </button>
                  </>
                )}
                
                <div className="flex-1"></div>

                {selectedBooking.status === 'Confirmed' && (
                  <button onClick={() => updateStatus(selectedBooking._id, 'Completed')} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded text-sm font-semibold transition-all">
                    Complete Event
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SEND CUSTOM EMAIL REPLY MODAL */}
      <AnimatePresence>
        {replyModal && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass border border-white/10 p-8 rounded-lg w-full max-w-lg text-white relative space-y-6"
            >
              <button onClick={() => setReplyModal(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white text-xl">
                <FiX />
              </button>

              <div>
                <h3 className="text-xl font-serif text-white uppercase tracking-widest">Send Email to Client</h3>
                <p className="text-xs text-gray-400 mt-1">To: {replyModal.customerName} &lt;{replyModal.email}&gt;</p>
              </div>

              <form onSubmit={handleSendReply} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Subject</label>
                  <input 
                    type="text" 
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    required
                    placeholder={`Regarding booking inquiry #${replyModal.referenceNumber}`}
                    className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded focus:outline-none focus:border-luxury-gold text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Message Body</label>
                  <textarea 
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    required
                    rows="6"
                    placeholder={`Dear ${replyModal.customerName},\n\nThank you for reaching out to By Jonathan Studio. Regarding your booking inquiry for ${replyModal.eventType} on ${new Date(replyModal.eventDate).toLocaleDateString()}...`}
                    className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded focus:outline-none focus:border-luxury-gold text-sm"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={sendingEmail}
                  className="w-full py-3 bg-luxury-gold text-black font-bold uppercase tracking-widest hover:bg-white transition-colors text-sm"
                >
                  {sendingEmail ? 'Sending Email...' : 'Send Reply'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bookings;
