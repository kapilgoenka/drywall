//
//  EmailSender.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var EmailSender = module.exports;

var App = require('app').app,
    async = require('async'),
    emailjs = require('emailjs/email');

EmailSender.email = function(request, response, options)
{
  function renderText(callback)
  {
    response.render(options.textPath, options.locals, function(error, text)
    {
      if (error)
        return callback(error, null);

      options.text = text;
      return callback(null, 'done');
    });
  }

  function renderHtml(callback)
  {
    response.render(options.htmlPath, options.locals, function(error, html)
    {
      if (error)
        return callback(error, null);

      options.html = html;
      return callback(null, 'done');
    });
  }

  var renderers = [];

  if (options.textPath)
    renderers.push(renderText);

  if (options.htmlPath)
    renderers.push(renderHtml);

  // Render templates
  async.parallel(
    renderers,
    function(error, results)
    {
      if (error)
      {
        options.error('Email template render failed. ' + error);
        return;
      }

      // Build attachements
      var attachements = [];

      // HTML alternative
      if (options.html)
        attachements.push({ data: options.html, alternative: true });

      // Other attachments
      if (options.attachments)
      {
        for (var i = 0 ; i < options.attachments.length ; i++)
          attachements.push(options.attachments[i]);
      }

      // Send email
      var emailer = emailjs.server.connect( request.app.get('email-credentials') );

      var sendOptions =
      {
        from: options.from,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        text: options.text,
        attachment: attachements
      };

      emailer.send(sendOptions, function(error, message)
      {
        if (error)
        {
          options.error('Email failed to send. ' + error);
          return;
        }

        options.success(message);
        return;
      });
    }
  );
};
