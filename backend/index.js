const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/orders', require('./routes/order'));
app.use('/api/optimize', require('./routes/optimize'));

app.listen(5000, () => console.log('Server started on port 5000'));
