import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FooterNav from "./components/FooterNav";
import Sidebar from "./components/sidebar.jsx";
import QRForm from "./components/QRForm";
import DetailsPage from "./components/DetailsPage";
import Inventory from "./components/Inventory";
import AIAnalysis from "./components/AIAnalysis";
import Database from "./components/Database";
import Alert from "./components/Alert";


function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gradient-to-r from-gray-200 via-gray-200 to-gray-200 text-white">
        {/* Sidebar - Fixed Right */}
        <div className="fixed right-0 top-0 h-full z-10">
          <Sidebar />
        </div>

        {/* Main Content - Scrollable */}
        <main className="flex-1 mr-72 mb-16 p-8 overflow-y-auto">
          <Routes>
            {/* Home Page - QR Generator */}
            <Route
              path="/"
              element={
                <>
                  <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                    QR Code Generator
                  </h1>
                  <QRForm />
                </>
              }
            />

            {/* Details Page - opened from QR */}
            <Route path="/details" element={<DetailsPage />} />

            {/* Other Sections */}
            <Route
              path="/inventory"
              element={
                <Inventory />
              }
            />
            <Route
              path="/ai-analysis"
              element={
                <AIAnalysis />
              }
            />
            <Route
              path="/database"
              element={
                <Database />
              }
            />
            <Route
              path="/alerts"
              element={
                <Alert />
              }
            />
          </Routes>
        </main>

        {/* Footer - Fixed */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <FooterNav />
        </div>
      </div>
    </Router>
  );
}

export default App;
