$(document).ready(function() {
    $('#loginButton').on('click', function(e) {
        e.preventDefault(); // Do not submit until I am ready

        $.ajax({
            type: "POST",
            url: "/",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({
                "username": $("#login").val(),
                "password": $("#password").val()
            }),
            success: function(result, status) {
                if (result.successful) {
                    window.location.href = '/map'; // This will navigate to wherever i say...
                }
                else {
                    // Show an error message or something and stay here
                    $('#message').html(result.message);
                    $('#message').show();
                }
            }
        });
    });

    // $('#continue').on('click', function(e){
    //     $.ajax({
    //         type: "POST",
    //         url: "/",
    //         dataType: "json",
    //         contentType: "application/json",
    //         data: JSON.stringify({
    //             "username": "hello",
    //             "password": "world"
    //         }),
    //         success: function(result, status) {
    //             if (result.successful) {
    //                 window.location.href = '/map';  // This will navigate to wherever i say...
    //             }
    //             else {
    //                 // Show an error message or something and stay here
    //                 $('#message').html(result.message);
    //                 $('#message').show();
    //             }
    //         },
    //         error: function(xhr, status, error) {
    //             err = eval("error: (" + xhr.responseText + ")");
    //             console.error(err);
    //         },
    //     });
    // })
});
