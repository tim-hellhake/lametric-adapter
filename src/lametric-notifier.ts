/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

'use strict';

import { Constants, Notifier, Outlet } from 'gateway-addon';

import { LaMetricDevice } from './lametric-adapter';

class LaMetricOutlet extends Outlet {
    constructor(notifier: Notifier, private device: LaMetricDevice) {
        super(notifier, device.id);
        this.name = device.name;
    }

    async notify(_title: string, message: string, _level: Constants.NotificationLevel) {
        this.device.send(message);
    }
}

export class LaMetricNotifier extends Notifier {
    constructor(addonManager: any, packageName: string, device: LaMetricDevice) {
        super(addonManager, device.id, packageName);

        addonManager.addNotifier(this);

        this.handleOutletAdded(
            new LaMetricOutlet(this, device)
        );
    }
}
