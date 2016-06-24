$.ajaxSetup({
    // Disable caching of AJAX responses
    cache: false
});

$(function() {
  var refreshTasks = function() {
    $.get('/tasks', function(tasks) {
      var target = $('ul#tasks').html('');
      tasks.forEach(function(task) {
        $('<li></li>').text(task.title + ' [' + new Date(task.created_on).toLocaleString() + ']').appendTo(target);
      });
    });
  };

  setTimeout(refreshTasks, 500);

  $('form').submit(function(event) {
    event.preventDefault();
    var task = $('input').val();
    $.post('/tasks?' + $.param({task: task}), function() {
      refreshTasks();
      $('input').val('');
      $('input').focus();
    });
  });

  $('#remove').click(function() {
    $.post('/remove-tasks', function() {
      refreshTasks();
    });
  });
});
