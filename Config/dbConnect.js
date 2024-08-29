const mongoose = require("mongoose");
const dbconnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected successfully....");
  } catch (error) {
    console.log(
      "ERROR!!!!! DATABASE NOT CONNECTED...(NO INTERNET CONNNECTION)"
    );
    process.exit(1);
  }
};
dbconnect();
