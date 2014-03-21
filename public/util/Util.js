$.ajaxSetup({
    beforeSend: function(xhr) {
        xhr.setRequestHeader(
            'X-Requested-With',
            {
                toString: function() { return ''; }
            }
        );
    }
});