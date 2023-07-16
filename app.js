const express = require('express');
const bodyParser = require('body-parser');
const turf = require('@turf/turf');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies and then add limit so that it can handle large data
app.use(bodyParser.json({limit:'10mb'}));




app.post('/api/intersections', (req, res) => {
 
  const lineString = req.body;

  if (!lineString || !lineString.type || lineString.type !== 'LineString' || !lineString.coordinates) {
    return res.status(400).send('Invalid LineString');
  }

  // Array to store the intersections
  const intersections = [];

  // Get the number of lines from the query parameter (default: 50)
  const numLines = req.query.numLines ? parseInt(req.query.numLines) : 50;

  // Iterate over the set of randomly spread lines
  for (let i = 1; i <= numLines; i++) {
    const lineID = `L${i.toString().padStart(2, '0')}`;
    const lineStart = turf.point(req.body.coordinates[0]);
    const lineEnd = turf.point(req.body.coordinates[req.body.coordinates.length - 1]);
    const line = turf.lineString([lineStart.geometry.coordinates, lineEnd.geometry.coordinates]);

    // Check for intersection between the linestring and the current line
    if (turf.booleanIntersects(line, lineString)) {
      // Calculate the intersection point
      const intersection = turf.lineIntersect(lineString, line);
      intersections.push({
        lineId: lineID,
        position: intersection.features[0].geometry.coordinates,
      });
    }
  }

  // Send the result as JSON
  res.json(intersections);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
