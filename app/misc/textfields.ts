function checkBranch(input) {
    let regex = /^(?!@)(?!\/|.*([/.]\.|\/\/|@\{|\\\\))[^\000-\037\177 ~^:?*\\[]+(?<!\.lock|[/.])$/gi;
    //input.value = input.value.replace(regex, "");
    let result = regex.test(input.value);

    if (result) {
        $("#branch-btn").attr("disabled",false);
    } else {
        $("#branch-btn").attr("disabled",true);
    }
}

$(document).ready(function() {
    $('.masterTooltip').hover(function(){
        // Hover over code
        let title = $(this).attr('title');
        $(this).data('tipText', title).removeAttr('title');
        $('<p class="tooltip"></p>')
            .text(title)
            .appendTo('body')
            .fadeIn('slow');
        }, function() {
        // Hover out code
        $(this).attr('title', $(this).data('tipText'));
        $('.tooltip').remove();
    }).mousemove(function(e) {
        let mousex = e.pageX + 20; //Get X coordinates
        let mousey = e.pageY + 10; //Get Y coordinates
        $('.tooltip')
            .css({ top: mousey, left: mousex })
    });
});
