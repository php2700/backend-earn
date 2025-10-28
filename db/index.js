import mongoose from "mongoose";
// const username=totoearn266_db_user
const connectDb = async () => {

    try {
        await mongoose.connect(process.env.DB_CONNECTION);
        console.log("connected ")
    } catch (error) {
        console.log(error, "connection error")
        process.exit(1)
    }
}

export default connectDb;

