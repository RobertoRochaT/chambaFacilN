// Create this file to test the API route directly

import fetch from 'node-fetch';

const testFreelancerId = '6825767dab80053066409b96'; // Your test ID
const apiUrl = `http://localhost:5002/api/freelancers/${testFreelancerId}/chat`;

console.log(`Testing API endpoint: ${apiUrl}`);

fetch(apiUrl)
  .then(response => {
    console.log('Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Response data:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('Error testing API:', error);
  });