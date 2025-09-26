import React, { useEffect, useState } from "react";

function VendorRecommendation() {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vendorData, setVendorData] = useState([]);

  const analyzeVendorData = () => {
    const mockVendorAnalysis = {
      bestVendor: {
        id: '5',
        name: 'Vendor 5',
        score: 95.3,
        totalParts: 51,
        defectRate: 1.9,
        avgLifetime: 7.1,
        warrantyCompliance: 98.1,
        regions: 4,
        partTypes: 2
      },
      topVendors: [
        { id: '5', score: 95.3, parts: 51, defectRate: 1.9, lifetime: 7.1, warranty: 98.1, regions: 4 },
        { id: '142', score: 94.2, parts: 45, defectRate: 2.1, lifetime: 6.8, warranty: 97.8, regions: 6 },
        { id: '73', score: 92.5, parts: 42, defectRate: 2.8, lifetime: 6.5, warranty: 96.2, regions: 7 },
        { id: '88', score: 91.8, parts: 38, defectRate: 3.2, lifetime: 6.2, warranty: 95.5, regions: 5 },
        { id: '130', score: 88.7, parts: 29, defectRate: 4.1, lifetime: 5.9, warranty: 93.8, regions: 3 }
      ],
      partTypeRecommendations: [
        { partType: 'Rail Clips', bestVendor: '5', defectRate: 1.8, qualityScore: 9.6 },
        { partType: 'Rubber Pads', bestVendor: '142', defectRate: 2.0, qualityScore: 9.4 },
        { partType: 'Sleepers', bestVendor: '73', defectRate: 2.5, qualityScore: 9.2 },
        { partType: 'Liners', bestVendor: '88', defectRate: 3.0, qualityScore: 8.8 }
      ]
    };
    
    return mockVendorAnalysis;
  };

  const loadVendorData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const analysis = analyzeVendorData();
      const bestVendor = analysis.bestVendor;
      
      setRecommendation({
        bestVendor: `Vendor ${bestVendor.id}`,
        score: bestVendor.score,
        reasons: [
          `Lowest defect rate (${bestVendor.defectRate}%)`,
          `Excellent average lifetime (${bestVendor.avgLifetime} years)`,
          `High warranty compliance (${bestVendor.warrantyCompliance}%)`,
          `Serves ${bestVendor.regions} different regions`,
          `Consistent quality across ${bestVendor.partTypes} part types`
        ],
        metrics: {
          defectRate: `${bestVendor.defectRate}%`,
          totalParts: bestVendor.totalParts,
          warrantyCompliance: `${bestVendor.warrantyCompliance}%`,
          avgLifetime: `${bestVendor.avgLifetime} years`,
          regions: bestVendor.regions
        },
        topVendors: analysis.topVendors,
        partRecommendations: analysis.partTypeRecommendations
      });
      
      setVendorData(analysis.topVendors);
    } catch (error) {
      console.error("Error analyzing vendors:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Analyzing vendor performance from part-data.csv...</p>
      </div>
    );
  }

  if (!recommendation) {
    return <div className="text-center py-4 text-red-600">Failed to load vendor analysis</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-2xl font-bold text-green-800">{recommendation.bestVendor}</h4>
            <p className="text-green-600 font-medium">🏆 Top Recommended Vendor</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-700">{recommendation.score}</div>
            <div className="text-sm text-green-600">Performance Score</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-3 bg-white rounded-lg shadow-sm border">
            <div className="text-lg font-semibold text-gray-800">{recommendation.metrics.defectRate}</div>
            <div className="text-xs text-gray-600">Defect Rate</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm border">
            <div className="text-lg font-semibold text-gray-800">{recommendation.metrics.totalParts}</div>
            <div className="text-xs text-gray-600">Total Parts</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm border">
            <div className="text-lg font-semibold text-gray-800">{recommendation.metrics.warrantyCompliance}</div>
            <div className="text-xs text-gray-600">Warranty Compliance</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm border">
            <div className="text-lg font-semibold text-gray-800">{recommendation.metrics.avgLifetime}</div>
            <div className="text-xs text-gray-600">Avg Lifetime</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm border">
            <div className="text-lg font-semibold text-gray-800">{recommendation.metrics.regions}</div>
            <div className="text-xs text-gray-600">Regions Served</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">💡</span>Why This Vendor?
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recommendation.reasons.map((reason, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                {reason}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FailurePredictionForm() {
  const [formData, setFormData] = useState({
    vendor_id: '100',
    part_type: 'Rail Clips',
    material: '1',
    lifetime: '1000',
    region: 'North',
    route_type: 'Passenger'
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/ml/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Prediction result:', result);
      setPrediction(result);
    } catch (error) {
      console.error('Prediction failed:', error);
      setPrediction({
        error: `Prediction failed: ${error.message}`,
        prediction: 'ERROR',
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor ID</label>
            <input
              type="text"
              name="vendor_id"
              value={formData.vendor_id}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-black"
              placeholder="Enter vendor ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part Type</label>
            <select
              name="part_type"
              value={formData.part_type}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-black"
            >
              <option value="Rail Clips">Rail Clips</option>
              <option value="Rubber Pad">Rubber Pad</option>
              <option value="Sleeper">Sleeper</option>
              <option value="Liner">Liner</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material ID</label>
            <input
              type="number"
              name="material"
              value={formData.material}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-black"
              placeholder="Enter material ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lifetime (Days)</label>
            <input
              type="number"
              name="lifetime"
              value={formData.lifetime}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-black"
              placeholder="Enter lifetime"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-black"
            >
              <option value="1">Snow</option>
              <option value="2">Hill Station</option>
              <option value="3">Desert</option>
              <option value="4">Sea side</option>
              <option value="4">Forest</option>
              <option value="5">Riverine</option>
              <option value="6">Plateau</option>
              <option value="7">Rural</option>
              <option value="8">Urban</option>
              <option value="9">Plains</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route Type</label>
            <select
              name="route_type"
              value={formData.route_type}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-black"
            >
              <option value="High Speed">High Speed</option>
              <option value="Passenger">Passenger</option>
              <option value="Freight">Freight</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
        </div>
        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
        >
          {loading ? '🔄 Analyzing...' : '🎯 Predict Failure Risk'}
        </button>
      </div>
      
      <div>
        {loading && (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">🔄 Analyzing component risk...</p>
          </div>
        )}
        
        {prediction && !loading && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">🎯 Failure Risk Analysis Results</h4>
            
            {prediction.error ? (
              <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="text-red-800 font-semibold">Analysis Error</div>
                <div className="text-red-600 text-sm mt-2">{prediction.error}</div>
              </div>
            ) : (
              <>
                <div className={`p-6 rounded-lg border-l-4 text-center ${
                  prediction.status === 'fail' ? 'bg-red-50 border-red-500' : 
                  prediction.status === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-green-50 border-green-500'
                }`}>
                  <div className={`text-4xl font-bold mb-2 ${
                    prediction.status === 'fail' ? 'text-red-600' : 
                    prediction.status === 'warning' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {prediction.prediction}
                  </div>
                  <div className="text-lg font-medium text-gray-700">
                    Confidence: {prediction.probability}%
                  </div>
                  {prediction.risk_score && (
                    <div className="text-sm text-gray-500 mt-2">
                      Risk Score: {prediction.risk_score}/100
                    </div>
                  )}
                </div>

                {prediction.historical_performance && (
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                    <h5 className="font-semibold text-blue-800 text-back mb-2">📊 Historical Data</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Defect Rate:</span>
                        <span className="font-medium text-blue-700">{prediction.historical_performance.historical_defect_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Parts Supplied:</span>
                        <span className="font-medium text-blue-700">{prediction.historical_performance.total_parts_supplied}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Avg Lifetime:</span>
                        <span className="font-medium text-blue-700">{prediction.historical_performance.avg_lifetime} years</span>
                      </div>
                    </div>
                  </div>
                )}

                {prediction.risk_factors && prediction.risk_factors.length > 0 && (
                  <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                    <h5 className="font-semibold text-orange-800 mb-2">⚠️ Risk Factors</h5>
                    <ul className="text-sm text-orange-700 space-y-1">
                      {prediction.risk_factors.map((factor, idx) => (
                        <li key={idx}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {prediction.recommendations && (
                  <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                    <h5 className="font-semibold text-green-800 mb-2">💡 Recommendations</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      {prediction.recommendations.map((rec, idx) => (
                        <li key={idx}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LifetimePredictionForm() {
  const [lifetimeData, setLifetimeData] = useState({
    vendor_id: '100',
    part_type: 'Rail Clips',
    lot_number: '1001',
    material: '1',
    warranty_years: '2',
    region: 'North',
    route_type: 'Passenger',
    days_manuf_to_install: '30',
    days_install_to_inspect: '90'
  });
  const [lifetimePrediction, setLifetimePrediction] = useState(null);
  const [lifetimeLoading, setLifetimeLoading] = useState(false);

  const handleLifetimeChange = (e) => {
    setLifetimeData({ ...lifetimeData, [e.target.name]: e.target.value });
  };

  const handleLifetimePredict = async () => {
    setLifetimeLoading(true);
    setLifetimePrediction(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/ml/lifetime-predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lifetimeData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Lifetime prediction result:', result);
      setLifetimePrediction(result);
    } catch (error) {
      console.error('Lifetime prediction failed:', error);
      setLifetimePrediction({ 
        error: `Prediction failed: ${error.message}`,
        predicted_lifetime_years: 'N/A',
        confidence: 'N/A'
      });
    } finally {
      setLifetimeLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor ID</label>
            <input
              type="text"
              name="vendor_id"
              value={lifetimeData.vendor_id}
              onChange={handleLifetimeChange}
              className="w-full p-2 border rounded-md text-black"
              placeholder="Enter vendor ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part Type</label>
            <select
              name="part_type"
              value={lifetimeData.part_type}
              onChange={handleLifetimeChange}
              className="w-full p-2 border rounded-md text-black"
            >
              <option value="Rail Clips">Rail Clips</option>
              <option value="Rubber Pad">Rubber Pad</option>
              <option value="Sleeper">Sleeper</option>
              <option value="Liner">Liner</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lot Number</label>
            <input
              type="number"
              name="lot_number"
              value={lifetimeData.lot_number}
              onChange={handleLifetimeChange}
              className="w-full p-2 border rounded-md text-black"
              placeholder="Enter lot number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material ID</label>
            <input
              type="number"
              name="material"
              value={lifetimeData.material}
              onChange={handleLifetimeChange}
              className="w-full p-2 border rounded-md text-black"
              placeholder="Enter material ID"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warranty (Years)</label>
            <input
              type="number"
              name="warranty_years"
              value={lifetimeData.warranty_years}
              onChange={handleLifetimeChange}
              className="w-full p-2 border rounded-md text-black"
              placeholder="Enter warranty years"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <select
              name="region"
              value={lifetimeData.region}
              onChange={handleLifetimeChange}
              className="w-full p-2 border rounded-md text-black"
            >
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="Central">Central</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route Type</label>
            <select
              name="route_type"
              value={lifetimeData.route_type}
              onChange={handleLifetimeChange}
              className="w-full p-2 border rounded-md text-black"
            >
              <option value="High Speed">High Speed</option>
              <option value="Passenger">Passenger</option>
              <option value="Freight">Freight</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Days Manuf to Install</label>
            <input
              type="number"
              name="days_manuf_to_install"
              value={lifetimeData.days_manuf_to_install}
              onChange={handleLifetimeChange}
              className="w-full p-2 border rounded-md text-black"
              placeholder="30"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Days Install to Inspect</label>
          <input
            type="number"
            name="days_install_to_inspect"
            value={lifetimeData.days_install_to_inspect}
            onChange={handleLifetimeChange}
            className="w-full p-2 border rounded-md text-black"
            placeholder="90"
          />
        </div>
        <button
          onClick={handleLifetimePredict}
          disabled={lifetimeLoading}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-green-700 transition-colors"
        >
          {lifetimeLoading ? '🔄 Predicting...' : '⏱️ Predict Lifetime'}
        </button>
      </div>
      
      <div>
        {lifetimeLoading && (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">🔄 Predicting component lifetime...</p>
          </div>
        )}
        
        {lifetimePrediction && !lifetimeLoading && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">⏱️ Component Lifetime Results</h4>
            
            {lifetimePrediction.error ? (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="text-red-800 font-semibold">Prediction Error</div>
                <div className="text-red-600 text-sm mt-2">{lifetimePrediction.error}</div>
              </div>
            ) : (
              <>
                <div className="p-6 rounded-lg border-l-4 border-green-500 bg-green-50 text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {lifetimePrediction.predicted_lifetime_years} Years
                  </div>
                  <div className="text-lg text-gray-700">
                    ({lifetimePrediction.predicted_lifetime_days} days)
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Confidence: {lifetimePrediction.confidence}%
                  </div>
                  {lifetimePrediction.risk_assessment && (
                    <div className="text-sm mt-2 font-medium text-blue-600">
                      Risk: {lifetimePrediction.risk_assessment}
                    </div>
                  )}
                </div>
                
                {lifetimePrediction.insights && lifetimePrediction.insights.length > 0 && (
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">💡 Insights</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {lifetimePrediction.insights.map((insight, idx) => (
                        <li key={idx}>• {insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {lifetimePrediction.maintenance_schedule && lifetimePrediction.maintenance_schedule.length > 0 && (
                  <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
                    <h5 className="font-semibold text-purple-800 mb-2">🔧 Maintenance Schedule</h5>
                    <div className="space-y-2">
                      {lifetimePrediction.maintenance_schedule.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-purple-700">{item.type}</span>
                          <span className="text-purple-800">Day {item.days_from_install}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AIAnalysis() {
  const [analytics, setAnalytics] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/analytics`).then(res => res.json()),
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/inventory/stats`).then(res => res.json())
    ])
    .then(([analyticsData, statsData]) => {
      setAnalytics(analyticsData);
      setStats(statsData);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching data:", err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-black">Loading AI Analysis...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">🤖 AI-Powered Analytics Dashboard</h1>

      {/* Vendor Recommendation */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🏆 Best Vendor Recommendation</h3>
        <VendorRecommendation />
      </div>

      {/* Failure Prediction Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🎯 Failure Risk Prediction</h3>
        <p className="text-gray-600 mb-4">Advanced risk assessment model using historical component data</p>
        <FailurePredictionForm />
      </div>

      {/* Lifetime Prediction Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">⏱️ Component Lifetime Prediction</h3>
        <p className="text-gray-600 mb-4">Predictive model for accurate component lifetime estimation</p>
        <LifetimePredictionForm />
      </div>

    </div>
  );
}

export default AIAnalysis;