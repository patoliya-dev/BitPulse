import app from "./app";
import config from "./config/config";
import connectDB from "./config/db";

const { PORT } = config;

connectDB();
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
