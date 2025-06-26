import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const configOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connectToDB = async () => {
  const connectionUrl = process.env.MONGODB_URI; // Load MongoDB URI from .env

  if (!connectionUrl) {
    throw new Error('MongoDB URI is not defined in environment variables.');
  }

  mongoose
    .connect(connectionUrl, configOptions)
    .then(() => console.log("Ecommerce database connected successfully!"))
    .catch((err) =>
      console.log(`Getting Error from DB connection: ${err.message}`)
    );
};

export default connectToDB;
