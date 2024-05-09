/****************************
* JS Script for index.html
****************************/
function clearCard() {
    $('#getstudentName').text("");
    $('#getstudentId').text("");
    $('#getstudentGender').text("");
    $('#getstudentDOB').text("");
    $('#getstudentGraduated').text("");
    $('#message').text("");
    $('#editStudentForm')[0].reset();
    $('#editStudentForm').addClass('d-none');
}

function formattedDate(rfc3339Date) {
    var date = new Date(rfc3339Date);
    var day = date.getDate(); // day of the month
    var month = date.getMonth() + 1; // month (getMonth() returns 0-11, so add 1)
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    var year = date.getFullYear(); // year
    // format date as MM/DD/YYYY
    var formattedDate = year + '-' + month + '-' + day;
    return formattedDate;
    console.log(formattedDate);
}

// Function to call when 'No' is clicked
function noFunction() {
    $('#confirmModal').modal('hide');
}

// Add Student record to ledger
function createStudentRecord() {
    // Get form data
    var studentId = $('#studentId').val();
    var studentName = $('#studentName').val();
    var date = new Date($('#dateOfBirth').val())
    var dateOfBirth = date.toISOString();
    var gender = $('#gender').val();
    var graduationStatus = $('#graduationStatus').val();
    var data = {
        id: studentId,
        name: studentName,
        dateOfBirth: dateOfBirth,
        gender: gender,
        graduationStatus: graduationStatus
    };
    // Send a POST request to the server
    $.ajax({
        url: '/students', // replace with your URL
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (result) {
            // Show the modal
            var myModal = new bootstrap.Modal($('#successModal'), {});
            myModal.show();
        },
        error: function (error) {
            console.log(error);
        }
    }).always(function () {
        // This function is always called, regardless of whether the request was successful or not
        // Clear the form
        $('form')[0].reset();
        $('#confirmModal').modal('hide');
        $('#yesButton').off("click");
    });
}

// Remove a Student record from ledger
function deleteStudentRecord() {
    var studentId = $('#editstudentId').text(); // Get the value from the element
    $.ajax({
        url: 'students/' + studentId, // append the studentId to your API endpoint
        type: 'DELETE',
        success: function (result) {
            // Show the modal
            var myModal = new bootstrap.Modal($('#successModal'), {});
            myModal.show();
            console.log(result);
        },
        error: function (error) {
            // Handle error
            console.log(error);
        }
    }).always(function () {
        // This function is always called, regardless of whether the request was successful or not
        // Clear the card
        clearCard();
        $('#confirmModal').modal('hide');
        $('#yesButton').off("click");
    });
}

// Edit a Student record in the ledger
function updateStudentRecord() {
    var studentName = $('#editstudentName').val();
    var date = new Date($('#editdateOfBirth').val())
    var dateOfBirth = date.toISOString();
    var gender = $('#editgender').val();
    var graduationStatus = $('#editgraduationStatus').val();
    var data = {
        name: studentName,
        dateOfBirth: dateOfBirth,
        gender: gender,
        graduationStatus: graduationStatus
    };
    var studentId = $('#editstudentId').text();
    $.ajax({
        url: 'students/' + studentId, // append the studentId to your API endpoint
        type: 'PUT',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (result) {
            var myModal = new bootstrap.Modal($('#successModal'), {});
            myModal.show();
            clearCard()
            console.log(result);
        },
        error: function (error) {
            // Handle error
            console.log(error);
        }
    }).always(function () {
        // This function is always called, regardless of whether the request was successful or not
        // Clear the card
        clearCard();
        $('#confirmModal').modal('hide');
        $('#yesButton').off("click");
    });
}

$(document).ready(function () {
    //Add event Handlers
    // Event listener for when the modal is hidden
    $('#confirmModal').on('hidden.bs.modal', function () {
        var result = $('#confirmModal').data('result'); // Access the result from modal data
        console.log(result); // Outputs: true if 'Yes' was clicked, false if 'No' was clicked
    });
    // Attach event listeners to the buttons
    $('#noButton').click(noFunction);
    // Fetch all students and display them
    // Handle form submission
    $('#createstudentForm').on('submit', function (e) {
        e.preventDefault();
        $('#yesButton').off("click");
        $('#yesButton').click(createStudentRecord);
        $('#confirmModal').modal('show');
    });
    $('#getstudentForm').on('submit', function (e) {
        e.preventDefault();
        var searchId = $('#searchId').val();
        $.ajax({
            url: 'students/' + searchId,
            type: 'GET',
            success: function (data) {
                data = JSON.parse(data); // Parse into an object
                $('#editstudentId').text(data.id);
                $('#editstudentName').val(data.name);
                $('#editdateOfBirth').val(formattedDate(data.dateOfBirth));
                $('#editgender').val(data.gender);
                $('#editgraduationStatus').val(data.graduationStatus + "");
                $('#editStudentForm').removeClass('d-none');
            },
            error: function (error) {
                clearCard()
                $('#message').text("Not Found");
                console.log(error);
            }
        });
    });
    $('#deleteButton').click(function () {
        $('#yesButton').off("click");
        $('#yesButton').click(deleteStudentRecord);
        $('#confirmModal').modal('show');
    });
    $('#updateButton').click(function () {
        $('#yesButton').off("click");
        $('#yesButton').click(updateStudentRecord);
        $('#confirmModal').modal('show');
    });
});