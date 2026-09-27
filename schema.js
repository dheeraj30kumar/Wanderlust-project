const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            filename: Joi.string().allow("", null),
            url: Joi.string().allow("", null)
        }).allow("", null),
        category: Joi.string().valid(
            "Trending",
            "Rooms",
            "Iconic Cities",
            "Castles",
            "Mountain",
            "Amazing Pools",
            "Camping",
            "Farm",
            "Arctic"
        ).required()
    }).required()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comments: Joi.string().required()
    }).required()
})