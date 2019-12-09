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
                    $('#message').html(result.message).css("color", "red");
                    $('#message').show();
                }
            }, 
            error: function(xhr, status, message) {
                console.log("error: ", xhr.responseText); 
            }
        });
    });
    
    
    // time picker automatic dropdown 
    $('input.timepicker').timepicker({});
    
    $('.timepicker').timepicker({
        timeFormat: 'h:mm p',
        interval: 60,
        minTime: '10',
        maxTime: '6:00pm',
        defaultTime: '11',
        startTime: '10:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true
    });
});

$('#continue').on('click', function(e){
    $.ajax({
        type: "POST",
        url: "/",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
            "username": "hello",
            "password": "world"
        }),
        success: function(result, status) {
            if (result.successful) {
                window.location.href = '/map';  // This will navigate to wherever i say...
            }
        },
        error: function(xhr, status, error) {
            console.log("error: ", xhr.responseText); 
        },
    });
});