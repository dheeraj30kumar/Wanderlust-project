const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js")
const { isLoggedIn, isowner} = require("../middleware.js");
const {validatelisting} = require("../middleware.js");

const listingcontroller = require("../controllers/listing.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })

router.route("/")
    .get(wrapAsync(listingcontroller.index))
    .post(isLoggedIn, upload.single('listing[image]'), validatelisting, wrapAsync(listingcontroller.createlisting));
    

router.get("/new", isLoggedIn, listingcontroller.rendernewform)

router.route("/:id")
    .get(wrapAsync(listingcontroller.showlisting))
    .put(isLoggedIn, isowner, upload.single('listing[image]'), validatelisting, wrapAsync(listingcontroller.updatelisting))
    .delete(isLoggedIn, isowner, wrapAsync(listingcontroller.destroylisting));

router.get("/:id/edit", isLoggedIn, isowner, wrapAsync(listingcontroller.rendereditform));


module.exports = router;