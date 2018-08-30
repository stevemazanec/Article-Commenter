$(document).ready(function () {
    function handleArticleScrape() {
        // This function handles the user clicking any "scrape new article" buttons
        $.get("/api/scrape").then(function (data) {
            window.location = '/'
        });
    }


    function handleArticleClear() {
        $.get("/api/clear").then(function () {
            location.reload();
        });
    }

    $("#buttonScrape").on("click", function () {
        handleArticleScrape();
    })
    $(".buttonSave").on("click", function (event) {
        event.preventDefault();
        var articleToFavorite = $(this)
            .parents(".card")
            .data();
        articleToFavorite.favorite = true;
        // Using a patch method to be semantic since this is an update to an existing record in our collection
        $.ajax({
            method: "PUT",
            url: "/api/headlines/" + articleToFavorite.id,
            data: articleToFavorite
        }).then(function (data) {
            // If the data was saved successfully
            console.log(data);
        });
        $(this)
            .parents(".card")
            .remove();
    })
    $("#buttonClear").on("click", function () {
        handleArticleClear();
    })
    $("#buttonFavorite").on("click", function () {
        window.location = '/favorites'
    })
})

