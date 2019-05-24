/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

'use strict';

const fetch = require('node-fetch');

const {
  Adapter,
  Device,
} = require('gateway-addon');

const NOTIFICATION_ACTION_NAME = 'notify';

class LaMetricDevice extends Device {
  constructor(adapter, manifest) {
    super(adapter, LaMetricDevice.name);
    this['@context'] = 'https://iot.mozilla.org/schemas/';
    this.name = manifest.display_name;
    this.description = manifest.description;
    this.config = manifest.moziot.config;

    const messageInput = {
      type: 'object',
      properties: {
        message: {
          type: 'string'
        }
      }
    };

    this.addNotificationAction(NOTIFICATION_ACTION_NAME, messageInput);

    this.messages = {};

    if (this.config.messages) {
      for (const message of this.config.messages) {
        this.messages[message.name] = message.message;
        console.log(`Creating action for ${message.name}`);
        this.addNotificationAction(message.name);
      }
    }
  }

  addNotificationAction(name, input) {
    const description = {
      title: name,
      description: 'Send message to LaMetric',
    };

    if (input) {
      description.input = input;
    }

    this.addAction(name, description);
  }

  async performAction(action) {
    action.start();

    if (action.name === NOTIFICATION_ACTION_NAME) {
      await this.send(action.input.message);
    } else {
      const message = this.messages[action.name];

      if (message) {
        await this.send(message);
      } else {
        console.warn(`Unknown action ${action}`);
      }
    }

    action.finish();
  }

  async send(message) {
    const apiKey = this.config.apiKey;
    const hostname = this.config.hostname;
    console.log(`Sending message: ${message} to ${hostname}`);

    if (check('apiKey', apiKey) && check('hostname', hostname)) {
      await fetch(`http://${hostname}:8080/api/v2/device/notifications`, {
        method: 'post',
        body: JSON.stringify(notification(message)),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${base64(`dev:${apiKey}`)}`
        },
      });
    }
  }
}

function notification(message) {
  return {
    lifeTime: 2000,
    model: {
      frames: [
        {
          icon: 774,
          text: message
        }
      ]
    }
  };
}

function check(name, s) {
  if (s && s.trim && s.trim() === '') {
    console.warn(`${name} not set`);
    return false;
  }

  return true;
}

function base64(s) {
  return Buffer.from(s, 'ascii').toString('base64');
}

class LaMetricAdapter extends Adapter {
  constructor(addonManager, manifest) {
    super(addonManager, LaMetricAdapter.name, manifest.name);
    addonManager.addAdapter(this);
    const device = new LaMetricDevice(this, manifest);
    this.handleDeviceAdded(device);
  }
}

module.exports = LaMetricAdapter;
