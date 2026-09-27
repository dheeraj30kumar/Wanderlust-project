const express = require("express");
const router = express.Router({mergeParams: true});
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js")
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isreviewauthor} = require("../middleware.js");
const reviewcontroller = require("../controllers/review.js")

router.post("/", isLoggedIn, validateReview, wrapAsync(reviewcontroller.createreview))

router.delete("/:reviewId",isLoggedIn, isreviewauthor, wrapAsync(reviewcontroller.destroyreview))

module.exports = router;