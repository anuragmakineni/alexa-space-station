/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
'use strict';

const Alexa = require('alexa-sdk');
const request = require('request');
const APP_ID = undefined; //'amzn1.ask.skill.56599d56-7ffe-4177-84fe-a17d2c6b5af8';

const languageStrings = {
    'en': {
        translation: {
            SKILL_NAME: 'Space Station Helper',
            WELCOME_MESSAGE: 'Hello! Welcome to %s. You can make requests such as, where is the space station',
            WELCOME_REPROMT: 'For instructions on what you can say, please say help me.',
            LOCATION_MESSAGE: 'The international space station is currently at %s degrees latitude and %s degrees longitude.',
            PEOPLE_MESSAGE: 'There are currently %s people in space. ',
            HELP_MESSAGE: 'You can make requests such as, where is the space station',
            HELP_REPROMT: "You can say things like, where is the space station, or you can say exit...Now, what can I help you with?",
            NOT_FOUND: 'Sorry, I don\'t have any information on %s',
            STOP_MESSAGE: 'Goodbye!'
        },
    }
};

const handlers = {
    'LaunchRequest': function () {
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'StationLocation': function () {
        request({url: 'http://api.open-notify.org/iss-now.json', json: true}, function(err, res, json) {
          if (err) {
            throw err;
          }
          console.log(json);
          this.attributes.speechOutput = this.t('LOCATION_MESSAGE', json['iss_position']['latitude'], json['iss_position']['longitude']);
          this.emit(':tell', this.attributes.speechOutput);

        }.bind(this));
    },
    'PeopleInSpace': function () {
        request({url: 'http://api.open-notify.org/astros.json', json: true}, function(err, res, json) {
          if (err) {
            throw err;
          }
          console.log(json);
          this.attributes.speechOutput = this.t('PEOPLE_MESSAGE', json['number']);
          var len = json['people'].length

          for(var i = 0; i < len; i++) {
            console.log(i);

            if(i == len-1)
            {
                var st = 'and ' + json['people'][i]['name'] + ' on the ' + json['people'][i]['craft'] + '.'
            }
            else
            {
                var st = json['people'][i]['name'] + ' on the ' + json['people'][i]['craft'] + ', '
            }

            this.attributes.speechOutput += st
            console.log(st)
          }

          this.emit(':tell', this.attributes.speechOutput);

        }.bind(this));
    },
        'NumberInSpace': function () {
        request({url: 'http://api.open-notify.org/astros.json', json: true}, function(err, res, json) {
          if (err) {
            throw err;
          }
          console.log(json);
          this.attributes.speechOutput = this.t('PEOPLE_MESSAGE', json['number']);
          this.emit(':tell', this.attributes.speechOutput);

        }.bind(this));
    },
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
