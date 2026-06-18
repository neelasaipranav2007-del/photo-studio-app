import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiEye, FiMail, FiClock, FiDownload, FiMessageSquare } from 'react-icons/fi';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { AuthContext } from '../../context/AuthContext';

const Queries = () => {
  const { user } = useContext(AuthContext);
  const [queries, setQueries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modals state
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyModal, setReplyModal] = useState(null); // stores query object when active
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchQueries = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get('/api/bookings', config);
      // Filter for contact queries only
      const contactQueries = data.filter(item => item.isContactQuery === true);
      setQueries(contactQueries);
    } catch (error) {
      console.error('Error fetching queries', error);
    }
  };

  useEffect(() => {
    if (user?.token) fetchQueries();
  }, [user]);

  const updateStatus = async (id, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`/api/bookings/${id}/status`, { status: newStatus }, config);
      setQueries(queries.map(q => q._id === id ? { ...q, status: newStatus } : q));
      if (selectedQuery && selectedQuery._id === id) {
        setSelectedQuery({ ...selectedQuery, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status', error);
      alert('Failed to update status.');
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
      fetchQueries();
    } catch (error) {
      console.error(error);
      alert('Failed to send reply email.');
    } finally {
      setSendingEmail(false);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredQueries.map(q => ({
      'Ref Number': q.referenceNumber,
      'Customer Name': q.customerName,
      'Email': q.email,
      'Event Interest': q.eventType,
      'Date Received': new Date(q.createdAt).toLocaleDateString(),
      'Query': q.specialRequirements,
      'Suggestions / Improvements': q.neededImprovements || 'None',
      'Status': q.status
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Queries");
    XLSX.writeFile(wb, "Queries_Report.xlsx");
  };

  const exportToCSV = () => {
    const headers = ['Ref,Name,Email,Event,Date,Query,Suggestions,Status\n'];
    const rows = filteredQueries.map(q => 
      `"${q.referenceNumber}","${q.customerName}","${q.email}","${q.eventType}","${new Date(q.createdAt).toLocaleDateString()}","${q.specialRequirements.replace(/"/g, '""')}","${(q.neededImprovements || '').replace(/"/g, '""')}", "${q.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows.join('\n')).join('');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Queries_Report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredQueries = queries.filter(q => {
    const matchesSearch = q.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.eventType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.specialRequirements?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-white tracking-wide">Customer Queries</h2>
          <p className="text-sm text-gray-400">View customer questions, event inquiries & studio feedback</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search queries..." 
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
              <th className="p-4 font-normal">Event Interest</th>
              <th className="p-4 font-normal">Date Received</th>
              <th className="p-4 font-normal">Query Message</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueries.map((query) => (
              <tr key={query._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-white">
                  <div className="font-semibold">{query.customerName}</div>
                  <div className="text-xs text-gray-500">{query.referenceNumber}</div>
                </td>
                <td className="p-4 text-gray-300 font-medium">{query.eventType}</td>
                <td className="p-4 text-gray-400 text-sm">{new Date(query.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-gray-400 text-sm max-w-xs truncate">
                  {query.specialRequirements}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 text-xs rounded-full border ${
                    query.status === 'New Inquiry' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                    query.status === 'Reviewed' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                    query.status === 'Contacted' ? 'border-indigo-500/50 text-indigo-400 bg-indigo-500/10' :
                    'border-gray-500/50 text-gray-400 bg-gray-500/10'
                  }`}>
                    {query.status}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end space-x-1 items-center">
                  <button title="View Query" onClick={() => setSelectedQuery(query)} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-all"><FiEye /></button>
                  <button title="Send Email" onClick={() => setReplyModal(query)} className="p-2 text-blue-400 hover:text-white hover:bg-white/5 rounded transition-all"><FiMail /></button>
                  
                  {query.status === 'New Inquiry' && (
                    <button title="Mark Reviewed" onClick={() => updateStatus(query._id, 'Reviewed')} className="px-2 py-1 text-[10px] text-blue-400 hover:bg-blue-500/10 border border-blue-500/30 rounded uppercase">Reviewed</button>
                  )}
                  {query.status === 'Reviewed' && (
                    <button title="Mark Contacted" onClick={() => updateStatus(query._id, 'Contacted')} className="px-2 py-1 text-[10px] text-indigo-400 hover:bg-indigo-500/10 border border-indigo-500/30 rounded uppercase">Contact</button>
                  )}
                </td>
              </tr>
            ))}
            {filteredQueries.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">No queries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* VIEW DETAILS MODAL */}
      <AnimatePresence>
        {selectedQuery && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass border border-white/10 p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white relative space-y-6"
            >
              <button onClick={() => setSelectedQuery(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white text-xl">
                <FiX />
              </button>

              <div className="border-b border-white/10 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-serif text-white uppercase tracking-widest">{selectedQuery.customerName}</h3>
                    <p className="text-luxury-gold text-sm font-mono mt-1">Ref: {selectedQuery.referenceNumber}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full border ${
                    selectedQuery.status === 'New Inquiry' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                    selectedQuery.status === 'Reviewed' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                    selectedQuery.status === 'Contacted' ? 'border-indigo-500/50 text-indigo-400 bg-indigo-500/10' :
                    'border-gray-500/50 text-gray-400 bg-gray-500/10'
                  }`}>
                    {selectedQuery.status}
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
                <div className="space-y-3">
                  <h4 className="text-luxury-gold font-serif text-base border-b border-white/5 pb-1">Sender Info</h4>
                  <p><strong>Email:</strong> {selectedQuery.email}</p>
                  <p><strong>Phone:</strong> {selectedQuery.phone}</p>
                  <p><strong>Date Received:</strong> {new Date(selectedQuery.createdAt).toLocaleString()}</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-luxury-gold font-serif text-base border-b border-white/5 pb-1">Interest Category</h4>
                  <p><strong>Event Name:</strong> {selectedQuery.eventType}</p>
                </div>
              </div>

              {/* Message Details */}
              <div className="space-y-3">
                <h4 className="text-luxury-gold font-serif text-base border-b border-white/5 pb-1 flex items-center">
                  <FiMessageSquare className="mr-2" /> Customer Query Message
                </h4>
                <div className="text-sm bg-black/40 border border-white/5 p-4 rounded text-gray-300 whitespace-pre-wrap leading-relaxed font-light">
                  {selectedQuery.specialRequirements}
                </div>
              </div>

              {/* Needed Improvements */}
              <div className="space-y-3">
                <h4 className="text-luxury-gold font-serif text-base border-b border-white/5 pb-1 flex items-center">
                  💡 Suggestions / Improvements Needed
                </h4>
                <div className="text-sm bg-black/40 border border-white/5 p-4 rounded text-gray-300 whitespace-pre-wrap leading-relaxed font-light italic">
                  {selectedQuery.neededImprovements || "No suggestions provided by the user."}
                </div>
              </div>

              {/* Email Communications Log */}
              <div className="space-y-3">
                <h4 className="text-luxury-gold font-serif text-base border-b border-white/5 pb-1 flex items-center">
                  <FiClock className="mr-2" /> Communication Logs
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {selectedQuery.emailsSent && selectedQuery.emailsSent.map((mail, idx) => (
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
                  {(!selectedQuery.emailsSent || selectedQuery.emailsSent.length === 0) && (
                    <div className="text-center py-4 text-gray-500 text-xs italic">No email replies sent yet.</div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10 justify-end">
                <button onClick={() => setReplyModal(selectedQuery)} className="flex items-center space-x-2 bg-luxury-gold text-black px-6 py-2 rounded text-sm font-semibold hover:bg-white transition-all">
                  <FiMail /> <span>Send Email Reply</span>
                </button>
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
                    placeholder={`Dear ${replyModal.customerName},\n\nThank you for reaching out to By Jonathan Studio. Regarding your query about "${replyModal.eventType}"...`}
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

export default Queries;
