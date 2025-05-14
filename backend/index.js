import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import uploadRoute from "./routes/Upload.js"
const app = express()
dotenv.config()
const port = process.env.PORT;

app.use(cors());
app.use("/uploads", express.static("uploads")); // serve uploaded files
app.use("/api/upload", uploadRoute);


// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})