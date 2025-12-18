/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GLib from 'gi://GLib';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import Pango from 'gi://Pango';

import * as Extension from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';


// Inspired by https://github.com/KEIII/gnome-shell-panel-date-format/blob/master/extension.js
export default class UTCClockExtension extends Extension.Extension {
    #clock;
    #label;
    #existingClockDisplay;

    // Called on enablement and when screen unlocks.
    enable() {
        this.#clock = Main.panel.statusArea.dateMenu._clock.connect(
            'notify::clock',
            this.updateLabel,
        )

        this.#label = new St.Label({style_class: 'clock'})
        this.#label.clutter_text.y_align = Clutter.ActorAlign.CENTER;
        this.#label.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;

        this.updateLabel()

        this.#existingClockDisplay = Main.panel.statusArea.dateMenu._clockDisplay;
        this.#existingClockDisplay.hide();
        this.#existingClockDisplay.get_parent().insert_child_below(this.#label, this.#existingClockDisplay);
    }

    // Called on disablement or screen lock.
    disable() {
        Main.panel.statusArea.dateMenu._clock.disconnect(this.#clock)
        this.#clock = null;

        this.#existingClockDisplay.show();
        this.#existingClockDisplay.get_parent().remove_child(this.#label);
        this.#label.destroy();
        this.#label = null;
    }

    // This syntax is required for the #clock.connect() to work properly.
    updateLabel = () => {
        const d = new GLib.DateTime();
        const utc = d.to_utc();

        // Supported format characters: https://docs.gtk.org/glib/method.DateTime.format.html
        this.#label.set_text(`${d.format('%Y-%m-%d %H:%M %z')} (${utc.format('%H:%M UTC')})`);

        // Return true to keep looping.
        return true
    }
}
