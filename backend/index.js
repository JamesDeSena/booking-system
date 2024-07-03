const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const ConnectDB = require("./config/Database");

const UserRoutes = require("./routes/UserRoutes");
const AdminRoutes = require("./routes/AdminRoutes");

const app = express();

dotenv.config();

ConnectDB();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  console.log(req.path, req.method);
  next();
});

app.use('/api/user', UserRoutes)
app.use('/api/admin', AdminRoutes)

app.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);