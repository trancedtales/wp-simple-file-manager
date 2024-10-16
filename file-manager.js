jQuery(document).ready(function($) {
    // File upload
    $('#upload-file').on('click', function() {
        var file_data = $('#file-upload').prop('files')[0];
        var form_data = new FormData();
        form_data.append('file', file_data);
        form_data.append('action', 'sfm_upload_file');
        form_data.append('security', sfm_upload_nonce);

        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: form_data,
            contentType: false,
            processData: false,
            success: function(response) {
                if (response.success) {
                    alert('File uploaded: ' + response.data.file_url);
                    $('#file-list').append('<div class="file-item" data-file-url="'+ response.data.file_url +'" data-file-name="'+ file_data.name +'">' + 
                        '<a href="'+ response.data.file_url +'" target="_blank">'+ file_data.name +'</a> ' +
                        '<button class="delete-file">Delete</button>' +
                        '</div>');
                } else {
                    alert(response.data);
                }
            }
        });
    });

    // File deletion
    $('#file-list').on('click', '.delete-file', function() {
        var file_item = $(this).closest('.file-item');
        var file_url = file_item.data('file-url');

        $.post(ajaxurl, {
            action: 'sfm_delete_file',
            file_path: file_url,
            security: sfm_upload_nonce
        }, function(response) {
            if (response.success) {
                alert('File deleted');
                file_item.remove();
            } else {
                alert(response.data);
            }
        });
    });

    // Search functionality
    $('#file-search').on('keyup', function() {
        var search_term = $(this).val().toLowerCase();

        $('#file-list .file-item').each(function() {
            var file_name = $(this).data('file-name').toLowerCase();
            if (file_name.indexOf(search_term) !== -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});
