import React, { useEffect, useState } from 'react';

const CheckFifthComponent = () => {
  const [fifthComponent, setFifthComponent] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/inventory')
      .then(res => res.json())
      .then(data => {
        if (data.length >= 5) {
          const component = data[4]; // 5th component (0-indexed)
          const installDate = new Date(component.install_date);
          const warrantyMonths = parseInt(component.warranty_period) * 12;
          const expirationDate = new Date(installDate);
          expirationDate.setMonth(expirationDate.getMonth() + warrantyMonths);
          
          setFifthComponent({
            ...component,
            warranty_expiration: expirationDate.toLocaleDateString(),
            days_until_expiry: Math.ceil((expirationDate - new Date()) / (1000 * 60 * 60 * 24))
          });
        }
      })
      .catch(err => console.error('Error:', err));
  }, []);

  if (!fifthComponent) return <div>Loading 5th component...</div>;

  return (
    <div className="p-4 bg-blue-50 border rounded">
      <h3 className="font-bold text-lg mb-2">5th Component Expiration Details:</h3>
      <p><strong>Lot Number:</strong> {fifthComponent.lot_number}</p>
      <p><strong>Item Type:</strong> {fifthComponent.item_type}</p>
      <p><strong>Install Date:</strong> {new Date(fifthComponent.install_date).toLocaleDateString()}</p>
      <p><strong>Warranty Period:</strong> {fifthComponent.warranty_period} years</p>
      <p><strong>Warranty Expires:</strong> {fifthComponent.warranty_expiration}</p>
      <p><strong>Days Until Expiry:</strong> {fifthComponent.days_until_expiry} days</p>
      <p><strong>Rail Pole:</strong> {fifthComponent.rail_pole_number}</p>
      <p><strong>Vendor:</strong> {fifthComponent.vendor}</p>
    </div>
  );
};

export default CheckFifthComponent;