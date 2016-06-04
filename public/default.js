$(function() {
  $.get('/tasks', function(tasks) {
    tasks.forEach(function(task) {
      $('<li></li>').text('#' +task.id + ': ' + task.title + ' [' + task.created_on + ']').appendTo('ul#tasks');
    });
  });

  $('form').submit(function(event) {
    event.preventDefault();
    var task = $('input').val();
    $.post('/tasks?' + $.param({task: task}), function() {
      $('<li></li>').text(task).appendTo('ul#tasks');
      $('input').val('');
      $('input').focus();
    });
  });

});
