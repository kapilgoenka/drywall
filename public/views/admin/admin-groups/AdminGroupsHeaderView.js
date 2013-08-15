//
//  AdminGroupsHeaderView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AdminGroupsHeaderView.js
var app = app || {};

app.HeaderView = app.HeaderView.extend(
{
  el: '#header',

  template: _.template($('#tmpl-header').html()),

  addNew: function()
  {
    console.log("foo!");
    if (this.findUsername() === '')
      alert('Please enter a name.');
    else
    {
      this.model.save({ name: this.findUsername() },
      {
        success: function(model, response, options)
        {
          if (response.success)
          {
            model.id = response.record._id;
            location.href = model.url();
          }
          else
          {
            alert(response.errors.join('\n'));
          }
        }
      });
    }
  }
});
