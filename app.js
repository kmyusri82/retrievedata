const express = require('express');
const mysql = require('mysql');
const path = require('path');
const ejs = require('ejs');

const app = express();

// Configure MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pico_temperature'
});

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up static files
app.use(express.static(path.join(__dirname, 'public')));

// Route for the homepage
app.get('/', (req, res) => {
  // Parse date range from query params
  const startDate = req.query.startDate || '2023-02-25';
  const endDate = req.query.endDate || '2023-02-26';

  // Query MySQL for data
  const query = `
    SELECT
      DATE_FORMAT(time, '%Y-%m-%d %H:%i') as time1,
      temperature
    FROM
      pico1
    WHERE
      time BETWEEN ? AND ?
    ORDER BY
      time ASC
  `;
  connection.query(query, [startDate, endDate + ' 23:59:59'], (error, results) => {
    if (error) throw error;

    // Convert MySQL results to Chart.js data format
    const labels = results.map(row => `"${row.time1}"`);
    const data1 = results.map(row => row.temperature);

    console.log(results);
   
    // Render the EJS template with the chart data
    res.render('index', {
      labels: labels,
      data1: data1,
      startDate: startDate,
      endDate: endDate
    });
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
