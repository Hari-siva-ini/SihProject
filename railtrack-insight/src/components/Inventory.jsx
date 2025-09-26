import React, { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  TruckIcon,
  CubeIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Cog, Layers, SlidersHorizontal, Blocks } from "lucide-react";

function InventoryDashboard() {
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/inventory/stats`).then(res => res.json()),
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/analytics`).then(res => res.json())
    ])
    .then(([statsData, analyticsData]) => {
      setStats(statsData);
      setAnalytics(analyticsData);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching data:", err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-black">Loading inventory data...</div>;
  }

  const iconMap = {
    "Rail Clips": Cog,
    "Rubber Pad": Layers,
    "Liner": SlidersHorizontal,
    "Sleeper": Blocks
  };

  const colorMap = {
    "Rail Clips": "bg-blue-100",
    "Rubber Pad": "bg-green-100", 
    "Liner": "bg-yellow-100",
    "Sleeper": "bg-purple-100"
  };

  const fittingsData = Array.isArray(analytics) ? analytics.map(item => ({
    label: item.item_type,
    total: item.total_count.toLocaleString(),
    lowStock: item.defective_count,
    icon: iconMap[item.item_type] || Cog,
    color: colorMap[item.item_type] || "bg-gray-100"
  })) : [];

  const activityData = [
    { label: "To be Packed (Depot Dispatch)", value: 228, icon: CubeIcon, color: "bg-blue-100" },
    { label: "Packages to be Shipped (Divisions)", value: 6, icon: TruckIcon, color: "bg-yellow-100" },
    { label: "Packages to be Delivered (Field)", value: 10, icon: TruckIcon, color: "bg-green-100" },
    { label: "Qty Issued / Installed (on Tracks)", value: stats.total?.[0]?.count || 0, icon: CheckCircleIcon, color: "bg-purple-100" },
  ];

  const summaryData = [
    { label: "Quantity in Hand", value: (stats.total?.[0]?.count || 0).toLocaleString(), icon: CubeIcon, color: "bg-blue-100" },
    { label: "Quantity to be Received", value: "168", icon: TruckIcon, color: "bg-yellow-100" },
    { label: "Damaged / Defective Items", value: (stats.defective?.[0]?.count || 0).toString(), icon: ExclamationCircleIcon, color: "bg-red-100" },
  ];

  const productDetailsData = [
    { label: "Low Stock Items", value: "3 (ERC @ Chennai, Rail Pads @ Salem)", color: "text-red-600" },
    { label: "All Item Groups", value: "4 (ERC, Liners, Rail Pads, Sleepers)" },
    { label: "Total SKUs", value: "262" },
    { label: "Unconfirmed Items (Pending Inspection)", value: "121", color: "text-yellow-600" },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        🚉 Track Fittings Inventory Management
      </h1>

      {/* Annual Procurement Overview */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Annual Procurement Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-2xl p-6 flex flex-col items-center space-y-4">
            <div className="p-3 rounded-full bg-blue-100">
              <Cog className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">10 Crore</div>
              <div className="text-sm text-gray-600">Elastic Rail Clips</div>
              <div className="text-xs text-blue-600 mt-1">Annual Procurement</div>
            </div>
          </div>
          <div className="bg-white shadow rounded-2xl p-6 flex flex-col items-center space-y-4">
            <div className="p-3 rounded-full bg-yellow-100">
              <SlidersHorizontal className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">5 Crore</div>
              <div className="text-sm text-gray-600">Liners</div>
              <div className="text-xs text-yellow-600 mt-1">Annual Procurement</div>
            </div>
          </div>
          <div className="bg-white shadow rounded-2xl p-6 flex flex-col items-center space-y-4">
            <div className="p-3 rounded-full bg-green-100">
              <Layers className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">8.5 Crore</div>
              <div className="text-sm text-gray-600">Rail Pads</div>
              <div className="text-xs text-green-600 mt-1">Annual Procurement</div>
            </div>
          </div>
          <div className="bg-white shadow rounded-2xl p-6 flex flex-col items-center space-y-4">
            <div className="p-3 rounded-full bg-purple-100">
              <Blocks className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">10 Crore</div>
              <div className="text-sm text-gray-600">Sleepers</div>
              <div className="text-xs text-purple-600 mt-1">Based on Track Expansion</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sales / Issue Activity */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4"> Sales / Issue Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {activityData.map((item, idx) => (
            <div key={idx} className="bg-white shadow rounded-2xl p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-full ${item.color}`}>
                <item.icon className="h-8 w-8 text-gray-700" />
              </div>
              <div>
                <div className="text-lg font-medium text-gray-800">{item.value}</div>
                <div className="text-sm text-gray-500">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inventory Summary */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Inventory Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summaryData.map((item, idx) => (
            <div key={idx} className="bg-white shadow rounded-2xl p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-full ${item.color}`}>
                <item.icon className="h-8 w-8 text-gray-700" />
              </div>
              <div>
                <div className="text-lg font-medium text-gray-800">{item.value}</div>
                <div className="text-sm text-gray-500">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

     {/* Product Details */}
<section className="mb-8">
  <h2 className="text-2xl font-semibold text-gray-700 mb-4"> Product Details</h2>
  <div className="bg-white shadow rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[
      { label: "Low Stock Items", value: "Elastic Rail Clips ( Unit : Chennai )", color: "text-purple-700" },
      { label: "All Item Groups", value: Array.isArray(analytics) ? analytics.length.toString() : "0", color: "text-pink-500" },
      { label: "Total Stock Keeping Unit", value: (stats.total?.[0]?.count || 0).toString(), color: "text-red-600"},
      { label: "Unconfirmed Items (Pending Inspection)", value: (stats.pendingInspection?.[0]?.count || 0).toString(), color: "text-orange-600" },
      { label: "Total Vendors", value: "241", color: "text-yellow-600" },
      { label: "Pending Inspections", value: (stats.pendingInspection?.[0]?.count || 0).toString(), color: "text-green-600" },
      { label: "Warranty Expiry Alerts", value: (stats.warrantyExpired?.[0]?.count || 0).toString(), color: "text-red-600" },
      { label: "Items Installed", value: (stats.total?.[0]?.count || 0).toString(), color: "text-blue-600" },
      { label: "Damaged / Defective Items", value: (stats.defective?.[0]?.count || 0).toString(), color: "text-red-600" },
    ].map((item, idx) => (
      <div key={idx} className="border rounded-xl p-4 flex flex-col space-y-1">
        <div className="text-gray-700 font-medium">{item.label}</div>
        <div className={`text-lg font-bold ${item.color || ""}`}>{item.value}</div>
      </div>
    ))}
  </div>
</section>

    </div>
  );
}

export default InventoryDashboard;
