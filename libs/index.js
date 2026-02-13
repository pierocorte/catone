import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const port = 3001;

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

app.use((req, _res, next) => {
  console.log("IN:", req.method, req.url);
  next();
});

app.get('/api', (req, res) => {
  res.send('Hello from µfe1!');
});

app.use('/', express.static('static', {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.ttf')) {
      res.setHeader('Content-Type', 'font/ttf');
    }
    console.log(`Serving static file: ${filePath}`);
  }
}));


app.listen(port, () => {
  console.log(`pclib is running at http://localhost:${port}`);
});