const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { test } = require('./controllers/testPassword');
const data = require('cg.json');

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/details', (req, res)=>{
    let enr = req.enr
    let pwd = req.pwd
    if(test(enr, pwd)){
        const dataUser = findByEnrolmentNo(enr);
        return res.status(200).send(dataUser);
    }else{
        return res.status(404).send('user not found');
    }
})

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).json({ error: 'Resource not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

function findByEnrolmentNo(enrolmentNo) {
    return data.find(entry => {
        const content = entry["Enrolment No."].content;
        // Check if the Enrolment No. matches
        return content.includes(`Enrolment No. : ${enrolmentNo}`);
    });
}


// const express = require('express');
// const fs = require('fs');
// const app = express();
// const PORT = 3000;

// // Middleware to parse JSON body
// app.use(express.json());

// // Endpoint to get details by Enrolment No.
// app.get('/details/:enrollmentNo', (req, res) => {
//   const enrollmentNo = req.params.enrollmentNo; // Extract enrollment number from params

//   if (!enrollmentNo) {
//     return res.status(400).send({ error: 'Enrollment number is required.' });
//   }

//   // Read and parse cg.json
//   fs.readFile('./cg.json', 'utf-8', (err, data) => {
//     if (err) {
//       console.error('Error reading file:', err);
//       return res.status(500).send({ error: 'Failed to read data.' });
//     }

//     let jsonData;
//     try {
//       jsonData = JSON.parse(data);
//     } catch (parseErr) {
//       console.error('Error parsing JSON:', parseErr);
//       return res.status(500).send({ error: 'Invalid JSON format.' });
//     }

//     // Find object with matching Enrolment No.
//     const result = jsonData.find(obj =>
//       obj["Enrolment No."].content.includes(`Enrolment No. : ${enrollmentNo}`)
//     );

//     if (!result) {
//       return res.status(404).send({ error: 'Enrollment number not found.' });
//     }

//     // Extract and format the response block
//     const response = {
//       enrollmentNo,
//       CGPA: result.CGPA.content,
//       studentName: result["Student Name"].content
//     };

//     res.status(200).send(response);
//   });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
