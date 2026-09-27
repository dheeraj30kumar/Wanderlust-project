require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("./models/listing");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({
    accessToken: mapToken
});

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function updateGeometry() {

    // Connect to MongoDB
    await mongoose.connect(MONGO_URL);

    console.log("Connected to MongoDB");

    // Find old listings which don't have geometry
    const listings = await Listing.find({
        geometry: { $exists: false }
    });

    console.log(`Found ${listings.length} listings without geometry`);

    // Update each listing
    for (let listing of listings) {

        console.log(`Finding location: ${listing.location}`);

        const response = await geocodingClient
            .forwardGeocode({
                query: listing.location,
                limit: 1
            })
            .send();

        // Check if Mapbox found the location
        if (response.body.features.length === 0) {
            console.log(`Location not found: ${listing.location}`);
            continue;
        }

        // Get geometry from Mapbox
        listing.geometry = response.body.features[0].geometry;

        // Save updated listing
        await listing.save();

        console.log(
            `Updated ${listing.title}:`,
            listing.geometry.coordinates
        );
    }

    console.log("All listings updated!");

    // Close MongoDB connection
    await mongoose.connection.close();
}

updateGeometry();