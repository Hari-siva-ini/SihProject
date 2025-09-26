import React, { useEffect, useState } from "react";

function InventoryTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/inventory`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch inventory");
        return res.json();
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching inventory data");
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="p-6 text-center text-black">Loading...</div>;

  if (error)
    return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">DataBase</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
              <th className="border px-4 py-2">Vendor</th>
              <th className="border px-4 py-2">Vendor ID</th>
              <th className="border px-4 py-2">Lot Number</th>
              <th className="border px-4 py-2">Item Type</th>
              <th className="border px-4 py-2">Material</th>
              <th className="border px-4 py-2">Manufacture Date</th>
              <th className="border px-4 py-2">Install Date</th>
              <th className="border px-4 py-2">Warranty</th>
              <th className="border px-4 py-2">Rail Pole No.</th>
              <th className="border px-4 py-2">Inspector Code</th>
              <th className="border px-4 py-2">Inspection Date</th>
              <th className="border px-4 py-2">Defect Type</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {items.map((item, idx) => (
              <tr
                key={item.id}
                className={`border-b border-gray-200 hover:bg-gray-100 ${
                  idx % 2 === 0 ? "bg-gray-50" : ""
                }`}
              >
                <td className="border px-4 py-2">{item.vendor}</td>
                <td className="border px-4 py-2">{item.vendor_id}</td>
                <td className="border px-4 py-2">{item.lot_number}</td>
                <td className="border px-4 py-2">{item.item_type}</td>
                <td className="border px-4 py-2">{item.item_material}</td>
                <td className="border px-4 py-2">{item.manufacture_date}</td>
                <td className="border px-4 py-2">{item.install_date}</td>
                <td className="border px-4 py-2">{item.warranty_period}</td>
                <td className="border px-4 py-2">{item.rail_pole_number}</td>
                <td className="border px-4 py-2">{item.inspector_code}</td>
                <td className="border px-4 py-2">{item.inspection_date}</td>
                <td className="border px-4 py-2">{item.defect_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryTable;
