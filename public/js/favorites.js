$(document).ready(function () {
    $(".buttonDelete").on("click", function (event) {
        event.preventDefault();
        var articleToDelete = $(this)
            .parents(".card")
            .data();
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

    $(".buttonNote").on("click", function (event) {
        event.preventDefault();
        // display the modal (unhide)
        // the modal out before pulling in data from the database
        $(".modal-title").empty();
        $("#note-div").empty();
        $(".userNotes").empty();
        $("#note-modal").modal("toggle");
        var article = $(this)
            .parents(".card")
            .data();
        $.ajax({
            method: "GET",
            url: "/api/headlines/" + article.id
        })
            .then(function (data) {
                $("#modal-title").append(data.title)
                $("#note-div").append("<textarea id='noteInput' placeholder='Add a new comment' name='body'></textarea>");
                $("#note-div").append("<button type='button' data-id='" + data._id + "' class='btn btn-success saveNote'>Save Note</button>");
                if (data.note) {
                    for (var i = 0; i < data.note.length; i++) {
                        $(".userNotes").append("<p class='allNotes'><strong>Comment: </strong>" + data.note[i].body + "<button type='button' data-id='" + data.note[i]._id + "' class='btn btn-danger deleteNote'>Delete Note</button>" + "</p>" + "<br>")
                    }
                }
            })
    });

    $(document).on("click", ".deleteNote", function (event) {
        event.preventDefault();
        var noteToDelete = $(this)
            .data();
        // Remove card from page
        $(this)
            .parents("p")
            .remove();
        // Using a patch method to be semantic since this is an update to an existing record in our collection
        $.ajax({
            method: "DELETE",
            url: "/api/notes/" + noteToDelete.id
        }).then(function (data) {

        });

    })
    $(document).on("click", ".saveNote", function (event) {
        event.preventDefault();
        if ($("#noteInput").val() === "") {
            alert("You must enter text in order to create a new note!")
        }
        else {
            // Grab the id associated with the article from the submit button
            var thisId = $(this).attr("data-id");

            // Run a POST request to change the note, using what's entered in the inputs
            $.ajax({
                method: "POST",
                url: "/api/headlines/" + thisId,
                data: {
                    // Value taken from note textarea
                    body: $("#noteInput").val()
                }
            })
                // With that done
                .then(function (data) {
                    // Log the response
                    $("#note-modal").modal("toggle");
                });
        }
    });

});