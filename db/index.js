import mongoose from "mongoose";

const connectDb = async () => {
    const dbName = 'fatafatLoan';
    try {
        await mongoose.connect(`mongodb+srv://datastoredbvertex_db_user:J9IC43y7OdMjGs6D@fatafatloancluster0.a6eodhb.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=fatafatLoanCluster0`);
        console.log("connected ")
    } catch (error) {
        console.log(error, "connection error")
        process.exit(1)
    }
}

export default connectDb;

