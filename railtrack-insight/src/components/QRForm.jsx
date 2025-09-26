import React, { useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

function QRForm() {
  const [formData, setFormData] = useState({
    vendor: "",
    vendorId: "",
    lotNumber: "",
    itemType: "",
    itemMaterial: "",
    manufactureDate: "",
    installDate: "",
    warrantyPeriod: "",
    railPoleNumber: "",
    inspectorCode: "",
    inspectionDate: "",
    defectType: "",
  });

  const [qrValue, setQrValue] = useState("");
  const [confirmation, setConfirmation] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save data to backend + generate QR
  const handleGenerate = () => {
    const dataToSend = {
      vendor: formData.vendor,
      vendor_id: formData.vendorId,
      lot_number: formData.lotNumber,
      item_type: formData.itemType,
      item_material: formData.itemMaterial,
      manufacture_date: formData.manufactureDate,
      install_date: formData.installDate,
      warranty_period: formData.warrantyPeriod,
      rail_pole_number: formData.railPoleNumber,
      inspector_code: formData.inspectorCode,
      inspection_date: formData.inspectionDate,
      defect_type: formData.defectType,
    };

    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Item saved successfully:", data);
        setConfirmation("✅ Item saved successfully with ID: " + data.id);

        // Generate QR code with link containing item ID
        const baseUrl = `${process.env.REACT_APP_BASE_URL || 'http://localhost:3000'}/details`;
        const queryString = `?id=${data.id}`;
        setQrValue(`${baseUrl}${queryString}`);
      })
      .catch((err) => {
        console.error("Error saving item:", err);
        setConfirmation("❌ Failed to save item. Please try again.");
      });
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Form Section */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20"
      >
        <h3 className="text-lg font-bold mb-4 text-black">Item Information</h3>
        <form className="space-y-2 text-sm">
          {/* Vendor Name */}
          <div className="grid grid-cols-3 items-center gap-1">
            <label className="font-semibold text-black">Vendor Name</label>
            <input
              type="text"
              name="vendor"
              className="col-span-2 border p-2 rounded-md text-black text-sm"
              onChange={handleChange}
              placeholder="Enter vendor name"
              required
            />
          </div>

          {/* Vendor ID */}
          <div className="grid grid-cols-3 items-center gap-1">
            <label className="font-semibold text-black">Vendor ID</label>
            <input
              type="text"
              name="vendorId"
              className="col-span-2 border p-2 rounded-md text-black text-sm"
              onChange={handleChange}
              placeholder="Enter vendor ID"
              required
            />
          </div>

          {/* Lot Number */}
          <div className="grid grid-cols-3 items-center gap-1">
            <label className="font-semibold text-black">Lot Number</label>
            <input
              type="text"
              name="lotNumber"
              className="col-span-2 border p-2 rounded-md text-black text-sm"
              onChange={handleChange}
              placeholder="Enter lot number"
              required
            />
          </div>

          {/* Item Type */}
          <div className="grid grid-cols-3 items-center gap-1">
            <label className="font-semibold text-black">Item Type</label>
            <select
              name="itemType"
              className="col-span-2 border p-2 rounded-md text-black text-sm"
              onChange={handleChange}
              required
            >
              <option value="">Select item type</option>
              <option value="Rail Clips">Rail Clips</option>
              <option value="Rubber Pad">Rubber Pad</option>
              <option value="Sleeper">Sleeper</option>
              <option value="Liner">Liner</option>
            </select>
          </div>

          {/* Item Material */}
          <div className="grid grid-cols-3 items-center gap-1">
            <label className="font-semibold text-black">Item Material</label>
            <input
              type="text"
              name="itemMaterial"
              className="col-span-2 border p-2 rounded-md text-black text-sm"
              onChange={handleChange}
              placeholder="Enter material"
              required
            />
          </div>

          {/* Manufacture Date */}
          <div className="grid grid-cols-3 items-center gap-1">
            <label className="font-semibold text-black">Manufacture Date</label>
            <input
              type="date"
              name="manufactureDate"
              className="col-span-2 border p-2 rounded-md text-black text-sm"
              onChange={handleChange}
              required
            />
          </div>

          {/* Install Date */}
          <div className="grid grid-cols-3 items-center gap-1">
            <label className="font-semibold text-black">Install Date</label>
            <input
              type="date"
              name="installDate"
              className="col-span-2 border p-2 rounded-md text-black text-sm"
              onChange={handleChange}
            />
          </div>

          {/* Warranty Period */}
          <div className="grid grid-cols-3 items-center gap-1">
            <label className="font-semibold text-black">Warranty Period</label>
            <select
              name="warrantyPeriod"
              className="col-span-2 border p-2 rounded-md text-black text-sm"
              onChange={handleChange}
              required
            >
              <option value="">Select warranty</option>
              <option value="1 Year">1 Year</option>
              <option value="2 Years">2 Years</option>
              <option value="5 Years">5 Years</option>
              <option value="7 Years">7 Years</option>
            </select>
          </div>

          {/* Rail Pole Number */}
          <div className="grid grid-cols-3 items-center gap-1">
            <label className="font-semibold text-black">Rail Pole No.</label>
            <input
              type="text"
              name="railPoleNumber"
              className="col-span-2 border p-2 rounded-md text-black text-sm"
              onChange={handleChange}
              placeholder="Enter pole number"
            />
          </div>

          {/* Inspector Code */}
          <div className="grid grid-cols-3 items-center gap-1">
            <label className="font-semibold text-black">Inspector Code</label>
            <input
              type="text"
              name="inspectorCode"
              className="col-span-2 border p-2 rounded-md text-black text-sm"
              onChange={handleChange}
              placeholder="Enter inspector code"
            />
          </div>

          {/* Inspection Date */}
          <div className="grid grid-cols-3 items-center gap-1">
            <label className="font-semibold text-black">Inspection Date</label>
            <input
              type="date"
              name="inspectionDate"
              className="col-span-2 border p-2 rounded-md text-black text-sm"
              onChange={handleChange}
            />
          </div>

          {/* Defect Type */}
          <div className="grid grid-cols-3 items-center gap-1">
            <label className="font-semibold text-black">Defect Type</label>
            <input
              type="text"
              name="defectType"
              className="col-span-2 border p-2 rounded-md text-black text-sm"
              onChange={handleChange}
              placeholder="Enter defect type"
            />
          </div>
        </form>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-3 w-full py-2 rounded-md bg-gradient-to-r from-violet-400 via-blue-500 to-blue-500 text-white text-sm font-bold hover:scale-105 transition"
        >
          Save & Generate QR
        </button>

        {/* Confirmation Message */}
        {confirmation && (
          <p className="mt-3 text-sm font-medium text-green-700">{confirmation}</p>
        )}
      </motion.div>

      {/* QR Generator Section */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white backdrop-blur-xl p-4 rounded-xl shadow-lg border border-white/20 flex flex-col items-center justify-center"
      >
        <h3 className="text-lg font-bold mb-3 text-black">Generated QR Code</h3>
        {qrValue ? (
          <>
            <QRCodeSVG
              value={qrValue}
              size={200}
              fgColor="#000000"
              bgColor="#ffffff"
            />
            <a
              href={qrValue}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-blue-600 underline text-sm font-medium"
            >
              Open Link
            </a>
          </>
        ) : (
          <p className="text-gray-500 text-sm">
            Fill out the form & click "Save & Generate QR"
          </p>
        )}
      </motion.div>
      <br></br>
    </div>
  );
}

export default QRForm;
