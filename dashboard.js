function showContent(contentId) {
    // Hide all content sections
    $(".content").hide();
    
    // Show the selected content section
    $("#" + contentId).show();
}

// for checkbox dropdown
$(".checkbox-menu").on("change", "input[type='checkbox']", function() {
    $(this).closest("li").toggleClass("active", this.checked);
 });
 
 $('.allow-focus').on('click', function(e) { e.stopPropagation(); });
 