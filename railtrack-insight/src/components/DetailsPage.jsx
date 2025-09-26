import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function DetailsPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const id = query.get("id");

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authRequired, setAuthRequired] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    inspection_date: "",
    inspector_code: "",
    defect_type: "",
  });

  // Fetch item details
  useEffect(() => {
    if (!id) {
      setError("No ID provided in the URL");
      setLoading(false);
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/inventory/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch item");
        return res.json();
      })
      .then((data) => {
        setItem(data);
        setFormData({
          inspection_date: data.inspection_date || "",
          inspector_code: data.inspector_code || "",
          defect_type: data.defect_type || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching item:", err);
        setError("Error fetching item details");
        setLoading(false);
      });
  }, [id]);

  // Authenticate inspector
  const handleAuth = () => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/auth/inspector`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Authentication failed");
        return res.json();
      })
      .then(() => {
        setAuthenticated(true);
        setEditing(true);
        setAuthRequired(false);
      })
      .catch(() => {
        alert("Incorrect password!");
      });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/inventory/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update");
        return res.json();
      })
      .then(() => {
        setItem({ ...item, ...formData });
        setEditing(false);
        alert("Inspection details updated successfully!");
      })
      .catch((err) => {
        console.error("Update error:", err);
        alert("Failed to update inspection details");
      });
  };

  if (loading)
    return (
      <div className="p-6 text-center text-black">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center text-red-600">
        {error}
      </div>
    );

  if (!item)
    return (
      <div className="p-6 text-center text-black">
        No data found for this item.
      </div>
    );

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-xl mt-10 text-black">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Item Details
      </h1>

      <div className="space-y-3">
        {[
          "vendor",
          "vendor_id",
          "lot_number",
          "item_type",
          "item_material",
          "manufacture_date",
          "install_date",
          "warranty_period",
          "rail_pole_number",
        ].map((field) => (
          <p key={field}>
            <strong>{field.replace("_", " ").toUpperCase()}:</strong> {item[field]}
          </p>
        ))}

        {editing ? (
          <div className="space-y-3 mt-4">
            {["inspector_code", "inspection_date", "defect_type"].map((field) => (
              <div key={field}>
                <label className="block font-semibold">
                  {field.replace("_", " ").toUpperCase()}:
                </label>
                <input
                  type={field === "inspection_date" ? "date" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              </div>
            ))}
            <button
              onClick={handleUpdate}
              className="mt-3 px-4 py-2 bg-green-500 text-white rounded"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="mt-3 ml-2 px-4 py-2 bg-gray-300 text-black rounded"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            {["inspector_code", "inspection_date", "defect_type"].map((field) => (
              <p key={field}>
                <strong>{field.replace("_", " ").toUpperCase()}:</strong> {item[field]}
              </p>
            ))}

            {!authenticated && !authRequired && (
              <button
                onClick={() => setAuthRequired(true)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Update Inspection Details
              </button>
            )}

            {authRequired && !authenticated && (
              <div className="mt-4 space-y-2">
                <input
                  type="password"
                  placeholder="Enter inspector password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <button
                  onClick={handleAuth}
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Authenticate
                </button>
                <button
                  onClick={() => setAuthRequired(false)}
                  className="ml-2 px-4 py-2 bg-gray-300 text-black rounded"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DetailsPage;
