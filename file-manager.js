jQuery(document).ready(function($) {
    var currentDirectory = '';

    // Fetch and display files in the current directory
    function fetchFiles(directory) {
        $.post(ajaxurl, {
            action: 'sfm_list_files',
            directory: directory,
            security: sfm_upload_nonce
        }, function(response) {
            if (response.success) {
                var fileList = response.data;
                $('#file-list').html('');
                $('#current-directory').text(directory);

                fileList.forEach(function(file) {
                    var fileItem = $('<div class="file-item" data-file-path="'+ file.path +'" data-file-name="'+ file.name +'">' +
                        '<span>' + file.name + '</span>' +
                        (file.is_dir ? '<button class="open-dir">Open</button>' : '<button class="delete-file">Delete</button>') +
                        '</div>');
                    $('#file-list').append(fileItem);
                });

                currentDirectory = directory;
            } else {
                alert('Error: ' + response.data);
            }
        });
    }

    // Initial file fetch in base directory
    fetchFiles('');

    // Navigate to directory
    $('#file-list').on('click', '.open-dir', function() {
        var dirPath = $(this).closest('.file-item').data('file-path');
        fetchFiles(dirPath);
    });

    // Go up one directory
    $('#go-up').on('click', function() {
        if (currentDirectory !== '') {
            var parentDirectory = currentDirectory.substring(0, currentDirectory.lastIndexOf('/'));
            fetchFiles(parentDirectory);
        }
    });

    // File upload
    $('#upload-file').on('click', function() {
        var file_data = $('#file-upload').prop('files')[0];
        var form_data = new FormData();
        form_data.append('file', file_data);
        form_data.append('action', 'sfm_upload_file');
        form_data.append('current_directory', currentDirectory);
        form_data.append('security', sfm_upload_nonce);

        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: form_data,
            contentType: false,
            processData: false,
            success: function(response) {
                if (response.success) {
                    fetchFiles(currentDirectory); // Refresh file list
                } else {
                    alert(response.data);
                }
            }
        });
    });

    // File deletion
    $('#file-list').on('click', '.delete-file', function() {
        var fileItem = $(this).closest('.file-item');
        var fileUrl = fileItem.data('file-path');

        $.post(ajaxurl, {
            action: 'sfm_delete_file',
            file_path: fileUrl,
            security: sfm_upload_nonce
        }, function(response) {
            if (response.success) {
                fileItem.remove();
            } else {
                alert(response.data);
            }
        });
    });

    // Search functionality
    $('#file-search').on('keyup', function() {
        var search_term = $(this).val().toLowerCase();

        $('#file-list .file-item').each(function() {
            var fileName = $(this).data('file-name').toLowerCase();
            if (fileName.indexOf(search_term) !== -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});
