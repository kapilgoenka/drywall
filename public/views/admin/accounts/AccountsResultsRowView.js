//
//  AccountsResultsRowView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AccountsResultsRowView.js
var app = app || {};

app.ResultsRowView = app.ResultsRowView.extend(
{
  render: function()
  {
    this.$el.html(this.template(this.model.attributes));

    this.$el.find('.timeago').each(function(index, indexValue)
    {
      if (indexValue.innerText)
      {
        var myMoment = moment(indexValue.innerText);
        indexValue.innerText = myMoment.from();
        if (indexValue.getAttribute('data-age'))
          indexValue.innerText = indexValue.innerText.replace('ago', 'old');
      }
    });

    return this;
  }
});
