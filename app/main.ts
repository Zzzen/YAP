import { bootstrap }    from '@angular/platform-browser-dynamic';
import {remote} from "electron";

import {AppComponent} from "./app.component";


bootstrap(AppComponent);


remote.getCurrentWindow().addListener("enter-full-screen", () => remote.getCurrentWindow().setMenuBarVisibility(false));
remote.getCurrentWindow().addListener("leave-full-screen", () => remote.getCurrentWindow().setMenuBarVisibility(true));