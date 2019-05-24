# LaMetric Adapter

[![Build Status](https://travis-ci.org/tim-hellhake/lametric-adapter.svg?branch=master)](https://travis-ci.org/tim-hellhake/lametric-adapter)
[![dependencies](https://david-dm.org/tim-hellhake/lametric-adapter.svg)](https://david-dm.org/tim-hellhake/lametric-adapter)
[![devDependencies](https://david-dm.org/tim-hellhake/lametric-adapter/dev-status.svg)](https://david-dm.org/tim-hellhake/lametric-adapter?type=dev)
[![optionalDependencies](https://david-dm.org/tim-hellhake/lametric-adapter/optional-status.svg)](https://david-dm.org/tim-hellhake/lametric-adapter?type=optional)
[![license](https://img.shields.io/badge/license-MPL--2.0-blue.svg)](LICENSE)

Send notifications to your LaMetric.

## Configuration
1. Go to https://developer.lametric.com/user/devices to get your api key
2. Add the ip/hostame of your LaMetric and the api key to the config

## Usage
The addon registers a LaMetric device with a `notify(message)` action.

Currently, a rule can only trigger parameterless actions.

To send messages from a rule, you have to register an action with a predefined message.

Go to the settings of the addon and add a rule with a name and a message of your choice.

The LaMetric device now provides a new action with the specified name you can use in a rule.
