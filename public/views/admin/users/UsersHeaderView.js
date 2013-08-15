//
//  UsersHeaderView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=UsersHeaderView.js
var app = app || {};

app.HeaderView = app.HeaderView.extend(
{
  el: '#header',

  template: _.template($('#tmpl-header').html()),

  findUsername: function()
  {
    return this.$el.find('[name="username"]').val();
  },

  addNew: function()
  {
    if (this.findUsername() === '')
      alert('Please enter a username.');
    else
    {
      this.model.save({ username: this.findUsername() },
      {
        success: function(model, response, options)
        {
          if (response.success)
          {
            model.id = response.record._id;
            location.href = model.url();
          }
          else
            alert(response.errors.join('\n'));
        }
      });
    }
  }
});
