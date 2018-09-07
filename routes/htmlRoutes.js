var db = require("../models");

module.exports = function (app) {
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
        db.Article.find({ favorite: true }).sort({ _id: -1 })
            .then(function (dbArticle) {
                res.render("favorites", {
                    pagetitle: "Favorites",
                    css: "favorites.css",
                    js: "favorites.js",
                    favorite: dbArticle
                });
            });
    });
}