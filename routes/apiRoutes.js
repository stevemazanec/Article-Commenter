var db = require("../models");

var axios = require("axios");
var cheerio = require("cheerio");

module.exports = function (app) {
    app.get("/api/scrape", function (req, res) {
        // First, we grab the body of the html with request
        axios.get("https://www.theringer.com/sports").then(function (response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(response.data);


            $(".c-entry-box--compact--article").each(function (i, element) {
                // Save an empty result object
                var result = {};

                // Add the title, link, summary (if exists), author, and image for each article
                result.title = $(this)
                    .children(".c-entry-box--compact__body").children(".c-entry-box--compact__title")
                    .text();
                result.link = $(this)
                    .children(".c-entry-box--compact__body").children(".c-entry-box--compact__title").children("a")
                    .attr("href");
                result.summary = $(this)
                    .children(".c-entry-box--compact__body").children("p")
                    .text();
                result.author = $(this)
                    .children(".c-entry-box--compact__body").children(".c-byline").children(".c-byline__item").children("a")
                    .text();
                result.image = $(this)
                    .children(".c-entry-box--compact__image-wrapper").children(".c-entry-box--compact__image").children("noscript")
                    .text();
                console.log(result);
                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        // If an error occurred, send it to the client
                        return res.json(err);
                    });
            });
        });

    });

    //Get route that deletes all the articles on the page from the database
    app.get("/api/clear", function (req, res) {
        db.Article.deleteMany({ favorite: false })
            .then(function (dbArticle) {
                res.render("index", {
                    pagetitle: "Home",
                    css: "index.css",
                    js: "index.js",
                    article: dbArticle
                });
            });
    })

    //When a user clicks on a specific article on the favorites page, this pulls up the article along with any associated notes
    app.get("/api/headlines/:id", function (req, res) {
        db.Article.findOne(
            { _id: req.params.id },
        ).populate("note")
            .then(function (article) {
                res.json(article);
            })
    });

    //This moves an article from the home page to the favorites page when a user clicks on the favorite button
    app.put("/api/headlines/:id", function (req, res) {
        db.Article.findOneAndUpdate(
            { _id: req.body.id },
            { favorite: req.body.favorite },
        ).then(function (data) {
        })
    });

    // Route for saving/updating an Article's associated Note
    app.post("/api/headlines/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry
        db.Note.create(req.body)
            .then(function (dbNote) {
                // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Push the new note to be associated with the article
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new: true });
            })
            .then(function (dbArticle) {
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });


    //This allows the user to delete a particular article from the favorites page
    app.delete("/api/headlines/:id", function (req, res) {
        db.Article.deleteOne(
            { _id: req.params.id },
        ).then(function (data) {
        })
    });

    //This allows the user to delete a note from an article
    app.delete("/api/notes/:id", function (req, res) {
        db.Note.deleteOne(
            { _id: req.params.id },
        ).then(function (data) {
        })
    });
}