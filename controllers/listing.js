const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
    const { category, location } = req.query;

    let filter = {};

    if (category) {
        filter.category = category;
    }

    if (location) {
        filter.location = {
            $regex: location,
            $options: "i"
        };
    }

    const allListings = await Listing.find(filter);

    res.render("listings/index.ejs", { allListings });
};

module.exports.rendernewform = (req,res) => {
    console.log(req.user);
    res.render("listings/new.ejs")
}

module.exports.showlisting = async(req,res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews",
         populate: {
            path: "author",
         }}).populate("owner");
    if(!listing){
        req.flash("error", "listing you requested for does not exist");
        return res.redirect("/listings");
    }
    console.log(listing);
    
    res.render("listings/show.ejs", {listing})
}

module.exports.createlisting = async (req,res,next) => {
let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1
})
  .send()

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename}
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    
    req.flash("success", "new listing created")
    res.redirect("/listings")
}

module.exports.rendereditform = async(req,res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "listing you requested for does not exist");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_200,h_150,c_fill");
    res.render("listings/edit.ejs", {listing, originalImageUrl})
}

module.exports.updatelisting = async (req, res) => {
    let { id } = req.params;

    // Find listing
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }

    // Update title, description, price, location, country etc.
    Object.assign(listing, req.body.listing);

    // If location/city is updated
    if (req.body.listing.location) {

        let response = await geocodingClient
            .forwardGeocode({
                query: req.body.listing.location,
                limit: 1
            })
            .send();

        // Check if Mapbox found the new location
        if (response.body.features.length > 0) {

            listing.geometry =
                response.body.features[0].geometry;

        } else {

            req.flash("error", "Location could not be found");
            return res.redirect(`/listings/${id}/edit`);

        }
    }

    // If new image is uploaded
    if (req.file) {

        let url = req.file.path;
        let filename = req.file.filename;

        listing.image = {
            url,
            filename
        };
    }

    // Save everything
    await listing.save();

    req.flash("success", "Listing updated");

    res.redirect(`/listings/${id}`);
};

module.exports.destroylisting = async(req,res) => {
    let{id} = req.params;
    const deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success", "listing deleted")
    res.redirect("/listings")
    
}