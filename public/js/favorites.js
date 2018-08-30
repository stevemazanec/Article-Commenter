$(document).ready(function () {
    $(".buttonDelete").on("click", function (event) {
        event.preventDefault();
        var articleToDelete = $(this)
            .parents(".card")
            .data();
        console.log(articleToDelete);
        // Remove card from page
        $(this)
            .parents(".card")
            .remove();
        // Using a patch method to be semantic since this is an update to an existing record in our collection
        $.ajax({
            method: "DELETE",
            url: "/api/headlines/" + articleToDelete.id
        }).then(function (data) {

        });

    })

})