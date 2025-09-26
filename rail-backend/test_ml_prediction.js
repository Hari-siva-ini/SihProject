// Test script for ML prediction functionality
const { spawn } = require('child_process');

console.log('Testing ML Prediction Setup...\n');

// Test 1: Check if Python is available
console.log('1. Testing Python availability...');
const pythonTest = spawn('python', ['--version']);

pythonTest.stdout.on('data', (data) => {
  console.log(`✅ Python version: ${data.toString().trim()}`);
});

pythonTest.stderr.on('data', (data) => {
  console.log(`✅ Python version: ${data.toString().trim()}`);
});

pythonTest.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Python is available\n');
    
    // Test 2: Check if required files exist
    console.log('2. Checking required files...');
    const fs = require('fs');
    
    const requiredFiles = [
      'enhanced_ml_prediction.py',
      'model_rf_data.pkl',
      'part-data.csv'
    ];
    
    let allFilesExist = true;
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} is missing`);
        allFilesExist = false;
      }
    });
    
    if (allFilesExist) {
      console.log('\n3. Testing ML prediction...');
      
      // Test 3: Run a sample prediction
      const testPrediction = spawn('python', [
        'enhanced_ml_prediction.py',
        '100',        // vendor_id
        'Rail Clips', // part_type
        '1',          // material
        '5',          // lifetime
        'North',      // region
        'Passenger'   // route_type
      ]);
      
      let result = '';
      
      testPrediction.stdout.on('data', (data) => {
        result += data.toString();
      });
      
      testPrediction.stderr.on('data', (data) => {
        console.log(`Python error: ${data.toString()}`);
      });
      
      testPrediction.on('close', (code) => {
        try {
          const prediction = JSON.parse(result);
          console.log('✅ ML Prediction successful!');
          console.log('Sample prediction result:');
          console.log(JSON.stringify(prediction, null, 2));
          console.log('\n🎉 ML Prediction setup is working correctly!');
          console.log('\nYou can now:');
          console.log('1. Start your backend server: npm start');
          console.log('2. Use the ML prediction in your frontend AIAnalysis component');
          console.log('3. The prediction will be available at: POST /ml/predict');
        } catch (error) {
          console.log('❌ ML Prediction failed to parse result');
          console.log('Raw result:', result);
          console.log('Error:', error.message);
        }
      });
    } else {
      console.log('\n❌ Some required files are missing. Please ensure all files are in the backend directory.');
    }
  } else {
    console.log('❌ Python is not available or not in PATH');
  }
});