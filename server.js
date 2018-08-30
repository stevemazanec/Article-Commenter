var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Handlebars
app.engine("handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/ArticleCommenter";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
app.get("/api/scrape", function (req, res) {
    // First, we grab the body of the html with request
    axios.get("https://www.theringer.com/sports").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $(".c-entry-box--compact--article").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
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

app.get("/", function (req, res) {
    db.Article.find({ favorite: false })
        .then(function (dbArticle) {
            res.render("index", {
                pagetitle: "Home",
                css: "index.css",
                js: "index.js",
                article: dbArticle
            });
        });
});
app.get("/favorites", function (req, res) {
    db.Article.find({ favorite: true })
        .then(function (dbArticle) {
            res.render("favorites", {
                pagetitle: "Favorites",
                css: "favorites.css",
                js: "favorites.js",
                favorite: dbArticle
            });
        });
});

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

app.put("/api/headlines/:id", function (req, res) {
    console.log(req.body.id);
    db.Article.findOneAndUpdate(
        { _id: req.body.id },
        { favorite: req.body.favorite },
    ).then(function (data) {
    })
});


app.delete("/api/headlines/:id", function (req, res) {
    db.Article.deleteOne(
        { _id: req.params.id },
    ).then(function (data) {
    })
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});