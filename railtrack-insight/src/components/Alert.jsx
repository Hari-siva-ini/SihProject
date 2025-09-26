import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, Send, Mail, MessageSquare, RefreshCw, CheckCircle } from 'lucide-react';

const Alert = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({ critical: 0, warning: 0, total: 0 });

  useEffect(() => {
    checkExpiringComponents();
  }, []);

  const checkExpiringComponents = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/inventory`);
      const items = await response.json();
      
      const today = new Date();
      const alertThreshold = 30; // days before expiry
      
      const expiringItems = items.filter((item, index) => {
        const warrantyEnd = new Date(item.install_date);
        const warrantyMonths = parseInt(item.warranty_period) * 12; // Convert years to months
        warrantyEnd.setMonth(warrantyEnd.getMonth() + warrantyMonths);
        
        const daysUntilExpiry = Math.ceil((warrantyEnd - today) / (1000 * 60 * 60 * 24));
        
        // Debug 5th component (index 4)
        if (index === 4) {
          console.log('5th Component Debug:', {
            lot_number: item.lot_number,
            install_date: item.install_date,
            warranty_period: item.warranty_period,
            warranty_months: warrantyMonths,
            warranty_end: warrantyEnd.toLocaleDateString(),
            days_until_expiry: daysUntilExpiry,
            will_alert: daysUntilExpiry <= alertThreshold && daysUntilExpiry > 0
          });
        }
        
        return daysUntilExpiry <= alertThreshold && daysUntilExpiry > 0;
      });

      const critical = expiringItems.filter(item => {
        const warrantyEnd = new Date(item.install_date);
        const warrantyMonths = parseInt(item.warranty_period) * 12; // Convert years to months
        warrantyEnd.setMonth(warrantyEnd.getMonth() + warrantyMonths);
        const days = Math.ceil((warrantyEnd - today) / (1000 * 60 * 60 * 24));
        return days <= 7;
      }).length;

      setStats({ 
        critical, 
        warning: expiringItems.length - critical, 
        total: expiringItems.length 
      });
      setAlerts(expiringItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching components:', error);
      setLoading(false);
    }
  };

  const sendAlert = async (item, type) => {
    setSending(true);
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/send-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item,
          alertType: type,
          message: `${type} Alert: Component ${item.lot_number} (${item.item_type}) expires soon. Rail Pole: ${item.rail_pole_number}`
        })
      });
      alert(`${type} alert sent successfully!`);
    } catch (error) {
      alert(`Failed to send ${type} alert`);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
          Railway Component Alerts
        </h1>
        <p className="text-gray-600">Monitor component lifecycle and warranty status</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <motion.div whileHover={{ scale: 1.05 }} className="bg-red-500 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Critical Alerts</p>
              <p className="text-3xl font-bold">{stats.critical}</p>
            </div>
            <AlertTriangle size={40} className="text-red-200" />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} className="bg-yellow-500 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Warning Alerts</p>
              <p className="text-3xl font-bold">{stats.warning}</p>
            </div>
            <Clock size={40} className="text-yellow-200" />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} className="bg-blue-500 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Components</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <CheckCircle size={40} className="text-blue-200" />
          </div>
        </motion.div>
      </motion.div>
      
      <AnimatePresence>
        {alerts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-green-50 border border-green-200 rounded-xl p-8"
          >
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">All Clear!</h3>
            <p className="text-green-600">No components expiring within 30 days</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {alerts.map((item, idx) => {
              const warrantyEnd = new Date(item.install_date);
              const warrantyMonths = parseInt(item.warranty_period) * 12; // Convert years to months
              warrantyEnd.setMonth(warrantyEnd.getMonth() + warrantyMonths);
              const daysLeft = Math.ceil((warrantyEnd - new Date()) / (1000 * 60 * 60 * 24));
              const isCritical = daysLeft <= 7;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                  className={`${isCritical ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'} border-l-4 p-6 rounded-xl shadow-md`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {isCritical ? 
                          <AlertTriangle className="text-red-600" size={24} /> : 
                          <Clock className="text-yellow-600" size={24} />
                        }
                        <h3 className={`text-xl font-bold ${isCritical ? 'text-red-800' : 'text-yellow-800'}`}>
                          {item.item_type} - Lot: {item.lot_number}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className={`${isCritical ? 'text-red-700' : 'text-yellow-700'}`}>
                          <p><strong>Rail Pole:</strong> {item.rail_pole_number}</p>
                          <p><strong>Vendor:</strong> {item.vendor}</p>
                        </div>
                        <div className={`${isCritical ? 'text-red-700' : 'text-yellow-700'}`}>
                          <p><strong>Material:</strong> {item.item_material}</p>
                          <p><strong>Install Date:</strong> {new Date(item.install_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <motion.div 
                        animate={{ scale: isCritical ? [1, 1.05, 1] : 1 }}
                        transition={{ duration: 2, repeat: isCritical ? Infinity : 0 }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isCritical ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'} font-bold`}
                      >
                        <Clock size={16} />
                        Expires in {daysLeft} days ({warrantyEnd.toLocaleDateString()})
                      </motion.div>
                    </div>
                    
                    <div className="flex flex-col gap-3 ml-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => sendAlert(item, 'SMS')}
                        disabled={sending}
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all"
                      >
                        <MessageSquare size={16} />
                        Send SMS
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => sendAlert(item, 'Email')}
                        disabled={sending}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all"
                      >
                        <Mail size={16} />
                        Send Email
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={checkExpiringComponents}
          className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg mx-auto"
        >
          <RefreshCw size={20} />
          Refresh Alerts
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Alert;