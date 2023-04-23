function showContent(contentId) {
    // Hide all content sections
    $(".content").hide();
    
    // Show the selected content section
    $("#" + contentId).show();
}