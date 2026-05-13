import dotenv from "dotenv"
import mongoose from "mongoose"
import fs from "fs"
import csv from "csv-parser"
import path from "path"
import { fileURLToPath } from "url"
import Song from "./src/models/Song.js"

dotenv.config()

// Seed the MongoDB database with songs from the CSV file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log("Connected to MongoDB")

  const songs = []
  fs.createReadStream(path.join(__dirname, "data", "Spotify_final_dataset.csv"))
    .pipe(csv())
    .on("data", (row) => {
      if (!row["Song Name"]?.trim() || !row["Artist Name"]?.trim()) return
      songs.push({
        title: row["Song Name"].trim(),
        artist: row["Artist Name"].trim(),
        position: parseInt(row["Position"]) || null,
        daysReleased: parseInt(row["Days"]) || null,
        top10: parseFloat(row["Top 10 (xTimes)"]) || null,
        peakPosition: parseInt(row["Peak Position"]) || null,
        peakPositionTimes: row["Peak Position (xTimes)"]?.trim(),
        peakStreams: parseInt(row["Peak Streams"]) || null,
        totalStreams: parseInt(row["Total Streams"]) || null,
      })
    })
    .on("end", async () => {
      try {
        await Song.deleteMany({})
        await Song.insertMany(songs)
        console.log("Database seeded successfully")
      } catch (error) {
        console.error("Error seeding database:", error)
      } finally {
        mongoose.connection.close()
      }
    })
}

seed().catch(console.error)
