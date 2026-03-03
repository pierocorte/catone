import express from 'express';
import cors from 'cors';

const app = express();
const port = 3022;

// const allowedOrigins = [
//   'http://localhost:3000'
// ];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) callback(null, true);
//     else callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true // se devi usare cookie o auth
// };
// app.use(cors(corsOptions));

// app.use(cors({ origin: true, credentials: true }));
// app.options("*", cors({ origin: true, credentials: true }));

app.use('/', express.static('static'));

app.get('/api', (req, res) => {
  res.send('Hello from µfe1!');
});

app.listen(port, () => {
  console.log(`mfe1 is running at http://localhost:${port}`);
});