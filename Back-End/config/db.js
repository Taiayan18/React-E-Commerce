import mongoose from "mongoose"
import dns from "node:dns"

// Node v20+ par kabhi kabhi system DNS resolver SRV records resolve nahi kar pata
// (aksar ISP-level DNS filtering ki wajah se, khaaskar India ke kuch ISPs pe),
// isliye yahan Google/Cloudflare public DNS force kar rahe hain (fixes querySrv errors).
dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"])


export const connectDB = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 15000,
        });
        console.log("MongoDB Connected");


    } catch (error) {
        console.log(`MongoDB is Not Connected: ${error.message}`);

        if (error.message.includes("querySrv")) {
            console.log("\n👉 Ye 'querySrv' DNS error hai — mongodb+srv:// connection string ka SRV DNS lookup fail ho raha hai.");
            console.log("   Common fixes:");
            console.log("   1. Apne system ki DNS ko 8.8.8.8 (Google DNS) pe manually set karo aur restart karo.");
            console.log("   2. Mobile hotspot pe try karo — agar chal jaaye to ye WiFi/ISP ka DNS block hai.");
            console.log("   3. MONGO_URL ko standard (mongodb://) connection string se replace karo — Atlas dashboard > Connect > Drivers se milegi.\n");
        }

    }
}
