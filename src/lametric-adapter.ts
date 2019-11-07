/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

'use strict';

import fetch from 'node-fetch';

import { Adapter, Device } from 'gateway-addon';

const NOTIFICATION_ACTION_NAME = 'notify';

interface Message {
  name: string,
  message: string
}

export class LaMetricDevice extends Device {
  private config: any;
  private messages: { [key: string]: string };

  constructor(adapter: Adapter, manifest: any) {
    super(adapter, LaMetricDevice.name);
    this['@context'] = 'https://iot.mozilla.org/schemas/';
    this.name = manifest.display_name;
    this.description = manifest.description;
    this.config = manifest.moziot.config;
    const messages: Message[] = manifest.moziot.config.messages;

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

    if (messages) {
      for (const message of messages) {
        this.messages[message.name] = message.message;
        console.log(`Creating action for ${message.name}`);
        this.addNotificationAction(message.name);
      }
    }
  }

  addNotificationAction(name: string, input?: any) {
    const description: any = {
      title: name,
      description: 'Send message to LaMetric',
    };

    if (input) {
      description.input = input;
    }

    this.addAction(name, description);
  }

  async performAction(action: any) {
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

  async send(message: string) {
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

function notification(message: string) {
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

function check(name: string, s: string) {
  if (s && s.trim && s.trim() === '') {
    console.warn(`${name} not set`);
    return false;
  }

  return true;
}

function base64(s: string) {
  return Buffer.from(s, 'ascii').toString('base64');
}

export class LaMetricAdapter extends Adapter {
  constructor(addonManager: any, manifest: any) {
    super(addonManager, LaMetricAdapter.name, manifest.name);
    addonManager.addAdapter(this);
    const device = new LaMetricDevice(this, manifest);
    this.handleDeviceAdded(device);
  }
}
