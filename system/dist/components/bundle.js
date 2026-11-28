/* Tray UI — behaviours for the components. One classic script: it assigns window.TrayUI,
   loads nothing, and wires up elements that carry a data-tray attribute. Built from src/js by tools/build.py. */
(function () {
  'use strict';
  var UI = window.TrayUI = window.TrayUI || {};
  /* Icons: Lucide's (https://lucide.dev, ISC licence), from src/icons.json. Use <svg class="tray-icon"><use href="#tray-i-NAME"/></svg>. */
  UI.icons = {"chevron-down":"<path d=\"m6 9 6 6 6-6\"/>","chevron-up":"<path d=\"m18 15-6-6-6 6\"/>","chevron-left":"<path d=\"m15 18-6-6 6-6\"/>","chevron-right":"<path d=\"m9 18 6-6-6-6\"/>","chevrons-up-down":"<path d=\"m7 15 5 5 5-5\"/><path d=\"m7 9 5-5 5 5\"/>","arrow-left":"<path d=\"m12 19-7-7 7-7\"/><path d=\"M19 12H5\"/>","arrow-right":"<path d=\"M5 12h14\"/><path d=\"m12 5 7 7-7 7\"/>","arrow-up":"<path d=\"m5 12 7-7 7 7\"/><path d=\"M12 19V5\"/>","arrow-down":"<path d=\"M12 5v14\"/><path d=\"m19 12-7 7-7-7\"/>","arrow-up-right":"<path d=\"M7 7h10v10\"/><path d=\"M7 17 17 7\"/>","arrow-up-down":"<path d=\"m21 16-4 4-4-4\"/><path d=\"M17 20V4\"/><path d=\"m3 8 4-4 4 4\"/><path d=\"M7 4v16\"/>","check":"<path d=\"M20 6 9 17l-5-5\"/>","x":"<path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/>","plus":"<path d=\"M5 12h14\"/><path d=\"M12 5v14\"/>","minus":"<path d=\"M5 12h14\"/>","search":"<circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.3-4.3\"/>","menu":"<line x1=\"4\" x2=\"20\" y1=\"12\" y2=\"12\"/><line x1=\"4\" x2=\"20\" y1=\"6\" y2=\"6\"/><line x1=\"4\" x2=\"20\" y1=\"18\" y2=\"18\"/>","ellipsis":"<circle cx=\"12\" cy=\"12\" r=\"1\"/><circle cx=\"19\" cy=\"12\" r=\"1\"/><circle cx=\"5\" cy=\"12\" r=\"1\"/>","ellipsis-vertical":"<circle cx=\"12\" cy=\"12\" r=\"1\"/><circle cx=\"12\" cy=\"5\" r=\"1\"/><circle cx=\"12\" cy=\"19\" r=\"1\"/>","grip-vertical":"<circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"9\" cy=\"5\" r=\"1\"/><circle cx=\"9\" cy=\"19\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><circle cx=\"15\" cy=\"5\" r=\"1\"/><circle cx=\"15\" cy=\"19\" r=\"1\"/>","external-link":"<path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/>","link":"<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/>","copy":"<rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\"/><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"/>","pencil":"<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/><path d=\"m15 5 4 4\"/>","trash-2":"<path d=\"M3 6h18\"/><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"/><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"/><line x1=\"10\" x2=\"10\" y1=\"11\" y2=\"17\"/><line x1=\"14\" x2=\"14\" y1=\"11\" y2=\"17\"/>","download":"<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"7 10 12 15 17 10\"/><line x1=\"12\" x2=\"12\" y1=\"15\" y2=\"3\"/>","upload":"<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"17 8 12 3 7 8\"/><line x1=\"12\" x2=\"12\" y1=\"3\" y2=\"15\"/>","rotate-cw":"<path d=\"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/>","share":"<path d=\"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8\"/><polyline points=\"16 6 12 2 8 6\"/><line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"15\"/>","send":"<path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z\"/><path d=\"m21.854 2.147-10.94 10.939\"/>","house":"<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>","inbox":"<polyline points=\"22 12 16 12 14 15 10 15 8 12 2 12\"/><path d=\"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\"/>","layers":"<path d=\"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z\"/><path d=\"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65\"/><path d=\"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65\"/>","layout-grid":"<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\"/><rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\"/>","list":"<path d=\"M3 12h.01\"/><path d=\"M3 18h.01\"/><path d=\"M3 6h.01\"/><path d=\"M8 12h13\"/><path d=\"M8 18h13\"/><path d=\"M8 6h13\"/>","columns-2":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M12 3v18\"/>","panel-left":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M9 3v18\"/>","settings":"<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>","filter":"<polygon points=\"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3\"/>","calendar":"<path d=\"M8 2v4\"/><path d=\"M16 2v4\"/><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\"/><path d=\"M3 10h18\"/>","clock":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/>","bell":"<path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9\"/><path d=\"M10.3 21a1.94 1.94 0 0 0 3.4 0\"/>","bookmark":"<path d=\"m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z\"/>","flag":"<path d=\"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z\"/><line x1=\"4\" x2=\"4\" y1=\"22\" y2=\"15\"/>","tag":"<path d=\"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z\"/><circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/>","hash":"<line x1=\"4\" x2=\"20\" y1=\"9\" y2=\"9\"/><line x1=\"4\" x2=\"20\" y1=\"15\" y2=\"15\"/><line x1=\"10\" x2=\"8\" y1=\"3\" y2=\"21\"/><line x1=\"16\" x2=\"14\" y1=\"3\" y2=\"21\"/>","at-sign":"<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8\"/>","user":"<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/>","users":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/>","user-plus":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><line x1=\"19\" x2=\"19\" y1=\"8\" y2=\"14\"/><line x1=\"22\" x2=\"16\" y1=\"11\" y2=\"11\"/>","building":"<rect width=\"16\" height=\"20\" x=\"4\" y=\"2\" rx=\"2\" ry=\"2\"/><path d=\"M9 22v-4h6v4\"/><path d=\"M8 6h.01\"/><path d=\"M16 6h.01\"/><path d=\"M12 6h.01\"/><path d=\"M12 10h.01\"/><path d=\"M12 14h.01\"/><path d=\"M16 10h.01\"/><path d=\"M16 14h.01\"/><path d=\"M8 10h.01\"/><path d=\"M8 14h.01\"/>","mail":"<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\"/><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\"/>","phone":"<path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/>","message-square":"<path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"/>","mic":"<path d=\"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z\"/><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"/><line x1=\"12\" x2=\"12\" y1=\"19\" y2=\"22\"/>","megaphone":"<path d=\"m3 11 18-5v12L3 14v-3z\"/><path d=\"M11.6 16.8a3 3 0 1 1-5.8-1.6\"/>","life-buoy":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m4.93 4.93 4.24 4.24\"/><path d=\"m14.83 9.17 4.24-4.24\"/><path d=\"m14.83 14.83 4.24 4.24\"/><path d=\"m9.17 14.83-4.24 4.24\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/>","circle-help":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"/><path d=\"M12 17h.01\"/>","info":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/>","triangle-alert":"<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"/><path d=\"M12 9v4\"/><path d=\"M12 17h.01\"/>","circle-alert":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\"/><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\"/>","circle-check":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m9 12 2 2 4-4\"/>","circle-x":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m15 9-6 6\"/><path d=\"m9 9 6 6\"/>","circle":"<circle cx=\"12\" cy=\"12\" r=\"10\"/>","lock":"<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>","key":"<path d=\"m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4\"/><path d=\"m21 2-9.6 9.6\"/><circle cx=\"7.5\" cy=\"15.5\" r=\"5.5\"/>","shield":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"/>","shield-check":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"/><path d=\"m9 12 2 2 4-4\"/>","eye":"<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>","eye-off":"<path d=\"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49\"/><path d=\"M14.084 14.158a3 3 0 0 1-4.242-4.242\"/><path d=\"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143\"/><path d=\"m2 2 20 20\"/>","log-in":"<path d=\"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4\"/><polyline points=\"10 17 15 12 10 7\"/><line x1=\"15\" x2=\"3\" y1=\"12\" y2=\"12\"/>","log-out":"<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"/><polyline points=\"16 17 21 12 16 7\"/><line x1=\"21\" x2=\"9\" y1=\"12\" y2=\"12\"/>","credit-card":"<rect width=\"20\" height=\"14\" x=\"2\" y=\"5\" rx=\"2\"/><line x1=\"2\" x2=\"22\" y1=\"10\" y2=\"10\"/>","receipt-text":"<path d=\"M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z\"/><path d=\"M14 8H8\"/><path d=\"M16 12H8\"/><path d=\"M13 16H8\"/>","dollar-sign":"<line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"22\"/><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/>","percent":"<line x1=\"19\" x2=\"5\" y1=\"5\" y2=\"19\"/><circle cx=\"6.5\" cy=\"6.5\" r=\"2.5\"/><circle cx=\"17.5\" cy=\"17.5\" r=\"2.5\"/>","gift":"<rect x=\"3\" y=\"8\" width=\"18\" height=\"4\" rx=\"1\"/><path d=\"M12 8v13\"/><path d=\"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7\"/><path d=\"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5\"/>","shopping-bag":"<path d=\"M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z\"/><path d=\"M3 6h18\"/><path d=\"M16 10a4 4 0 0 1-8 0\"/>","package":"<path d=\"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z\"/><path d=\"M12 22V12\"/><path d=\"m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7\"/><path d=\"m7.5 4.27 9 5.15\"/>","truck":"<path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\"/><path d=\"M15 18H9\"/><path d=\"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14\"/><circle cx=\"17\" cy=\"18\" r=\"2\"/><circle cx=\"7\" cy=\"18\" r=\"2\"/>","map-pin":"<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/>","globe":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/>","file":"<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"/><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"/>","folder":"<path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\"/>","image":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"/>","paperclip":"<path d=\"m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48\"/>","book":"<path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\"/>","code":"<polyline points=\"16 18 22 12 16 6\"/><polyline points=\"8 6 2 12 8 18\"/>","terminal":"<polyline points=\"4 17 10 11 4 5\"/><line x1=\"12\" x2=\"20\" y1=\"19\" y2=\"19\"/>","database":"<ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\"/><path d=\"M3 5V19A9 3 0 0 0 21 19V5\"/><path d=\"M3 12A9 3 0 0 0 21 12\"/>","git-branch":"<line x1=\"6\" x2=\"6\" y1=\"3\" y2=\"15\"/><circle cx=\"18\" cy=\"6\" r=\"3\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><path d=\"M18 9a9 9 0 0 1-9 9\"/>","plug":"<path d=\"M12 22v-5\"/><path d=\"M9 8V2\"/><path d=\"M15 8V2\"/><path d=\"M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z\"/>","zap":"<path d=\"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z\"/>","sparkle":"<path d=\"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z\"/>","star":"<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\"/>","heart":"<path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/>","thumbs-up":"<path d=\"M7 10v12\"/><path d=\"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z\"/>","thumbs-down":"<path d=\"M17 14V2\"/><path d=\"M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z\"/>","chart-column":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\"/><path d=\"M18 17V9\"/><path d=\"M13 17V5\"/><path d=\"M8 17v-3\"/>","trending-up":"<polyline points=\"22 7 13.5 15.5 8.5 10.5 2 17\"/><polyline points=\"16 7 22 7 22 13\"/>","trending-down":"<polyline points=\"22 17 13.5 8.5 8.5 13.5 2 7\"/><polyline points=\"16 17 22 17 22 11\"/>","loader-circle":"<path d=\"M21 12a9 9 0 1 1-6.219-8.56\"/>","play":"<polygon points=\"6 3 20 12 6 21 6 3\"/>","pause":"<rect x=\"14\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/><rect x=\"6\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/>","volume-2":"<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\"/><path d=\"M16 9a5 5 0 0 1 0 6\"/><path d=\"M19.364 18.364a9 9 0 0 0 0-12.728\"/>","volume-x":"<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\"/><line x1=\"22\" x2=\"16\" y1=\"9\" y2=\"15\"/><line x1=\"16\" x2=\"22\" y1=\"9\" y2=\"15\"/>","captions":"<rect width=\"18\" height=\"14\" x=\"3\" y=\"5\" rx=\"2\" ry=\"2\"/><path d=\"M7 15h4M15 15h2M7 11h2M13 11h4\"/>","maximize":"<path d=\"M8 3H5a2 2 0 0 0-2 2v3\"/><path d=\"M21 8V5a2 2 0 0 0-2-2h-3\"/><path d=\"M3 16v3a2 2 0 0 0 2 2h3\"/><path d=\"M16 21h3a2 2 0 0 0 2-2v-3\"/>","minimize":"<path d=\"M8 3v3a2 2 0 0 1-2 2H3\"/><path d=\"M21 8h-3a2 2 0 0 1-2-2V3\"/><path d=\"M3 16h3a2 2 0 0 1 2 2v3\"/><path d=\"M16 21v-3a2 2 0 0 1 2-2h3\"/>","sun":"<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m17.66 17.66 1.41 1.41\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.34 17.66-1.41 1.41\"/><path d=\"m19.07 4.93-1.41 1.41\"/>","moon":"<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/>","monitor":"<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\"/><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\"/><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\"/>","bold":"<path d=\"M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8\"/>","italic":"<line x1=\"19\" x2=\"10\" y1=\"4\" y2=\"4\"/><line x1=\"14\" x2=\"5\" y1=\"20\" y2=\"20\"/><line x1=\"15\" x2=\"9\" y1=\"4\" y2=\"20\"/>","underline":"<path d=\"M6 4v6a6 6 0 0 0 12 0V4\"/><line x1=\"4\" x2=\"20\" y1=\"20\" y2=\"20\"/>","align-left":"<path d=\"M15 12H3\"/><path d=\"M17 18H3\"/><path d=\"M21 6H3\"/>","align-center":"<path d=\"M17 12H7\"/><path d=\"M19 18H5\"/><path d=\"M21 6H3\"/>","align-right":"<path d=\"M21 12H9\"/><path d=\"M21 18H7\"/><path d=\"M21 6H3\"/>"};
  /* ---------- Core: helpers, the icon sprite, registration ---------- */
  var inits = [];
  var seq = 0;
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }
  function uid(prefix) { seq += 1; return (prefix || 'tray') + '-' + seq; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function fire(el, name, detail) { el.dispatchEvent(new CustomEvent('tray:' + name, { bubbles: true, detail: detail })); }
  function icon(name, cls) { return '<svg class="tray-icon' + (cls ? ' ' + cls : '') + '" aria-hidden="true" focusable="false"><use href="#tray-i-' + name + '"/></svg>'; }

  UI.icon = icon;
  /* register(name, fn): fn(el) runs once for every element whose data-tray lists that name. */
  UI.register = function (name, fn) { inits.push([name, fn]); };
  /* upgrade(selector, fn): fn(el) runs once for every element that matches, with no data-tray of its own: what every
     instance of a part gets, such as the sliding pill of a segmented control. */
  UI.upgrade = function (selector, fn) { inits.push([selector, fn, true]); };
  /* init(root): wire up everything under root. Call it after adding markup to the page. */
  UI.init = function (root) {
    root = root || document;
    inits.forEach(function (pair) {
      var sel = pair[2] ? pair[0] : '[data-tray~="' + pair[0] + '"]';
      var els = $$(sel, root);
      if (root.matches && root.matches(sel)) els.unshift(root);
      els.forEach(function (el) {
        el.__tray = el.__tray || {};
        if (el.__tray[pair[0]]) return;
        el.__tray[pair[0]] = true;
        pair[1](el);
      });
    });
  };

  function sprite() {
    if (document.getElementById('tray-sprite')) return;
    var s = '<svg id="tray-sprite" xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true">';
    Object.keys(UI.icons).forEach(function (k) { s += '<symbol id="tray-i-' + k + '" viewBox="0 0 24 24">' + UI.icons[k] + '</symbol>'; });
    var wrap = document.createElement('div');
    wrap.innerHTML = s + '</svg>';
    document.body.insertBefore(wrap.firstChild, document.body.firstChild);
  }

  /* Arrow-key movement among the items of a list, menu or strip. */
  function rove(container, sel, opts) {
    opts = opts || {};
    container.addEventListener('keydown', function (e) {
      var items = $$(sel, container).filter(function (i) { return !i.disabled && i.getAttribute('aria-disabled') !== 'true' && i.offsetParent !== null; });
      var i = items.indexOf(document.activeElement);
      var prev = opts.horizontal ? 'ArrowLeft' : 'ArrowUp', next = opts.horizontal ? 'ArrowRight' : 'ArrowDown';
      if (opts.both && (e.key === 'ArrowLeft' || e.key === 'ArrowUp')) e = { key: prev, preventDefault: e.preventDefault.bind(e) };
      if (opts.both && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) e = { key: next, preventDefault: e.preventDefault.bind(e) };
      var to = -1;
      if (e.key === next) to = i < 0 ? 0 : (i + 1) % items.length;
      else if (e.key === prev) to = i < 0 ? items.length - 1 : (i - 1 + items.length) % items.length;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = items.length - 1;
      if (to < 0 || !items.length) return;
      e.preventDefault();
      items[to].focus();
    });
  }

  /* A panel that opens from a trigger and closes on Escape, on a click outside, or when asked. */
  function popup(trigger, panel, opts) {
    opts = opts || {};
    var open = false;
    function set(next, focusBack) {
      if (next === open) return;
      open = next;
      if (open) show(panel); else hide(panel);
      trigger.setAttribute('aria-expanded', String(open));
      if (open && opts.onOpen) opts.onOpen();
      if (!open && opts.onClose) opts.onClose();
      if (!open && focusBack) trigger.focus();
      fire(trigger, open ? 'open' : 'close');
    }
    if (!panel.hasAttribute('data-open')) panel.hidden = true; else { open = true; fit(panel); }
    trigger.setAttribute('aria-expanded', String(open));
    if (!opts.manual) trigger.addEventListener('click', function () { set(!open); });
    document.addEventListener('pointerdown', function (e) { if (open && !panel.contains(e.target) && !trigger.contains(e.target)) set(false); });
    /* Escape closes the panel and nothing else: the event stops here, and a dialog around the panel is not asked to close. */
    [trigger, panel].forEach(function (n) { n.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) { e.preventDefault(); e.stopPropagation(); set(false, true); } }); });
    /* Tab out of the trigger and the panel closes it: what is open follows the keyboard. A click on plain text inside the
       panel sends focus nowhere in particular, and leaves it open. */
    [trigger, panel].forEach(function (n) { n.addEventListener('focusout', function (e) { var to = e.relatedTarget; if (open && to && !panel.contains(to) && !trigger.contains(to)) set(false); }); });
    return { open: function () { set(true); }, close: function (back) { set(false, back); }, toggle: function () { set(!open); }, isOpen: function () { return open; } };
  }

  /* rescue(el, to): el is about to be hidden, removed or disabled. If focus is in it, focus moves to `to` (an element, or a
     function that gives one) first, so a keyboard user is not dropped to the top of the page. An element that cannot take
     focus is given tabindex="-1" for it. */
  function rescue(el, to) {
    var a = document.activeElement;
    if (!el || !a || (el !== a && !el.contains(a))) return;
    var t = typeof to === 'function' ? to() : to;
    if (!t || !t.focus || !t.isConnected) return;
    if (!t.matches('a[href], button, input, select, textarea, summary, [tabindex]')) t.setAttribute('tabindex', '-1');
    t.focus({ preventScroll: true });
  }
  UI.rescue = rescue;

  /* Run fn now, and again whenever the element's box changes: its first real layout may come after this script has started. */
  function watch(el, fn) {
    fn();
    if (window.ResizeObserver) new ResizeObserver(function () { fn(); }).observe(el);
    else window.addEventListener('load', fn);
  }

  /* ---------- Motion: things come in on their own (CSS @starting-style), and these help them go away ---------- */
  function calm() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  /* Can this browser keep a thing shown while it transitions to display: none? Firefox parses allow-discrete and does not. */
  var exits;
  function canExit() {
    if (exits !== undefined) return exits;
    if (!window.CSS || !CSS.supports('transition-behavior', 'allow-discrete') || !document.body) return false;
    var probe = document.createElement('div');
    probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = 'none';
    exits = getComputedStyle(probe).display === 'block';
    probe.remove();
    return exits;
  }
  function topLayerExit() { return !!(window.CSS && CSS.supports('overlay', 'auto')) && canExit(); }
  /* settle(el, fn): fn once every animation and transition in el has finished, or after a second at most. */
  function settle(el, fn) {
    var all = el.getAnimations ? el.getAnimations({ subtree: true }) : [];
    if (!all.length) { fn(); return; }
    Promise.race([Promise.allSettled(all.map(function (a) { return a.finished; })), new Promise(function (r) { setTimeout(r, 1000); })]).then(fn);
  }
  /* hide(el): el goes away with its exit transition, then is [hidden]. Where display cannot transition, data-closing runs
     the transition first. show(el) brings it back, and cancels a hide still running. */
  function hide(el) {
    if (el.hidden || el.hasAttribute('data-closing')) return;
    if (calm() || canExit()) { el.hidden = true; return; }
    el.setAttribute('data-closing', '');
    settle(el, function () { if (el.hasAttribute('data-closing')) { el.removeAttribute('data-closing'); el.hidden = true; } });
  }
  function show(el) { el.removeAttribute('data-closing'); el.hidden = false; fit(el); }

  /* side(panel): below its trigger, or above it when only the room above holds it (see fit). Measured without the entrance
     scale: offsetTop and offsetHeight, from the box of the anchor it is placed against. */
  function side(el) {
    if (el.hasAttribute('data-up')) { el.classList.remove('tray-pop--top'); el.removeAttribute('data-up'); }
    var host = el.offsetParent;
    if (!host || el.classList.contains('tray-pop--top') || el.classList.contains('tray-pop--side') || el.parentElement.matches('.tray-submenu, .tray-context')) return;
    var gap = 8, room = document.documentElement.clientHeight, top = host.getBoundingClientRect().top + host.clientTop, h = el.offsetHeight;
    var away = el.offsetTop - host.clientHeight; /* from the trigger's bottom to the panel's top, the same gap it keeps above */
    if (top + el.offsetTop + h + gap > room && top - away - h >= gap) { el.classList.add('tray-pop--top'); el.setAttribute('data-up', ''); }
  }
  /* fit(panel): a floating panel (.tray-pop) that CSS places under its trigger, and that would leave the window sideways,
     moves back inside it, 8px from the edge, but never past the other edge: by a margin on the side it is placed from.
     It is measured without its entrance scale (offsetLeft, offsetWidth), and fitted again when the window changes size or
     the font arrives. A panel that fits is left where CSS put it.
     As it opens it also chooses a side: a panel that does not fit in the window below its trigger, but does above it,
     opens upward, as tray-pop--top does (marked data-up, so the next opening chooses again from where the trigger is
     then). It stays below when it fits on neither side, since the page can scroll down to it but not above its own top.
     This happens before focus moves into the panel, which would scroll the page to it. A panel the markup placed itself
     (tray-pop--top, --side, a submenu's, a context menu's) keeps its place, and an open panel does not change sides when
     the window changes size. */
  var fitting = false;
  function fit(el, again) {
    if (!el || !el.classList || !el.classList.contains('tray-pop')) return;
    if (!fitting) {
      fitting = true;
      var all = function () { $$('.tray-pop').forEach(function (p) { if (!p.hidden) fit(p, true); }); };
      window.addEventListener('resize', all);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(all);
    }
    if (!again && !el.hidden) side(el);
    el.style.marginLeft = el.style.marginRight = '';
    var host = el.offsetParent;
    if (el.hidden || !host) return;
    var gap = 8, room = document.documentElement.clientWidth;
    function left() { return host.getBoundingClientRect().left + host.clientLeft + el.offsetLeft; }
    var l = left(), w = el.offsetWidth, dx = 0;
    if (l + w > room - gap) dx = room - gap - (l + w);
    if (l + dx < gap) dx = gap - l;
    if (Math.abs(dx) < 1) return;
    el.style.marginLeft = dx + 'px';
    /* placed from its right edge (tray-pop--end, or the start of a right-to-left page), a left margin does not move it */
    if (Math.abs(left() - (l + dx)) > 1) { el.style.marginLeft = ''; el.style.marginRight = -dx + 'px'; }
  }
  /* shut(dialog, value): a dialog goes away with its exit transition, then closes. */
  function shut(d, value) {
    if (!d.open || d.hasAttribute('data-closing')) return;
    if (calm() || topLayerExit()) { d.close(value); return; }
    d.setAttribute('data-closing', '');
    settle(d, function () { if (d.hasAttribute('data-closing')) { d.removeAttribute('data-closing'); d.close(value); } });
  }
  /* glide(strip, current): a pill behind the strip's chosen item that slides to the next one chosen. current() gives the
     chosen item. The pill slides when the choice moves; it is placed at once the first time, and when the strip changes
     size while it is not sliding (a slide under way just takes the new place as its end). A strip whose items are written
     anew (innerHTML, a framework's render) keeps its pill, which slides from the old choice to the new one. Returns
     place(), to call when the choice may have changed. */
  function glide(strip, current) {
    var pill = document.createElement('span'), at = null;
    pill.className = 'tray-glide';
    pill.setAttribute('aria-hidden', 'true');
    strip.insertBefore(pill, strip.firstChild);
    function place() {
      if (pill.parentNode !== strip) strip.insertBefore(pill, strip.firstChild);
      var item = current();
      if (!item || !item.offsetWidth) { strip.removeAttribute('data-glide'); at = null; return; }
      var b = strip.getBoundingClientRect(), r = item.getBoundingClientRect();
      strip.toggleAttribute('data-glide-still', !at || (item === at && !pill.getAnimations().length));
      strip.setAttribute('data-glide', '');
      pill.style.setProperty('--tray-glide-x', (r.left - b.left - strip.clientLeft + strip.scrollLeft) + 'px');
      pill.style.setProperty('--tray-glide-y', (r.top - b.top - strip.clientTop) + 'px');
      pill.style.setProperty('--tray-glide-w', r.width + 'px');
      pill.style.setProperty('--tray-glide-h', r.height + 'px');
      at = item;
      if (strip.hasAttribute('data-glide-still')) requestAnimationFrame(function () { requestAnimationFrame(function () { strip.removeAttribute('data-glide-still'); }); });
    }
    watch(strip, place);
    if (window.MutationObserver) new MutationObserver(function () { place(); }).observe(strip, { childList: true });
    return place;
  }

  /* ---------- Actions and forms ---------- */

  /* A busy button (aria-busy="true" while its work runs) ignores presses: a second click, Enter or Space, or Enter in a
     field of its form, does not send it again, and a busy link does not go. It keeps focus and its place in the Tab order,
     which `disabled` would take away. Every .tray-btn gets this; presses come through again once aria-busy goes. */
  UI.upgrade('.tray-btn', function (btn) {
    btn.addEventListener('click', function (e) {
      if (btn.getAttribute('aria-busy') !== 'true') return;
      e.preventDefault();
      e.stopImmediatePropagation();
    }, true);
  });

  /* Toggle: data-tray="toggle" on a button with aria-pressed. */
  UI.register('toggle', function (btn) {
    if (!btn.hasAttribute('aria-pressed')) btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      fire(btn, 'change', { pressed: on });
    });
  });

  /* A checkbox written as mixed: data-indeterminate on the <input>. The mixed state is a property of the element, with no
     attribute of its own, so markup alone cannot set it; this sets it once, as the page loads. A click clears it, as the
     browser does, and the attribute goes with it, so the markup no longer claims it. */
  UI.upgrade('input[type="checkbox"][data-indeterminate]', function (input) {
    input.indeterminate = true;
    input.addEventListener('change', function () { input.removeAttribute('data-indeterminate'); }, { once: true });
  });

  /* Stepper: data-tray="stepper" on a button group holding [data-step] buttons and an <output>. */
  UI.register('stepper', function (root) {
    var out = $('output', root), min = +(root.dataset.min || 0), max = +(root.dataset.max || 99), value = +(out.textContent || min);
    function set(v) {
      var was = value;
      value = clamp(v, min, max);
      out.textContent = String(value);
      /* the number bumps when it changes: two names for one animation, so each change starts it again */
      if (value !== was) out.setAttribute('data-bump', out.getAttribute('data-bump') === 'a' ? 'b' : 'a');
      $$('[data-step]', root).forEach(function (b) {
        var off = (+b.dataset.step < 0 && value <= min) || (+b.dataset.step > 0 && value >= max);
        /* the button that reaches the limit has focus: the group takes it, or disabling the button would drop focus to the page */
        if (off) rescue(b, root);
        b.disabled = off;
      });
      fire(root, 'change', { value: value });
    }
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-step]'); if (b) set(value + (+b.dataset.step)); });
    set(value);
  });

  /* Input OTP: data-tray="otp" on the row of one-character inputs. */
  UI.register('otp', function (root) {
    var cells = $$('input', root);
    function done() {
      var code = cells.map(function (c) { return c.value; }).join('');
      if (code.length === cells.length) fire(root, 'complete', { value: code });
    }
    /* What a cell keeps: digits while it is numeric (the default), else letters and digits. A code written "123-456" or
       "AB 12" loses its hyphens and spaces, so no cell holds a separator and no character of the code is pushed out. */
    function clean(cell, text) {
      return String(text || '').replace(cell.getAttribute('inputmode') === 'numeric' ? /\D/g : /[\s!-\/:-@\[-`{-~·‐-―−]/g, '');
    }
    /* A code that comes in one go fills the cells from cell i on, and focus goes to the cell after its last character. */
    function spread(i, text) {
      text.split('').slice(0, cells.length - i).forEach(function (ch, k) { cells[i + k].value = ch; });
      cells[Math.min(cells.length - 1, i + text.length)].focus();
      done();
    }
    /* aria-invalid is not announced on a group, so the group's aria-invalid and aria-describedby are copied to every cell,
       now and whenever they change: each cell is then read as invalid, with the error. */
    function mirror() {
      cells.forEach(function (c) {
        ['aria-invalid', 'aria-describedby'].forEach(function (a) { var v = root.getAttribute(a); if (v === null) c.removeAttribute(a); else c.setAttribute(a, v); });
      });
    }
    mirror();
    if (window.MutationObserver) new MutationObserver(mirror).observe(root, { attributes: true, attributeFilter: ['aria-invalid', 'aria-describedby'] });
    cells.forEach(function (cell, i) {
      cell.setAttribute('inputmode', cell.getAttribute('inputmode') || 'numeric');
      /* No maxlength: a phone that fills in the code from the message (autocomplete="one-time-code") puts the whole code
         in the first cell, and maxlength would cut it to one character. The input handler keeps one per cell. */
      cell.removeAttribute('maxlength');
      cell.setAttribute('aria-label', 'Character ' + (i + 1) + ' of ' + cells.length);
      /* a key the cell does not take (a hyphen, a letter in a numeric cell) changes nothing */
      cell.addEventListener('beforeinput', function (e) { if (e.inputType === 'insertText' && e.data && !clean(cell, e.data)) e.preventDefault(); });
      cell.addEventListener('input', function (e) {
        var text = clean(cell, cell.value), key = e.data && e.data.length === 1 ? clean(cell, e.data) : null;
        /* where the browser let a refused key in, the cell keeps what it held and focus stays */
        if (key === '') { cell.value = text.slice(0, 1); return; }
        /* one key pressed in a cell that already held a character: the new one replaces it */
        if (text.length > 1 && key) text = key;
        if (text.length > 1) { spread(i, text); return; }
        cell.value = text;
        if (text && cells[i + 1]) cells[i + 1].focus();
        done();
      });
      cell.addEventListener('keydown', function (e) {
        /* the cells always run left to right (the code keeps its order in a right-to-left page): the arrows go by the
           side of the screen, back and forth along that row */
        var rtl = getComputedStyle(root).direction === 'rtl', back = rtl ? 'ArrowRight' : 'ArrowLeft', forth = rtl ? 'ArrowLeft' : 'ArrowRight';
        if (e.key === 'Backspace' && !cell.value && cells[i - 1]) { cells[i - 1].focus(); cells[i - 1].value = ''; e.preventDefault(); }
        if (e.key === back && cells[i - 1]) { e.preventDefault(); cells[i - 1].focus(); }
        if (e.key === forth && cells[i + 1]) { e.preventDefault(); cells[i + 1].focus(); }
      });
      cell.addEventListener('focus', function () { cell.select(); });
      cell.addEventListener('paste', function (e) {
        var text = clean(cell, e.clipboardData.getData('text'));
        if (!text) return;
        e.preventDefault();
        spread(i, text);
      });
    });
  });

  /* Slider: data-tray="slider" on <input type="range">. Fills the track and writes the value to the field's <output>.
     The value is read once, from the slider itself as it moves (with its unit, in aria-valuetext). An <output> is a
     status region and would read it a second time, so the one beside the label is for the eye alone: aria-hidden. */
  UI.register('slider', function (input) {
    var field = input.closest('.tray-slider-field'), out = field && $('output', field), unit = input.dataset.unit || '';
    if (out) out.setAttribute('aria-hidden', 'true');
    function paint() {
      var min = +(input.min || 0), max = +(input.max || 100);
      input.style.setProperty('--tray-v', ((+input.value - min) / (max - min) * 100) + '%');
      if (out) out.textContent = input.value + unit;
      /* a screen reader reads the bare number of a range input: aria-valuetext gives it the unit as well, "30 km" */
      if (unit) input.setAttribute('aria-valuetext', (input.value + unit).trim());
    }
    input.addEventListener('input', paint);
    paint();
  });

  /* Character count: data-tray="count" on a textarea with maxlength; updates .tray-field__count in its field. */
  UI.register('count', function (area) {
    var out = $('.tray-field__count', area.closest('.tray-field')), max = area.getAttribute('maxlength');
    function paint() { if (out) out.textContent = area.value.length + (max ? ' / ' + max : ''); }
    area.addEventListener('input', paint);
    paint();
  });

  /* Reveal: data-tray="reveal" on a button inside an input group shows and hides a password. */
  UI.register('reveal', function (btn) {
    var input = $('input', btn.closest('.tray-input-group'));
    /* The name stays "Show password" and aria-pressed carries the state: a name that changed as well would be read as
       "Hide password, pressed". */
    if (!btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', 'Show password');
    btn.setAttribute('aria-pressed', 'false');
    function set(show) {
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
      btn.innerHTML = icon(show ? 'eye-off' : 'eye');
    }
    btn.addEventListener('click', function () { set(input.type === 'password'); });
    /* A password shown stays a password field where it matters: as the form is sent (so the browser treats it as one,
       to save it and not to keep it as text), and on a page brought back by Back from the browser's cache. */
    function conceal() { if (input.type !== 'password') set(false); }
    if (input.form) input.form.addEventListener('submit', conceal);
    window.addEventListener('pageshow', function (e) { if (e.persisted) conceal(); });
  });

  /* What names a control, as ids for aria-labelledby: its own aria-labelledby; else the control itself, when an
     aria-label names it; else its <label>s, given ids for it. Empty when only its content names it. */
  function labelIds(el) {
    var ids = (el.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean);
    if (ids.length) return ids;
    if (el.getAttribute('aria-label')) { el.id = el.id || uid('tray-named'); return [el.id]; }
    return [].slice.call(el.labels || []).map(function (l) { l.id = l.id || uid('tray-label'); return l.id; });
  }
  /* A list or a panel that opens from a control is named as the control is ("City"), so a screen reader says which one it
     has entered. Call it before nameWithValue, so the name is the label alone. */
  function nameLike(panel, control) {
    if (panel.hasAttribute('aria-label') || panel.hasAttribute('aria-labelledby')) return;
    var ids = labelIds(control);
    if (ids.length) panel.setAttribute('aria-labelledby', ids.join(' '));
  }
  /* A trigger that shows its value is named by its label and by that value, "Jar size 50 g": a label names a button in
     place of its content, so the value would go unheard. With no label, the content names it, value and all. */
  function nameWithValue(trigger, valueEl) {
    var ids = labelIds(trigger);
    if (!ids.length || !valueEl) return;
    valueEl.id = valueEl.id || uid('tray-value');
    if (ids.indexOf(valueEl.id) < 0) ids.push(valueEl.id);
    trigger.setAttribute('aria-labelledby', ids.join(' '));
  }

  /* The words of an option, what a filter looks in: its text, its two lines apart ("Anna Melnyk Packing", not "Anna
     MelnykPacking"), and not the keys of a shortcut beside it (tray-option__meta). */
  function optionWords(o) {
    var box = $('.tray-option__text', o) || o, text = '';
    [].forEach.call(box.childNodes, function (n) {
      if (n.nodeType === 3) text += n.textContent;
      else if (n.nodeType === 1 && !n.matches('.tray-option__meta, .tray-keys, kbd, svg')) text += /^(B|STRONG|SMALL|DIV|P)$/.test(n.tagName) ? ' ' + n.textContent + ' ' : n.textContent;
    });
    return text.replace(/\s+/g, ' ').trim();
  }
  /* A status line read politely, written only when its words change: the same words again are not read again. */
  function quietStatus(parent) {
    var line = document.createElement('span');
    line.className = 'tray-vh';
    line.setAttribute('role', 'status');
    parent.appendChild(line);
    return function (words) { if (line.textContent !== words) line.textContent = words; };
  }

  /* Select: data-tray="select" on the anchor that holds a .tray-select-trigger and a .tray-pop of [role=option]. A group of
     options is a role="group" named by its .tray-list__label. */
  UI.register('select', function (root) {
    var trigger = $('.tray-select-trigger', root), panel = $('.tray-pop', root);
    var valueEl = $('.tray-select-trigger__value', trigger), hidden = $('input[type="hidden"]', root);
    function options() { return $$('[role="option"]', panel); }
    panel.setAttribute('role', 'listbox');
    panel.id = panel.id || uid('tray-listbox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-controls', panel.id);
    nameLike(panel, trigger);
    nameWithValue(trigger, valueEl);
    options().forEach(function (o) { o.setAttribute('tabindex', '-1'); if (!o.hasAttribute('aria-selected')) o.setAttribute('aria-selected', 'false'); });
    var pop = popup(trigger, panel, { onOpen: function () { var cur = $('[aria-selected="true"]', panel) || options()[0]; if (cur) cur.focus(); } });
    function choose(opt) {
      options().forEach(function (o) { o.setAttribute('aria-selected', String(o === opt)); });
      var text = $('.tray-option__text', opt);
      valueEl.textContent = opt.dataset.label || (text ? text.textContent : opt.textContent).trim();
      trigger.removeAttribute('data-placeholder');
      if (hidden) hidden.value = opt.dataset.value || '';
      fire(root, 'change', { value: opt.dataset.value });
      pop.close(true);
    }
    panel.addEventListener('click', function (e) { var o = e.target.closest('[role="option"]'); if (o && o.getAttribute('aria-disabled') !== 'true') choose(o); });
    rove(panel, '[role="option"]');
    trigger.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); pop.open(); } });
    /* Shift+Tab from an option would land on the trigger, which counts as inside, and leave the list open: it closes the
       list as Tab does, and focus goes to the trigger, as in a menu. */
    panel.addEventListener('keydown', function (e) { if (e.key === 'Tab' && e.shiftKey && pop.isOpen()) { e.preventDefault(); pop.close(true); } });
    /* A letter goes to the next option that starts with it, after the one in focus, and round to the first again: the
       same letter pressed again walks through them. An option that is off is passed over. */
    panel.addEventListener('keydown', function (e) {
      if (e.key.length !== 1 || e.key === ' ' || e.ctrlKey || e.metaKey || e.altKey) return;
      var live = options().filter(function (o) { return !o.disabled && o.getAttribute('aria-disabled') !== 'true'; });
      var hits = live.filter(function (o) { return o.textContent.trim().toLowerCase().indexOf(e.key.toLowerCase()) === 0; });
      var from = live.indexOf(document.activeElement);
      var hit = hits.filter(function (o) { return live.indexOf(o) > from; })[0] || hits[0];
      if (hit) hit.focus();
    });
  });

  /* Combobox: data-tray="combobox" on the anchor that holds an input and a .tray-pop of [role=option]. */
  UI.register('combobox', function (root) {
    var input = $('input', root), panel = $('.tray-pop', root), empty = $('.tray-list__empty', panel), active = null;
    function options() { return $$('[role="option"]', panel); }
    function visible() { return options().filter(function (o) { return !o.hidden; }); }
    panel.setAttribute('role', 'listbox');
    panel.id = panel.id || uid('tray-listbox');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', panel.id);
    input.setAttribute('autocomplete', 'off');
    nameLike(panel, input);
    options().forEach(function (o) { o.id = o.id || uid('tray-option'); o.setAttribute('tabindex', '-1'); });
    /* The no-match sentence sits in the list, where nothing reads it while focus is in the input: a status line beside
       the list says it as it appears, once, and not again at every key while nothing still matches. */
    var tell = quietStatus(root);
    var pop = popup(input, panel, { manual: true, onClose: function () { tell(''); } });
    function setActive(o) {
      if (active) active.removeAttribute('data-active');
      active = o || null;
      if (active) { active.setAttribute('data-active', ''); input.setAttribute('aria-activedescendant', active.id); if (active.scrollIntoView) active.scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    }
    function filter() {
      var q = input.value.trim().toLowerCase(), shown = 0;
      options().forEach(function (o) { var hit = !q || optionWords(o).toLowerCase().indexOf(q) >= 0; o.hidden = !hit; if (hit) shown += 1; });
      if (empty) { empty.hidden = shown > 0; tell(shown ? '' : empty.textContent.trim()); }
      /* With nothing to match the panel holds only the sentence, which is no listbox (a listbox holds options): it is
         hidden from screen readers, which hear the sentence through the status line, and the input is not expanded. */
      if (shown) panel.removeAttribute('aria-hidden'); else panel.setAttribute('aria-hidden', 'true');
      if (pop.isOpen()) input.setAttribute('aria-expanded', String(shown > 0));
      setActive(visible()[0]);
    }
    function choose(o) {
      options().forEach(function (x) { x.setAttribute('aria-selected', String(x === o)); });
      var text = $('.tray-option__text', o);
      input.value = o.dataset.label || (text ? text.textContent : o.textContent).trim();
      fire(root, 'change', { value: o.dataset.value });
      pop.close();
    }
    input.addEventListener('click', function () { pop.open(); filter(); });
    input.addEventListener('input', function () { pop.open(); filter(); });
    input.addEventListener('keydown', function (e) {
      var vis = visible(), i = vis.indexOf(active);
      if (e.key === 'ArrowDown') { e.preventDefault(); if (!pop.isOpen()) { pop.open(); filter(); } else setActive(vis[(i + 1) % vis.length]); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (pop.isOpen()) setActive(vis[(i - 1 + vis.length) % vis.length]); }
      else if (e.key === 'Enter' && active && pop.isOpen()) { e.preventDefault(); choose(active); }
    });
    panel.addEventListener('pointerdown', function (e) { e.preventDefault(); });
    panel.addEventListener('click', function (e) { var o = e.target.closest('[role="option"]'); if (o) choose(o); });
    if (empty) empty.hidden = true;
    if (panel.hasAttribute('data-open')) filter();
  });

  /* Calendar: TrayUI.calendar(el, options) or data-tray="calendar" with data-mode, data-months, data-value,
     data-min, data-max, data-month, data-today, data-week-start, data-locale, data-prev-label and data-next-label (the
     names of the month buttons, in the page's language). Dates are YYYY-MM-DD; a range is start/end. */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseDate(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +(p[2] || 1)); }
  UI.formatDate = function (value, locale) {
    var fmt = new Intl.DateTimeFormat(locale || 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    var parts = String(value).split('/');
    if (parts.length === 2 && parts[1] && fmt.formatRange) return fmt.formatRange(parseDate(parts[0]), parseDate(parts[1]));
    return fmt.format(parseDate(parts[0]));
  };
  UI.calendar = function (el, opts) {
    opts = opts || {};
    var d = el.dataset;
    function opt(key, attr, fallback) { return opts[key] != null ? opts[key] : (d[attr || key] != null ? d[attr || key] : fallback); }
    var mode = opt('mode', null, 'single'), months = +opt('months', null, 1), weekStart = +opt('weekStart', null, 1), locale = opt('locale', null, 'en-GB');
    var prevLabel = opt('prevLabel', null, 'Previous month'), nextLabel = opt('nextLabel', null, 'Next month');
    var today = parseDate(opt('today', null, iso(new Date())));
    var min = opt('min') ? parseDate(opt('min')) : null, max = opt('max') ? parseDate(opt('max')) : null;
    var start = null, end = null;
    var initial = String(opt('value', null, '')).split('/');
    if (initial[0]) start = parseDate(initial[0]);
    if (initial[1]) end = parseDate(initial[1]);
    var seed = opt('month') ? parseDate(opt('month') + '-01') : (start || today);
    var view = new Date(seed.getFullYear(), seed.getMonth(), 1);
    var monthFmt = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
    var dowFmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    var dayFmt = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var focusIso = null;
    /* The month shown is said when a month button turns the page, since focus stays on the button: a polite line beside
       the grid, kept while the grid is drawn again. (A key that turns the page moves focus to a day, whose name holds
       its month.) */
    var said = document.createElement('span');
    said.className = 'tray-vh';
    said.setAttribute('aria-live', 'polite');

    function value() { return !start ? '' : (mode === 'range' ? iso(start) + '/' + (end ? iso(end) : '') : iso(start)); }
    function render(keepFocus) {
      var html = '';
      var tab = focusIso || (start && iso(start)) || iso(today);
      for (var m = 0; m < months; m += 1) {
        var first = new Date(view.getFullYear(), view.getMonth() + m, 1);
        html += '<div class="tray-cal__month"><div class="tray-cal__head">' +
          '<button type="button" class="tray-cal__nav" data-nav="-1" aria-label="' + esc(prevLabel) + '"' + (m > 0 ? ' data-ghost' : '') + '>' + icon('chevron-left', 'tray-icon--flip') + '</button>' +
          '<div class="tray-cal__title">' + esc(monthFmt.format(first)) + '</div>' +
          '<button type="button" class="tray-cal__nav" data-nav="1" aria-label="' + esc(nextLabel) + '"' + (m < months - 1 ? ' data-ghost' : '') + '>' + icon('chevron-right', 'tray-icon--flip') + '</button></div>' +
          '<div class="tray-cal__grid">';
        for (var w = 0; w < 7; w += 1) html += '<span class="tray-cal__dow" aria-hidden="true">' + esc(dowFmt.format(new Date(2024, 0, 1 + ((weekStart + w + 6) % 7))).slice(0, 2)) + '</span>';
        var offset = (first.getDay() - weekStart + 7) % 7;
        for (var c = 0; c < 42; c += 1) {
          var day = new Date(first.getFullYear(), first.getMonth(), 1 - offset + c), key = iso(day);
          var outside = day.getMonth() !== first.getMonth();
          if (outside && months > 1) { html += '<span></span>'; continue; }
          var isStart = start && key === iso(start), isEnd = end && key === iso(end);
          var attrs = ' data-date="' + key + '" aria-label="' + esc(dayFmt.format(day)) + '" tabindex="' + (key === tab && !outside ? '0' : '-1') + '"';
          if (outside) attrs += ' data-outside';
          if (key === iso(today)) attrs += ' data-today';
          if (isStart || isEnd) attrs += ' aria-pressed="true"'; else attrs += ' aria-pressed="false"';
          if (start && end && iso(start) !== iso(end)) {
            if (isStart) attrs += ' data-start';
            if (isEnd) attrs += ' data-end';
            if (day > start && day < end) attrs += ' data-in-range';
          }
          if ((min && day < min) || (max && day > max)) attrs += ' disabled';
          html += '<button type="button" class="tray-cal__day"' + attrs + '><span class="tray-cal__num">' + day.getDate() + '</span></button>';
        }
        html += '</div></div>';
      }
      var box = $(':scope > .tray-cal__months', el);
      if (!box) { el.textContent = ''; box = document.createElement('div'); box.className = 'tray-cal__months'; el.appendChild(box); el.appendChild(said); }
      box.innerHTML = html;
      if (!$('[tabindex="0"]', el)) { var firstDay = $('.tray-cal__day:not([data-outside]):not(:disabled)', el); if (firstDay) firstDay.setAttribute('tabindex', '0'); }
      if (keepFocus && focusIso) { var target = $('[data-date="' + focusIso + '"]:not([data-outside])', el); if (target) target.focus(); }
    }
    function pick(day) {
      if (mode !== 'range') { start = day; end = null; }
      else if (!start || end) { start = day; end = null; }
      else if (day < start) { start = day; }
      else { end = day; }
      focusIso = iso(day);
      if (day.getMonth() !== view.getMonth() && months === 1) view = new Date(day.getFullYear(), day.getMonth(), 1);
      render(true);
      fire(el, 'change', { value: value(), complete: mode !== 'range' || !!end });
    }
    el.classList.add('tray-cal');
    el.addEventListener('click', function (e) {
      var nav = e.target.closest('[data-nav]'), day = e.target.closest('.tray-cal__day');
      if (nav) {
        view = new Date(view.getFullYear(), view.getMonth() + (+nav.dataset.nav), 1); focusIso = null; render();
        var again = $('[data-nav="' + nav.dataset.nav + '"]:not([data-ghost])', el); if (again) again.focus();
        said.textContent = $$('.tray-cal__title', el).map(function (t) { return t.textContent; }).join(', ');
      }
      else if (day && !day.disabled) pick(parseDate(day.dataset.date));
    });
    /* The same day n months on, or the last day of that month when it is shorter (31 January, then 28 February). */
    function monthsOn(d, n) { var last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate(); return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last)); }
    /* The keys of a date picker's grid, as the ARIA practices set them: the arrows by a day and a week, Home and End to
       the start and the end of the week, Page Up and Page Down by a month, with Shift by a year. Past min or max an
       arrow stays put, and the other keys stop at the limit. */
    el.addEventListener('keydown', function (e) {
      var day = e.target.closest && e.target.closest('.tray-cal__day');
      if (!day) return;
      /* in a right-to-left page the week runs from right to left, so the left arrow goes on to the next day */
      var back = getComputedStyle(el).direction === 'rtl' ? 1 : -1;
      var step = { ArrowLeft: back, ArrowRight: -back, ArrowUp: -7, ArrowDown: 7 }[e.key];
      var from = parseDate(day.dataset.date), to = null, dow = (from.getDay() - weekStart + 7) % 7;
      if (step) to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + step);
      else if (e.key === 'Home' || e.key === 'End') to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + (e.key === 'Home' ? -dow : 6 - dow));
      else if (e.key === 'PageUp' || e.key === 'PageDown') to = monthsOn(from, (e.key === 'PageUp' ? -1 : 1) * (e.shiftKey ? 12 : 1));
      if (!to) return;
      e.preventDefault();
      if ((min && to < min) || (max && to > max)) { if (step) return; to = min && to < min ? min : max; }
      focusIso = iso(to);
      var lastShown = new Date(view.getFullYear(), view.getMonth() + months, 0);
      if (to < view) view = new Date(to.getFullYear(), to.getMonth(), 1);
      else if (to > lastShown) view = new Date(to.getFullYear(), to.getMonth() - months + 1, 1);
      render(true);
    });
    el.addEventListener('pointerover', function (e) {
      var day = e.target.closest && e.target.closest('.tray-cal__day');
      if (mode !== 'range' || !start || end || !day) return;
      $$('.tray-cal__day', el).forEach(function (b) { var k = b.dataset.date; b.toggleAttribute('data-in-range', k > iso(start) && k <= day.dataset.date); });
    });
    render();
    el.__calendar = {
      value: value,
      set: function (v) { var p = String(v || '').split('/'); start = p[0] ? parseDate(p[0]) : null; end = p[1] ? parseDate(p[1]) : null; if (start) view = new Date(start.getFullYear(), start.getMonth(), 1); focusIso = null; render(); }
    };
    return el.__calendar;
  };
  UI.register('calendar', function (el) { UI.calendar(el); });

  /* Date picker: data-tray="datepicker" on the anchor that holds a .tray-select-trigger and a .tray-pop with a calendar.
     Optional inside the panel: [data-preset="7"] (the last N days), [data-clear], [data-apply]. */
  UI.register('datepicker', function (root) {
    var trigger = $('.tray-select-trigger', root), panel = $('.tray-pop', root), calEl = $('[data-tray~="calendar"]', panel);
    var valueEl = $('.tray-select-trigger__value', trigger), hidden = $('input[type="hidden"]', root), apply = $('[data-apply]', panel);
    var placeholder = valueEl.textContent, locale = calEl.dataset.locale || 'en-GB';
    UI.init(panel);
    var cal = calEl.__calendar;
    /* the panel is the dialog that aria-haspopup promises, named as the field is */
    panel.setAttribute('role', 'dialog');
    panel.id = panel.id || uid('tray-dialog');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', panel.id);
    nameLike(panel, trigger);
    /* a trigger with no label is named by its own words, and its dialog by the trigger */
    if (!panel.hasAttribute('aria-label') && !panel.hasAttribute('aria-labelledby')) { trigger.id = trigger.id || uid('tray-named'); panel.setAttribute('aria-labelledby', trigger.id); }
    nameWithValue(trigger, valueEl);
    function toDay() { var t = $('.tray-cal__day[tabindex="0"]', calEl); if (t) t.focus(); }
    var pop = popup(trigger, panel, { onOpen: toDay });
    /* the down arrow opens the panel too, as on a Select, or goes into it when it is open */
    trigger.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); if (pop.isOpen()) toDay(); else pop.open(); } });
    function show(v) {
      var complete = v && (v.indexOf('/') < 0 || v.split('/')[1]);
      valueEl.textContent = complete ? UI.formatDate(v, locale) : (v ? UI.formatDate(v.split('/')[0], locale) + ' – …' : placeholder);
      trigger.toggleAttribute('data-placeholder', !v);
      if (hidden) hidden.value = v || '';
    }
    calEl.addEventListener('tray:change', function (e) {
      show(e.detail.value);
      if (e.detail.complete && !apply) pop.close(true);
    });
    panel.addEventListener('click', function (e) {
      var preset = e.target.closest('[data-preset]');
      if (preset) {
        var end = parseDate(calEl.dataset.today || iso(new Date())), start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (+preset.dataset.preset - 1));
        cal.set(iso(start) + '/' + iso(end)); show(cal.value());
      }
      if (e.target.closest('[data-clear]')) { cal.set(''); show(''); }
      if (e.target.closest('[data-apply]')) pop.close(true);
    });
    show(cal.value());
  });

  /* ---------- Display: resizable split, carousel, lightbox, video player ---------- */

  /* Resizable: data-tray="split" on .tray-split holding pane, handle, pane. data-min and data-max limit the first pane (percent). */
  UI.register('split', function (root) {
    var handle = $('.tray-split__handle', root), first = root.firstElementChild, vertical = root.classList.contains('tray-split--v');
    var min = +(root.dataset.min || 20), max = +(root.dataset.max || 80), size = +(root.dataset.size || 50);
    /* set(v, atLoad): the size set up at load is no change, so it fires nothing (a page that keeps the size the person
       chose would otherwise keep the default as their choice) */
    function set(v, atLoad) {
      size = clamp(v, min, max);
      first.setAttribute('data-size', '');
      first.style.flexBasis = size + '%';
      handle.setAttribute('aria-valuenow', String(Math.round(size)));
      if (!atLoad) fire(root, 'change', { size: size });
    }
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-orientation', vertical ? 'horizontal' : 'vertical');
    handle.setAttribute('aria-valuemin', String(min));
    handle.setAttribute('aria-valuemax', String(max));
    if (!handle.hasAttribute('aria-label')) handle.setAttribute('aria-label', 'Resize the panes');
    handle.addEventListener('pointerdown', function (e) {
      handle.setPointerCapture(e.pointerId);
      var box = root.getBoundingClientRect();
      /* the direction the split is laid out in, as the keys read it: a dir="ltr" part of a right-to-left page is ltr */
      var rtl = !vertical && getComputedStyle(root).direction === 'rtl';
      function move(ev) {
        if (vertical) set((ev.clientY - box.top) / box.height * 100);
        else set((rtl ? box.right - ev.clientX : ev.clientX - box.left) / box.width * 100);
      }
      function up() { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); }
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
    });
    handle.addEventListener('keydown', function (e) {
      /* right to left the first pane is on the right: the arrows follow the handle, not the numbers */
      var rtl = !vertical && getComputedStyle(root).direction === 'rtl';
      var back = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft', forth = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
      if (e.key === back) { e.preventDefault(); set(size - 2); }
      else if (e.key === forth) { e.preventDefault(); set(size + 2); }
      else if (e.key === 'Home') { e.preventDefault(); set(min); }
      else if (e.key === 'End') { e.preventDefault(); set(max); }
    });
    set(size, true);
  });

  /* Carousel: data-tray="carousel" on .tray-carousel holding a track of slides, [data-prev], [data-next] and a count. */
  UI.register('carousel', function (root) {
    var track = $('.tray-carousel__track', root), prev = $('[data-prev]', root), next = $('[data-next]', root), count = $('.tray-carousel__count', root);
    function slides() { return $$('.tray-carousel__slide', track); }
    function index() {
      var list = slides(), at = Math.abs(track.scrollLeft), best = 0;
      function gap(i) { return Math.abs(Math.abs(list[i].offsetLeft - list[0].offsetLeft) - at); }
      list.forEach(function (s, i) { if (gap(i) < gap(best)) best = i; });
      return best;
    }
    function paint() {
      var i = index(), n = slides().length, end = Math.abs(track.scrollLeft) + track.clientWidth >= track.scrollWidth - 2;
      /* The count is the first slide in view, until the track can go no further: with several slides in view the last
         ones are then in view too, and the count says the last, "5 / 5", as Next turns off. */
      if (count) count.textContent = (end && i > 0 ? n : i + 1) + ' / ' + n;
      /* a button that turns off at an end while it has focus hands it to the other one, or to the track. The other one
         turns on first: one step can cross the whole track (a wide one that shows most slides at once), from an end where
         that button was off itself, and a button that is still off cannot take focus. */
      if (prev && i > 0) prev.disabled = false;
      if (next && !end) next.disabled = false;
      if (prev && i === 0) rescue(prev, next && !end ? next : track);
      if (next && end) rescue(next, prev && i > 0 ? prev : track);
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = end;
    }
    function go(step) {
      var list = slides(), to = list[clamp(index() + step, 0, list.length - 1)];
      var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      track.scrollTo({ left: to.offsetLeft - list[0].offsetLeft, behavior: calm ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', paint, { passive: true });
    track.setAttribute('tabindex', '0');
    track.addEventListener('keydown', function (e) {
      /* right to left the next slide is on the left */
      var rtl = getComputedStyle(track).direction === 'rtl', step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
      if (step) { e.preventDefault(); go(step); }
    });
    watch(track, paint);
  });

  /* Lightbox: data-tray="lightbox" on a gallery of links to the full pictures, data-target="#id" naming its <dialog
     class="tray-lightbox">. The dialog's row of pictures is made from the links the first time one is opened: each picture
     is the link's href, its text the thumbnail's alt, its caption the link's data-caption. Without the script a link opens
     its picture. The row is the browser's own scroll with snapping, so swipe, trackpad and arrow keys move through it; the
     buttons step one picture, the count follows the scroll, and a status line says where you are once the scroll settles. */
  UI.register('lightbox', function (gallery) {
    var dialog = document.querySelector(gallery.dataset.target);
    if (!dialog) return;
    var track = $('.tray-lightbox__track', dialog), prev = $('[data-prev]', dialog), next = $('[data-next]', dialog);
    var count = $('.tray-lightbox__count', dialog), status = $('[role="status"]', dialog), of = dialog.dataset.of || 'of';
    var links = $$('a[href]', gallery), made = false, settled = -1, pending = -1, frame = 0, timer = 0;
    function make() {
      if (made) return;
      made = true;
      /* the track is a list, so each picture stays a list item; the slide inside it is the group, named "2 of 6" */
      track.innerHTML = links.map(function (a, i) {
        var img = $('img', a), cap = a.dataset.caption || '';
        return '<li class="tray-lightbox__slide">' +
          '<figure role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' ' + esc(of) + ' ' + links.length + '"><img src="' + esc(a.href) + '" alt="' + esc(img ? img.alt : '') + '" decoding="async"' + (i ? ' loading="lazy"' : '') + '>' +
          (cap ? '<figcaption>' + esc(cap) + '</figcaption>' : '') + '</figure></li>';
      }).join('');
      track.setAttribute('tabindex', '0');
    }
    function rtl() { return getComputedStyle(track).direction === 'rtl'; }
    function index() { return clamp(Math.round(Math.abs(track.scrollLeft) / (track.clientWidth || 1)), 0, links.length - 1); }
    function go(i, now) {
      pending = clamp(i, 0, links.length - 1);
      paint();
      track.scrollTo({ left: (rtl() ? -1 : 1) * pending * track.clientWidth, behavior: now ? 'instant' : undefined });
    }
    function paint() {
      var i = pending >= 0 ? pending : index(), had = document.activeElement;
      count.textContent = (i + 1) + ' / ' + links.length;
      prev.disabled = i === 0;
      next.disabled = i === links.length - 1;
      /* a button that has just turned off hands the focus to the other one */
      if (had === prev && prev.disabled) next.focus();
      if (had === next && next.disabled) prev.focus();
    }
    function settle() {
      var i = index();
      pending = -1;
      paint();
      if (dialog.open && i !== settled && settled >= 0) {
        var cap = links[i].dataset.caption;
        status.textContent = (i + 1) + ' ' + of + ' ' + links.length + (cap ? ': ' + cap : '');
      }
      settled = i;
    }
    track.addEventListener('scroll', function () {
      if (!frame && pending < 0) frame = requestAnimationFrame(function () { frame = 0; paint(); });
      if (!('onscrollend' in window)) { clearTimeout(timer); timer = setTimeout(settle, 120); }
    }, { passive: true });
    track.addEventListener('scrollend', settle);
    prev.addEventListener('click', function () { go((pending >= 0 ? pending : index()) - 1); });
    next.addEventListener('click', function () { go((pending >= 0 ? pending : index()) + 1); });
    dialog.addEventListener('keydown', function (e) {
      if (e.target.closest('input, textarea, select')) return;
      var back = rtl() ? 'ArrowRight' : 'ArrowLeft', on = rtl() ? 'ArrowLeft' : 'ArrowRight', at = pending >= 0 ? pending : index();
      var to = e.key === back ? at - 1 : e.key === on ? at + 1 : e.key === 'Home' ? 0 : e.key === 'End' ? links.length - 1 : -2;
      if (to === -2) return;
      e.preventDefault();
      go(to);
    });
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;  // a new tab or window gets the picture itself
        e.preventDefault();
        make();
        status.textContent = '';
        dialog.showModal();
        settled = i;
        go(i, true);
        pending = -1;
      });
    });
    dialog.addEventListener('close', function () { settled = -1; });
    /* the window changes size: stay on the same picture */
    if (window.ResizeObserver) new ResizeObserver(function () { if (dialog.open && settled >= 0) track.scrollTo({ left: (rtl() ? -1 : 1) * settled * track.clientWidth, behavior: 'instant' }); }).observe(track);
  });

  /* Video player: data-tray="player" on .tray-player holding a <video controls> and a bar of controls: [data-play] (the
     bar's button and the large one), [data-seek] (a range), [data-now] and [data-total], [data-captions], [data-mute] and
     [data-full]. The behaviour takes the browser's controls off and runs the bar; a button whose name changes with the state
     reads its names from data-label-*. A control the video cannot use (captions without a track, full screen where the
     browser has none) is hidden. */
  UI.register('player', function (root) {
    var v = $('video', root);
    if (!v) return;
    var plays = $$('[data-play]', root), seek = $('[data-seek]', root), now = $('[data-now]', root), total = $('[data-total]', root);
    var mute = $('[data-mute]', root), cc = $('[data-captions]', root), full = $('[data-full]', root), of = root.dataset.of || 'of', dragging = false;
    var big = $('.tray-player__big', root), barPlay = plays.filter(function (b) { return b !== big; })[0];
    function time(s) { s = Math.max(0, Math.floor(s || 0)); var h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, r = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(r).padStart(2, '0'); }
    function label(b, on, offName, onName, offIcon, onIcon) {
      if (!b) return;
      b.setAttribute('aria-label', on ? (b.dataset[onName] || '') : (b.dataset[offName] || ''));
      var use = $('use', b);
      if (use) use.setAttribute('href', '#tray-i-' + (on ? onIcon : offIcon));
    }
    function state() {
      var playing = !v.paused && !v.ended;
      root.toggleAttribute('data-playing', playing);
      plays.forEach(function (b) {
        b.dataset.labelPlay = b.dataset.labelPlay || b.getAttribute('aria-label') || 'Play';
        b.dataset.labelPause = b.dataset.labelPause || 'Pause';
        label(b, playing, 'labelPlay', 'labelPause', 'play', 'pause');
      });
      if (mute) {
        mute.dataset.labelMute = mute.dataset.labelMute || mute.getAttribute('aria-label') || 'Mute';
        mute.dataset.labelUnmute = mute.dataset.labelUnmute || 'Unmute';
        label(mute, v.muted, 'labelMute', 'labelUnmute', 'volume-2', 'volume-x');
      }
    }
    function clock() {
      var d = isFinite(v.duration) ? v.duration : 0;
      if (now) now.textContent = time(v.currentTime);
      if (total) total.textContent = time(d);
      if (seek && !dragging) {
        seek.max = String(d || 0);
        seek.value = String(v.currentTime);
        seek.style.setProperty('--tray-v', (d ? v.currentTime / d * 100 : 0) + '%');
      }
      if (seek) seek.setAttribute('aria-valuetext', time(v.currentTime) + ' ' + of + ' ' + time(d));
    }
    function toggle() { if (v.paused || v.ended) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }
    v.controls = false;
    root.setAttribute('data-ready', '');
    plays.forEach(function (b) { b.addEventListener('click', toggle); });
    v.addEventListener('click', toggle);
    /* the large button goes once the film starts: focus on it moves to the bar's play button first */
    v.addEventListener('play', function () { rescue(big, barPlay || seek); root.setAttribute('data-started', ''); state(); });
    v.addEventListener('ended', function () { root.removeAttribute('data-started'); state(); });
    ['pause', 'playing', 'volumechange'].forEach(function (n) { v.addEventListener(n, state); });
    ['timeupdate', 'loadedmetadata', 'durationchange', 'seeked'].forEach(function (n) { v.addEventListener(n, clock); });
    if (seek) {
      seek.addEventListener('input', function () {
        dragging = true;
        v.currentTime = +seek.value;
        seek.style.setProperty('--tray-v', (+seek.max ? +seek.value / +seek.max * 100 : 0) + '%');
        clock();
      });
      seek.addEventListener('change', function () { dragging = false; clock(); });
      /* The range's step is fine for dragging, too fine for a key: an arrow moves five seconds (mirrored right to left),
         Page Up and Page Down a tenth of the film. Home and End are the range's own. */
      seek.addEventListener('keydown', function (e) {
        var d = isFinite(v.duration) ? v.duration : 0, rtl = getComputedStyle(seek).direction === 'rtl';
        var by = { ArrowRight: rtl ? -5 : 5, ArrowLeft: rtl ? 5 : -5, ArrowUp: 5, ArrowDown: -5, PageUp: d / 10, PageDown: -d / 10 }[e.key];
        if (!by || !d) return;
        e.preventDefault();
        v.currentTime = clamp(v.currentTime + by, 0, d);
        clock();
      });
    }
    if (mute) mute.addEventListener('click', function () { v.muted = !v.muted; });
    /* captions: one toggle with a constant name, pressed while they show */
    var track = v.textTracks && v.textTracks.length ? v.textTracks[0] : null;
    if (cc && !track) cc.hidden = true;
    if (cc && track) {
      var shown = $('track[default]', v) !== null;
      track.mode = shown ? 'showing' : 'hidden';
      cc.setAttribute('aria-pressed', String(shown));
      cc.addEventListener('click', function () {
        var on = track.mode !== 'showing';
        track.mode = on ? 'showing' : 'hidden';
        cc.setAttribute('aria-pressed', String(on));
      });
    }
    /* full screen: the whole player, bar and all; on a phone that only lets the video itself go full screen, the video */
    if (full) {
      var can = root.requestFullscreen || v.webkitEnterFullscreen;
      if (!can) full.hidden = true;
      full.dataset.labelFull = full.dataset.labelFull || full.getAttribute('aria-label') || 'Full screen';
      full.dataset.labelExit = full.dataset.labelExit || 'Leave full screen';
      full.addEventListener('click', function () {
        if (document.fullscreenElement === root) document.exitFullscreen();
        else if (root.requestFullscreen) root.requestFullscreen().catch(function () {});
        else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
      });
      document.addEventListener('fullscreenchange', function () { label(full, document.fullscreenElement === root, 'labelFull', 'labelExit', 'maximize', 'minimize'); });
    }
    state();
    clock();
  });

  /* ---------- Navigation ---------- */

  /* The pill of a segmented control of radios, and of a strip of tabs or links, slides to the chosen item. Every .tray-seg
     and .tray-tabs gets it, with no attribute of its own. A choice made from script slides it too: a radio set from script
     needs a change event, as it would for a form; tabs and links are followed through aria-selected and aria-current. */
  UI.upgrade('.tray-seg', function (strip) {
    if (!$('input[type="radio"]', strip)) return;
    var place = glide(strip, function () { var i = $('input:checked', strip); return i && i.nextElementSibling; });
    strip.addEventListener('change', function () { place(); });
  });
  UI.upgrade('.tray-tabs', function (strip) {
    var place = glide(strip, function () { return $('[aria-selected="true"], [aria-current]:not([aria-current="false"])', strip); });
    if (window.MutationObserver) new MutationObserver(function () { place(); }).observe(strip, { subtree: true, attributes: true, attributeFilter: ['aria-selected', 'aria-current'] });
  });

  /* Tabs: data-tray="tabs" on the wrapper of a [role=tablist] of [role=tab] buttons (each aria-controls a panel) and the panels. */
  UI.register('tabs', function (root) {
    var list = $('[role="tablist"]', root), tabs = $$('[role="tab"]', list);
    /* select(tab, focus, first): first is the tab set up at load, which is no change: it fires nothing and does not fade. */
    function select(tab, focus, first) {
      tabs.forEach(function (t) {
        var on = t === tab, panel = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', String(on));
        t.setAttribute('tabindex', on ? '0' : '-1');
        if (panel) panel.hidden = !on;
      });
      if (first) return;
      root.setAttribute('data-switched', '');  /* a panel shown by a choice fades in; the first one is simply there */
      if (focus) tab.focus();
      fire(root, 'change', { tab: tab.id || tab.getAttribute('aria-controls') });
    }
    list.addEventListener('click', function (e) { var t = e.target.closest('[role="tab"]'); if (t && !t.disabled) select(t); });
    list.addEventListener('keydown', function (e) {
      var live = tabs.filter(function (t) { return !t.disabled; }), i = live.indexOf(document.activeElement);
      var rtl = getComputedStyle(list).direction === 'rtl', step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key], to = null;
      if (step && i >= 0) to = live[(i + step + live.length) % live.length];
      else if (e.key === 'Home') to = live[0];
      else if (e.key === 'End') to = live[live.length - 1];
      if (to) { e.preventDefault(); select(to, true); }
    });
    select(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0], false, true);
  });

  /* Strip: data-tray="strip" on a .tray-tabs that may overflow; marks it is-clipped while tabs run past the end edge.
     The current item (aria-current, or the selected tab) is scrolled into view, clear of the fade at the end, once the
     strip has a width, again when the font arrives unless the strip was scrolled meanwhile, and when the current item
     changes. An item that takes keyboard focus is scrolled wholly into view the same way, so its ring is never under the
     fade (the browser scrolls only an item that is out of sight). Only the strip scrolls, never the page. */
  UI.register('strip', function (strip) {
    var FADE = 56, shown = false, placed = null;
    function clip() { strip.classList.toggle('is-clipped', Math.abs(strip.scrollLeft) + strip.clientWidth < strip.scrollWidth - 8); }
    function current() { return $('[aria-selected="true"], [aria-current]:not([aria-current="false"])', strip); }
    /* reveal(item): scroll the strip by the least that shows the whole item, keeping it out of the fade on the end side
       (the right, or the left right to left). The browser stops the scroll at either end, where the strip does not fade. */
    function reveal(item) {
      if (item && strip.scrollWidth > strip.clientWidth) {
        var b = strip.getBoundingClientRect(), r = item.getBoundingClientRect(), rtl = getComputedStyle(strip).direction === 'rtl';
        var left = b.left + strip.clientLeft + (rtl ? FADE : 0), right = b.left + strip.clientLeft + strip.clientWidth - (rtl ? 0 : FADE);
        var lo = r.left - left, hi = r.right - right, d = 0;  /* lo < 0: past the room on the left; hi > 0: past it on the right */
        /* the end side first, then the start side, so an item wider than the room shows its start */
        if (rtl) { if (lo < 0) d = lo; if (hi - d > 0) d = hi; } else { if (hi > 0) d = hi; if (lo - d < 0) d = lo; }
        if (d) strip.scrollLeft += d;
        clip();
      }
      placed = strip.scrollLeft;
    }
    function settle() {
      clip();
      if (!shown && strip.clientWidth) { shown = true; reveal(current()); }
    }
    strip.addEventListener('scroll', clip, { passive: true });
    /* keyboard focus only: a press focuses its item on the way down, and scrolling then would carry the item away from
       under the pointer before the release, so the click would be lost */
    strip.addEventListener('focusin', function (e) {
      var keys = true;
      try { keys = e.target.matches(':focus-visible'); } catch (err) { /* a browser without :focus-visible */ }
      var tab = e.target.closest('.tray-tab');
      if (keys) reveal(tab && strip.contains(tab) ? tab : e.target);
    });
    watch(strip, settle);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (shown && strip.scrollLeft === placed) reveal(current()); });
    if (window.MutationObserver) new MutationObserver(function () { reveal(current()); }).observe(strip, { subtree: true, attributes: true, attributeFilter: ['aria-selected', 'aria-current'] });
  });

  /* The items of one menu panel, not those of a submenu inside it. */
  var OWN_ITEMS = '[role^="menuitem"]:not(.tray-submenu > .tray-pop *)';
  /* What a menu item reports as its value: its data-value, or its words without its icon and its shortcut ("Duplicate",
     not "DuplicateCtrl D"), as an option of a list reports them. */
  function itemValue(it) { return it.dataset.value || optionWords(it); }

  /* A submenu: in a .tray-submenu, an item with aria-haspopup="menu" and the .tray-pop beside it, which becomes a menu of
     its own. The item opens it with the arrow towards it (ArrowRight, or ArrowLeft right to left), Enter or Space, and
     reports aria-expanded; the pointer resting on the item opens it too. Up and down stay inside it; the arrow back or
     Escape closes it and puts focus back on its item. It is shown by data-open, so focus that only passes by does not
     open it. */
  function submenu(box) {
    var item = $(':scope > [aria-haspopup]', box), sub = $(':scope > .tray-pop', box), timer = null;
    if (!item || !sub) return;
    item.id = item.id || uid('tray-menuitem');
    sub.setAttribute('role', 'menu');
    sub.setAttribute('aria-labelledby', item.id);
    $$('[role^="menuitem"]', sub).forEach(function (i) { i.setAttribute('tabindex', '-1'); });
    function arrows() { var rtl = getComputedStyle(box).direction === 'rtl'; return { into: rtl ? 'ArrowLeft' : 'ArrowRight', out: rtl ? 'ArrowRight' : 'ArrowLeft' }; }
    function set(open, focus) {
      clearTimeout(timer);
      if (open && item.getAttribute('aria-disabled') === 'true') return;
      if (!open) rescue(sub, item);
      sub.toggleAttribute('data-open', open);
      item.setAttribute('aria-expanded', String(open));
      var first = $('[role^="menuitem"]', sub);
      if (open && focus && first) first.focus();
    }
    item.setAttribute('aria-expanded', 'false');
    set(sub.hasAttribute('data-open'));
    rove(sub, '[role^="menuitem"]');
    item.addEventListener('click', function () { set(true, true); });
    item.addEventListener('keydown', function (e) { if (e.key === arrows().into) { e.preventDefault(); e.stopPropagation(); set(true, true); } });
    sub.addEventListener('keydown', function (e) {
      if (e.key === arrows().out || e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); set(false); }
      /* the menu around it would take these for its own items */
      else if (/^(ArrowUp|ArrowDown|Home|End)$/.test(e.key)) e.stopPropagation();
    });
    box.addEventListener('pointerenter', function () { set(true); });
    /* the pointer may cross the gap to the panel: it closes a moment after the pointer has left both, unless focus is in it */
    box.addEventListener('pointerleave', function () { clearTimeout(timer); timer = setTimeout(function () { if (!sub.contains(document.activeElement)) set(false); }, 300); });
    box.addEventListener('focusout', function (e) { if (!box.contains(e.relatedTarget)) set(false); });
  }

  /* Menu: data-tray="menu" on the anchor that holds a trigger button and a .tray-pop of menu items.
     Items are role=menuitem, menuitemcheckbox or menuitemradio (with data-group). An action fires tray:select with
     detail.value and closes the menu; a check or radio item fires tray:change with detail.value and detail.checked, and
     the menu stays open. */
  UI.register('menu', function (root) {
    var trigger = root.querySelector(':scope > button, :scope > a'), panel = root.querySelector(':scope > .tray-pop');
    if (!trigger || !panel) return;
    function items() { return $$(OWN_ITEMS, panel).filter(function (i) { return i.offsetParent !== null; }); }
    panel.setAttribute('role', 'menu');
    trigger.setAttribute('aria-haspopup', 'menu');
    $$('[role^="menuitem"]', panel).forEach(function (i) { i.setAttribute('tabindex', '-1'); });
    /* The head of a user menu (who is signed in) is not an item, so a screen reader inside the menu never reaches it: the
       name and the line under it name the menu instead, and are read as it opens. */
    var head = $(':scope > .tray-pop__head', panel);
    if (!panel.hasAttribute('aria-label') && !panel.hasAttribute('aria-labelledby')) {
      /* Any other menu is named by the button that opens it, as a menu must have a name. */
      var who = head ? $('.tray-person__text', head) || head : trigger;
      who.id = who.id || uid(head ? 'tray-menu-name' : 'tray-menu-button');
      panel.setAttribute('aria-labelledby', who.id);
    }
    var pop = popup(trigger, panel, { onOpen: function () { var first = items()[0]; if (first) first.focus(); } });
    rove(panel, OWN_ITEMS);
    /* Shift+Tab from an item would land on the trigger, which counts as inside, and leave the menu open: it closes the
       menu as Tab does, and focus goes to the trigger. */
    panel.addEventListener('keydown', function (e) { if (e.key === 'Tab' && e.shiftKey && pop.isOpen()) { e.preventDefault(); pop.close(true); } });
    $$('.tray-submenu', panel).forEach(submenu);
    panel.addEventListener('click', function (e) {
      var it = e.target.closest('[role^="menuitem"]');
      if (!it || it.getAttribute('aria-disabled') === 'true' || it.hasAttribute('aria-haspopup')) return;
      var role = it.getAttribute('role'), value = itemValue(it);
      if (role === 'menuitemcheckbox') {
        var on = it.getAttribute('aria-checked') !== 'true';
        it.setAttribute('aria-checked', String(on));
        fire(root, 'change', { value: value, checked: on });
        return;
      }
      if (role === 'menuitemradio') {
        $$('[role="menuitemradio"][data-group="' + it.dataset.group + '"]', panel).forEach(function (x) { x.setAttribute('aria-checked', String(x === it)); });
        fire(root, 'change', { value: value, checked: true });
        return;
      }
      fire(root, 'select', { value: value });
      pop.close(true);
    });
    trigger.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); pop.open(); } });
    root.__menu = pop;
  });

  /* Menubar: data-tray="menubar" on the strip of menus. Its triggers become the bar's menu items and one stop for Tab:
     the arrow keys move along the bar (mirrored right to left) and Home and End go to its ends. With one menu open,
     pointing at another opens it, and the arrows open the next one. */
  UI.register('menubar', function (bar) {
    function menus() { return $$(':scope > [data-tray~="menu"]', bar); }
    function triggerOf(m) { return m.querySelector(':scope > button, :scope > a'); }
    function openOnly(m) { menus().forEach(function (x) { if (x.__menu) { if (x === m) x.__menu.open(); else x.__menu.close(); } }); }
    function stop(t) { menus().forEach(function (m) { var x = triggerOf(m); if (x) x.setAttribute('tabindex', x === t ? '0' : '-1'); }); }
    bar.setAttribute('role', 'menubar');
    menus().forEach(function (m) { var t = triggerOf(m); if (t) t.setAttribute('role', 'menuitem'); });
    if (menus()[0]) stop(triggerOf(menus()[0]));
    /* the trigger last used keeps the bar's Tab stop */
    bar.addEventListener('focusin', function (e) { var m = e.target.closest('[data-tray~="menu"]'); if (m && m.parentNode === bar && triggerOf(m) === e.target) stop(e.target); });
    bar.addEventListener('pointerover', function (e) {
      var m = e.target.closest('[data-tray~="menu"]');
      if (m && m.parentNode === bar && menus().some(function (x) { return x.__menu && x.__menu.isOpen(); }) && !m.__menu.isOpen()) openOnly(m);
    });
    bar.addEventListener('keydown', function (e) {
      var rtl = getComputedStyle(bar).direction === 'rtl', step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
      var list = menus(), i = list.indexOf(e.target.closest('[data-tray~="menu"]')), to = -1;
      if (i < 0) return;
      if (step) to = (i + step + list.length) % list.length;
      else if (e.target === triggerOf(list[i]) && e.key === 'Home') to = 0;
      else if (e.target === triggerOf(list[i]) && e.key === 'End') to = list.length - 1;
      if (to < 0) return;
      var wasOpen = list[i].__menu.isOpen();
      e.preventDefault();
      triggerOf(list[to]).focus();
      if (wasOpen) openOnly(list[to]);
    });
  });

  /* Context menu: data-tray="contextmenu" on a region that holds a .tray-pop menu; it opens where the region is right-clicked. */
  UI.register('contextmenu', function (region) {
    var panel = $('.tray-pop', region);
    panel.setAttribute('role', 'menu');
    /* a name on a plain div is not read without a role: the region is a named group */
    if (!region.hasAttribute('role') && /^(DIV|SPAN)$/.test(region.tagName) && (region.hasAttribute('aria-label') || region.hasAttribute('aria-labelledby'))) region.setAttribute('role', 'group');
    $$('[role^="menuitem"]', panel).forEach(function (i) { i.setAttribute('tabindex', '-1'); });
    /* focus in the menu goes back to the region before the menu goes, not to the top of the page */
    function close() { rescue(panel, region); hide(panel); }
    function openAt(x, y) {
      var box = region.getBoundingClientRect();
      show(panel);
      panel.style.insetInlineStart = clamp(x - box.left, 8, Math.max(8, box.width - panel.offsetWidth - 8)) + 'px';
      panel.style.insetBlockStart = clamp(y - box.top, 8, Math.max(8, box.height - panel.offsetHeight - 8)) + 'px';
      fit(panel);
      var first = $(OWN_ITEMS, panel);
      if (first) first.focus();
    }
    if (!panel.hasAttribute('data-open')) close();
    region.addEventListener('contextmenu', function (e) { e.preventDefault(); openAt(e.clientX, e.clientY); });
    region.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); region.focus(); }
      if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) { e.preventDefault(); var b = region.getBoundingClientRect(); openAt(b.left + 24, b.top + 24); }
    });
    rove(panel, OWN_ITEMS);
    $$('.tray-submenu', panel).forEach(submenu);
    panel.addEventListener('click', function (e) { var it = e.target.closest('[role^="menuitem"]'); if (it && it.getAttribute('aria-disabled') !== 'true' && !it.hasAttribute('aria-haspopup')) { fire(region, 'select', { value: itemValue(it) }); close(); } });
    /* Tab out of the menu closes it, as it does a dropdown menu */
    panel.addEventListener('focusout', function (e) { var to = e.relatedTarget; if (!panel.hidden && to && !panel.contains(to)) hide(panel); });
    document.addEventListener('pointerdown', function (e) { if (!panel.hidden && !panel.contains(e.target) && e.button !== 2) close(); });
  });

  /* Sidebar: data-tray="sidebar-toggle" on a button whose aria-controls names the sidebar; it collapses it to icons. The
     button's name says what a press will do: data-label-collapse and data-label-expand (by default its aria-label and
     "Expand the sidebar"), while aria-expanded says how the sidebar is. */
  UI.register('sidebar-toggle', function (btn) {
    var side = document.getElementById(btn.getAttribute('aria-controls'));
    if (!side) return;
    var named = btn.getAttribute('aria-label'), rail = side.hasAttribute('data-collapsed');
    btn.dataset.labelCollapse = btn.dataset.labelCollapse || (!rail && named) || 'Collapse the sidebar';
    btn.dataset.labelExpand = btn.dataset.labelExpand || (rail && named) || 'Expand the sidebar';
    function paint() {
      var open = !side.hasAttribute('data-collapsed');
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? btn.dataset.labelCollapse : btn.dataset.labelExpand);
    }
    btn.addEventListener('click', function () { side.toggleAttribute('data-collapsed'); paint(); fire(side, 'change', { collapsed: side.hasAttribute('data-collapsed') }); });
    paint();
  });

  /* Sidebar on a small screen: data-tray="sidebar-sheet" on the tray-app__menu button whose aria-controls names the sidebar.
     It opens that same sidebar in a sheet and puts it back where it was when the sheet closes. The sheet comes from the start side,
     or from the end side when the sidebar stands after the content (tray-app--end, the second one of tray-app--both). */
  UI.register('sidebar-sheet', function (btn) {
    var side = document.getElementById(btn.getAttribute('aria-controls'));
    if (!side) return;
    var home = side.parentNode, next = side.nextSibling, sheet = null, wasCollapsed = false;
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      if (!sheet) {
        sheet = document.createElement('dialog');
        var before = home.previousElementSibling, atEnd = !!(before && before.classList.contains('tray-app__main'));
        sheet.className = 'tray-sheet tray-sheet--nav' + (atEnd ? '' : ' tray-sheet--start');
        sheet.setAttribute('data-tray', 'dialog');
        if (side.getAttribute('aria-labelledby')) sheet.setAttribute('aria-labelledby', side.getAttribute('aria-labelledby'));
        else sheet.setAttribute('aria-label', side.getAttribute('aria-label') || 'Navigation');
        sheet.innerHTML = '<button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon tray-sheet__close" type="button" data-close aria-label="Close">' + icon('x') + '</button>';
        document.body.appendChild(sheet);
        UI.init(sheet);
        sheet.addEventListener('close', function () {
          if (wasCollapsed) side.setAttribute('data-collapsed', '');
          home.insertBefore(side, next && next.parentNode === home ? next : null);
          btn.setAttribute('aria-expanded', 'false');
          fire(btn, 'close');
        });
        sheet.addEventListener('click', function (e) { if (e.target.closest('a[href]')) shut(sheet); });
        if (window.matchMedia) window.matchMedia('(min-width: 56rem)').addEventListener('change', function (e) { if (e.matches && sheet.open) sheet.close(); });
      }
      wasCollapsed = side.hasAttribute('data-collapsed');
      side.removeAttribute('data-collapsed');
      sheet.appendChild(side);
      sheet.showModal();
      btn.setAttribute('aria-expanded', 'true');
      fire(btn, 'open');
    });
  });

  /* Command: data-tray="command" on .tray-command. Typing filters the options; groups ([data-group]) with nothing left are hidden.
     Fires tray:select with detail.value. */
  UI.register('command', function (root) {
    var input = $('input', root), list = $('.tray-command__list', root), empty = $('.tray-list__empty', root), active = null;
    function options() { return $$('[role="option"]', list); }
    function visible() { return options().filter(function (o) { return !o.hidden; }); }
    list.setAttribute('role', 'listbox');
    list.id = list.id || uid('tray-listbox');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-controls', list.id);
    input.setAttribute('autocomplete', 'off');
    options().forEach(function (o) { o.id = o.id || uid('tray-option'); o.setAttribute('tabindex', '-1'); });
    /* A listbox holds options and groups only: the no-match sentence inside it is for the eye, and the status line below
       says the same words to a screen reader. */
    if (empty) empty.setAttribute('aria-hidden', 'true');
    /* a group of options is a group of the listbox, named by its label, so the name is read on the way into it */
    $$('[data-group]', list).forEach(function (g) {
      var label = $(':scope > .tray-list__label', g);
      if (!g.hasAttribute('role')) g.setAttribute('role', 'group');
      if (label && !g.hasAttribute('aria-labelledby') && !g.hasAttribute('aria-label')) { label.id = label.id || uid('tray-group'); g.setAttribute('aria-labelledby', label.id); }
    });
    function setActive(o) {
      if (active) active.removeAttribute('data-active');
      active = o || null;
      if (active) { active.setAttribute('data-active', ''); input.setAttribute('aria-activedescendant', active.id); if (active.scrollIntoView) active.scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    }
    /* Focus stays in the field, where nothing reads the list as it narrows: a status line says how many options are left,
       or the no-match sentence, when those words change. data-found words the count, "{n} found"; by default "1 match",
       "3 matches". */
    var tell = quietStatus(root);
    function found(n) { return root.dataset.found ? root.dataset.found.replace('{n}', n) : n + (n === 1 ? ' match' : ' matches'); }
    /* The filter and the value look at the option's name: the keys of its shortcut (G O) are not words to find it by. */
    function filter() {
      var q = input.value.trim().toLowerCase();
      options().forEach(function (o) { o.hidden = !!q && optionWords(o).toLowerCase().indexOf(q) < 0; });
      $$('[data-group]', list).forEach(function (g) { g.hidden = !$$('[role="option"]', g).some(function (o) { return !o.hidden; }); });
      var n = visible().length;
      if (empty) empty.hidden = n > 0;
      tell(!q ? '' : n ? found(n) : (empty ? empty.textContent.trim() : found(0)));
      setActive(visible()[0]);
    }
    function run(o) { fire(root, 'select', { value: o.dataset.value || optionWords(o) }); }
    input.addEventListener('input', filter);
    input.addEventListener('keydown', function (e) {
      var vis = visible(), i = vis.indexOf(active);
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(vis[(i + 1) % vis.length]); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(vis[(i - 1 + vis.length) % vis.length]); }
      else if (e.key === 'Enter' && active) { e.preventDefault(); run(active); }
    });
    list.addEventListener('pointerdown', function (e) { e.preventDefault(); });
    list.addEventListener('pointermove', function (e) { var o = e.target.closest('[role="option"]'); if (o && o !== active) setActive(o); });
    list.addEventListener('click', function (e) { var o = e.target.closest('[role="option"]'); if (o) run(o); });
    filter();
  });

  /* ---------- Overlays ---------- */

  /* Dialog, alert dialog, sheet, drawer: native <dialog> elements with data-tray="dialog".
     A [data-close] control inside closes it; a click on the veil closes it unless it has data-static or role=alertdialog. */
  UI.register('dialog', function (d) {
    /* the veil closes the dialog only when the press and the release are both on it: a text selection dragged out of the
       dialog ends on the veil too, and must not close it */
    var pressedOutside = false;
    function outside(e) { var b = d.getBoundingClientRect(); return e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom; }
    d.addEventListener('pointerdown', function (e) { pressedOutside = e.target === d && outside(e); });
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) { shut(d, e.target.closest('[data-close]').value || ''); return; }
      var veil = e.target === d && d.matches(':modal') && !d.hasAttribute('data-static') && d.getAttribute('role') !== 'alertdialog';
      if (veil && pressedOutside && outside(e)) shut(d, '');
      pressedOutside = false;
    });
    d.addEventListener('cancel', function (e) {
      /* data-static on an alert dialog refuses Escape. A browser lets a page refuse it only so many times: Chrome 157
         refuses the first two presses and closes the dialog at the third, with a cancel event that cannot be cancelled,
         whatever was clicked or pressed between. Escape is slowed, not stopped; the dialog then closes with an empty
         returnValue, as Escape on any dialog does. */
      if (d.getAttribute('role') === 'alertdialog' && d.hasAttribute('data-static')) { e.preventDefault(); return; }
      /* Escape: where the browser cannot keep the dialog in the top layer while it leaves, it leaves first, then closes */
      if (!calm() && !topLayerExit()) { e.preventDefault(); shut(d, ''); }
    });
    /* data-open: the dialog opens over the page as the page loads (the open attribute alone shows it in place, with no veil
       and no focus held). It goes when the dialog closes, so the markup no longer says open. */
    if (d.hasAttribute('data-open') && !d.open) {
      d.addEventListener('close', function () { d.removeAttribute('data-open'); }, { once: true });
      d.showModal();
      safeChoice(d);
    }
  });
  /* An alert dialog starts on the safe choice: autofocus on it in the markup does that; this covers markup without it. */
  function safeChoice(d) {
    if (d.getAttribute('role') !== 'alertdialog' || d.querySelector('[autofocus]')) return;
    var safe = d.querySelector('button[data-close]:not(.tray-btn--danger)');
    if (safe) safe.focus();
  }
  /* Open: data-tray="open" on a button with data-target="#id". data-modal="false" shows the dialog in place instead of over the page. */
  UI.register('open', function (btn) {
    /* the button says it opens a dialog, as the button of a sidebar sheet does */
    if (!btn.hasAttribute('aria-haspopup')) btn.setAttribute('aria-haspopup', 'dialog');
    btn.addEventListener('click', function () {
      var d = document.querySelector(btn.dataset.target);
      if (!d) return;
      if (d.hasAttribute('data-closing')) { d.removeAttribute('data-closing'); d.close(); }
      if (d.open) return;
      if (btn.dataset.modal === 'false') d.show(); else d.showModal();
      safeChoice(d);
    });
  });

  /* Popover: data-tray="popover" on the anchor that holds a trigger button and a .tray-pop. */
  UI.register('popover', function (root) {
    var trigger = root.querySelector(':scope > button, :scope > a'), panel = root.querySelector(':scope > .tray-pop');
    if (!trigger || !panel) return;
    panel.id = panel.id || uid('tray-popover');
    trigger.setAttribute('aria-controls', panel.id);
    /* Focus moves to the first control inside. A panel of text alone has none, so focus would stay on the trigger and
       nothing would be read: it becomes a dialog named by its title (or by its trigger), described by its text, and
       takes focus itself. */
    function opened() {
      var f = panel.querySelector('input, select, textarea, button, a[href], [tabindex="0"]');
      if (f) { f.focus(); return; }
      if (!panel.hasAttribute('role')) panel.setAttribute('role', 'dialog');
      if (!panel.hasAttribute('aria-label') && !panel.hasAttribute('aria-labelledby')) {
        var title = $('.tray-pop__title', panel) || trigger;
        title.id = title.id || uid('tray-popover-title');
        panel.setAttribute('aria-labelledby', title.id);
      }
      var text = $$('.tray-pop__text', panel);
      if (text.length && !panel.hasAttribute('aria-describedby')) panel.setAttribute('aria-describedby', text.map(function (p) { p.id = p.id || uid('tray-popover-text'); return p.id; }).join(' '));
      panel.setAttribute('tabindex', '-1');
      panel.focus();
    }
    var pop = popup(trigger, panel, { onOpen: opened });
    panel.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) pop.close(true); });
    root.__popover = pop;
  });

  /* Hover card: data-tray="hovercard" on the anchor that holds a link and a .tray-pop; opens on hover or focus after a short wait. */
  UI.register('hovercard', function (root) {
    var trigger = root.querySelector(':scope > a, :scope > button'), panel = root.querySelector(':scope > .tray-pop'), timer = null;
    if (!trigger || !panel) return;
    if (!panel.hasAttribute('data-open')) panel.hidden = true; else fit(panel);
    function set(open) { clearTimeout(timer); timer = setTimeout(function () { if (open) show(panel); else hide(panel); }, open ? 250 : 150); }
    root.addEventListener('pointerenter', function () { set(true); });
    root.addEventListener('pointerleave', function () { set(false); });
    root.addEventListener('focusin', function () { set(true); });
    root.addEventListener('focusout', function () { set(false); });
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape') { clearTimeout(timer); hide(panel); } });
  });

  /* Tooltip: data-tray="tooltip" on an anchor around one control, with data-tip="text" (and optional data-side="bottom",
     data-keys="Ctrl K"). The bubble follows data-tip, data-keys and data-side when they change ("Copy the link", then
     "Copied"). */
  UI.register('tooltip', function (root) {
    var target = root.querySelector('button, a, input, [tabindex]') || root, tip = document.createElement('span'), timer = null;
    tip.setAttribute('role', 'tooltip');
    tip.id = uid('tray-tooltip');
    /* the words of a text, lower case, without their punctuation: "Orders, 12 to pack" is "orders 12 to pack" */
    function plain(s) { return ' ' + String(s).toLowerCase().replace(/[\s!-\/:-@\[-`{-~ ‐-…]+/g, ' ').trim() + ' '; }
    function paint() {
      var words = root.dataset.tip || '', name = (target.getAttribute('aria-label') || target.textContent || '').trim();
      tip.className = 'tray-tooltip' + (root.dataset.side === 'bottom' ? ' tray-tooltip--bottom' : '');
      tip.textContent = words;
      /* Words that the control's name already holds ("Orders" for a link named "Orders, 12 to pack") are for the eye
         alone: CSS draws them with no text for a screen reader, so they are not read a second time as the description,
         which keeps the keys. (aria-hidden would not do: a description is read from a hidden bubble whole.) */
      if (plain(words).trim() && plain(name).indexOf(plain(words)) >= 0) {
        var said = document.createElement('span');
        said.className = 'tray-tooltip__said';
        said.setAttribute('data-said', words);
        tip.replaceChildren(said);
      }
      (root.dataset.keys || '').split(' ').filter(Boolean).forEach(function (k) { var kbd = document.createElement('kbd'); kbd.className = 'tray-kbd'; kbd.textContent = k; tip.appendChild(kbd); });
      /* With nothing left for a screen reader (the words repeat the name and there are no keys) the bubble is hidden from
         it altogether, as a tooltip with no words of its own would be one without a name. The description stays empty. */
      if (tip.textContent.trim()) tip.removeAttribute('aria-hidden'); else tip.setAttribute('aria-hidden', 'true');
    }
    paint();
    tip.hidden = !root.hasAttribute('data-open');
    root.appendChild(tip);
    target.setAttribute('aria-describedby', tip.id);
    if (window.MutationObserver) {
      new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ['data-tip', 'data-keys', 'data-side'] });
      if (target !== root) new MutationObserver(paint).observe(target, { attributes: true, attributeFilter: ['aria-label'] });
    }
    /* Escape hides a bubble wherever focus is, also when the pointer alone showed it (WCAG 1.4.13): the page listens
       while the bubble shows. The key stops there, so a dialog around the tooltip stays open; the next Escape closes
       it. A menu or a list that closes on the same key comes first. */
    function key(e) { if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); set(false); } }
    function set(open, wait) {
      clearTimeout(timer);
      if (root.hasAttribute('data-open')) return;
      if (open) { show(tip); document.addEventListener('keydown', key); }
      else if (wait) timer = setTimeout(function () { set(false); }, 150);
      else { hide(tip); document.removeEventListener('keydown', key); }
    }
    /* The pointer can move onto the bubble and rest there (WCAG 1.4.13): it goes a moment after the pointer has left the
       control and the bubble both, and stays while the control has focus. */
    root.addEventListener('pointerenter', function () { set(true); });
    root.addEventListener('pointerleave', function () { if (!root.contains(document.activeElement)) set(false, true); });
    root.addEventListener('focusin', function () { set(true); });
    root.addEventListener('focusout', function () { if (!root.matches(':hover')) set(false); });
  });

  /* Toast: TrayUI.toast({ title, text, tone: 'success' | 'danger', action: { label, onClick }, duration })
     The region is the live one: a toast added to it is read out politely, and a danger toast is an alert, read at once.
     A toast with an action stays until it is dismissed, so there is time to reach its button. */
  UI.toast = function (opts) {
    opts = opts || {};
    var region = document.querySelector('.tray-toasts'), fresh = false;
    if (!region) {
      region = document.createElement('div');
      region.className = 'tray-toasts';
      region.setAttribute('role', 'region');
      region.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(region);
    }
    if (region.getAttribute('aria-live') !== 'polite') { region.setAttribute('aria-live', 'polite'); fresh = true; }
    var t = document.createElement('div'), tone = opts.tone || '', came = null;
    t.className = 'tray-toast' + (tone ? ' tray-toast--' + tone : '');
    if (tone === 'danger') t.setAttribute('role', 'alert');
    t.setAttribute('data-enter', '');
    t.innerHTML = (tone ? icon(tone === 'danger' ? 'circle-alert' : 'circle-check') : '') +
      '<div class="tray-toast__body"><p class="tray-toast__title">' + esc(opts.title || '') + '</p>' + (opts.text ? '<p class="tray-toast__text">' + esc(opts.text) + '</p>' : '') + '</div>' +
      '<div class="tray-toast__actions">' + (opts.action ? '<button class="tray-btn tray-btn--ghost tray-btn--xs" type="button" data-action>' + esc(opts.action.label) + '</button>' : '') +
      '<button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" data-dismiss aria-label="Dismiss">' + icon('x') + '</button></div>';
    var timer = null, life = opts.duration != null ? opts.duration : (tone === 'danger' || opts.action ? 0 : 5000);
    /* focus in a toast that goes moves to the next toast, or back to where it came from */
    function after() {
      var rest = $$('.tray-toast:not([data-leaving])', region).filter(function (x) { return x !== t; });
      var next = rest.filter(function (x) { return t.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING; })[0] || rest[rest.length - 1];
      return next ? $('button', next) : came;
    }
    /* a toast leaves the way it came, then is taken out */
    function dismiss() {
      clearTimeout(timer);
      if (!t.parentNode || t.hasAttribute('data-leaving')) return;
      rescue(t, after);
      if (calm()) { t.remove(); return; }
      t.removeAttribute('data-enter');
      t.setAttribute('data-leaving', '');
      settle(t, function () { t.remove(); });
    }
    function arm() { clearTimeout(timer); if (life) timer = setTimeout(dismiss, life); }
    t.addEventListener('click', function (e) {
      if (e.target.closest('[data-action]')) { if (opts.action.onClick) opts.action.onClick(); dismiss(); }
      if (e.target.closest('[data-dismiss]')) dismiss();
    });
    t.addEventListener('pointerenter', function () { clearTimeout(timer); });
    t.addEventListener('pointerleave', arm);
    /* where focus came from, outside the region; focus passed on from another toast keeps that toast's */
    t.addEventListener('focusin', function (e) {
      clearTimeout(timer);
      var from = e.relatedTarget, toast = from && from.closest && from.closest('.tray-toast');
      if (from && !region.contains(from)) came = from;
      else if (toast && toast !== t && toast.__came) came = toast.__came;
      t.__came = came;
    });
    t.addEventListener('focusout', arm);
    region.appendChild(t);
    /* A screen reader hears a live region only once it knows it: in a region that has only just become live, the words
       of the first toast are put in again a moment later, so that they are read. An alert is read as it comes. */
    if (fresh && tone !== 'danger') setTimeout(function () { var body = $('.tray-toast__body', t); if (body && t.isConnected) t.insertBefore(body, body.nextSibling); }, 150);
    arm();
    return { dismiss: dismiss, element: t };
  };

  /* ---------- Chart ----------
     TrayUI.chart(el, config) draws into a <figure class="tray-chart">; or put the config as JSON in data-chart with data-tray="chart".
     config: { type: 'bar' | 'line' | 'area' | 'donut' | 'radial' | 'radar', labels: [...], series: [{ name, values: [...] }],
               unit, max, stacked, horizontal, step, height, label: 'peak' | 'none', table: true, summary, labelHead, totalLabel, locale } */
  function niceMax(max) {
    if (!(max > 0)) return 1;
    var pow = Math.pow(10, Math.floor(Math.log10(max))), steps = [1, 2, 3, 4, 5, 6, 8, 10];
    for (var i = 0; i < steps.length; i += 1) if (steps[i] * pow >= max) return steps[i] * pow;
    return 10 * pow;
  }
  function make(tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; n.setAttribute('data-gen', ''); return n; }
  function colour(k) { return '--tray-c:var(--tray-s' + Math.min(k + 1, 5) + ')'; }

  UI.chart = function (el, cfg) {
    cfg = cfg || JSON.parse(el.getAttribute('data-chart') || '{}');
    var type = cfg.type || 'bar', labels = cfg.labels || [], series = cfg.series || [], unit = cfg.unit || '';
    var nf = new Intl.NumberFormat(cfg.locale || 'en-GB', { maximumFractionDigits: 1 });
    function val(v) { return nf.format(v) + unit; }
    function all() { return series.reduce(function (a, s) { return a.concat(s.values); }, []); }
    $$('[data-gen]', el).forEach(function (n) { if (n.parentNode === el) el.removeChild(n); });
    el.classList.add('tray-chart');
    /* The figure is named by its caption: browsers do not all take a figure's name from its figcaption, so it is said
       with aria-labelledby. */
    var caption = $(':scope > figcaption', el);
    if (caption && !el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) { caption.id = caption.id || uid('tray-chart-title'); el.setAttribute('aria-labelledby', caption.id); }
    el.classList.toggle('tray-chart--single', series.length === 1 && type !== 'donut' && !(type === 'radial' && series[0].values.length > 1));
    var summary = cfg.summary || (type + ' chart. ' + series.map(function (s) { return s.name + ': ' + labels.map(function (l, i) { return l + ' ' + val(s.values[i]); }).join(', '); }).join('. '));
    /* What the arrow keys reach is said through this region. It sits in the figure, beside the drawing: the children of a
       role="img" are presentational, so a region inside it would never be heard. */
    var live = make('span', 'tray-vh');
    live.setAttribute('aria-live', 'polite');

    /* On touch a tap shows the values under it until the next tap elsewhere: a finger that lifts is not a pointer that
       leaves. lingers(box, clear) gives the pointerleave handler, which clears for a mouse or a pen only. */
    function lingers(box, clear) {
      function away(e) { if (!box.contains(e.target)) { document.removeEventListener('pointerdown', away); clear(); } }
      box.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') document.addEventListener('pointerdown', away); });
      return function (e) { if (e.pointerType !== 'touch') clear(); };
    }

    function legend(names) {
      var ul = make('ul', 'tray-chart__legend');
      ul.innerHTML = names.map(function (name, k) { return '<li><span class="tray-swatch" style="' + colour(k) + '"></span>' + esc(name) + '</li>'; }).join('');
      el.appendChild(ul);
    }
    function table() {
      if (cfg.table === false) return;
      var d = make('details', 'tray-collapsible');
      var head = '<tr><th scope="col">' + esc(cfg.labelHead || '') + '</th>' + series.map(function (s) { return '<th scope="col" data-num>' + esc(s.name) + '</th>'; }).join('') + '</tr>';
      var rows = labels.map(function (l, i) { return '<tr><th scope="row">' + esc(l) + '</th>' + series.map(function (s) { return '<td data-num>' + val(s.values[i]) + '</td>'; }).join('') + '</tr>'; }).join('');
      d.innerHTML = '<summary><span>Show the figures</span><span class="tray-tile" aria-hidden="true">' + icon('plus') + '</span></summary>' +
        '<div class="tray-collapsible__body"><table class="tray-table tray-table--compact"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>';
      el.appendChild(d);
    }

    function cartesian() {
      var n = labels.length, stacked = !!cfg.stacked;
      var totals = labels.map(function (_, i) { return series.reduce(function (a, s) { return a + (s.values[i] || 0); }, 0); });
      var max = cfg.max || niceMax(Math.max.apply(null, stacked ? totals : all()));
      var every = n > 12 ? Math.ceil(n / 8) : 1;
      var frame = make('div', 'tray-chart__frame');
      frame.innerHTML = '<div class="tray-chart__axis" aria-hidden="true"><span>' + val(max) + '</span><span>' + nf.format(max / 2) + '</span><span>0</span></div>' +
        '<div class="tray-chart__plot" tabindex="0" role="img" aria-label="' + esc(summary) + '"><div class="tray-chart__grid"><span style="inset-block-start:0"></span><span style="inset-block-start:50%"></span></div></div>' +
        '<div class="tray-chart__x" aria-hidden="true">' + labels.map(function (l, i) { return '<span>' + (i % every ? '' : esc(l)) + '</span>'; }).join('') + '</div>';
      if (cfg.height) frame.style.setProperty('--tray-h', cfg.height + 'px');
      el.appendChild(frame);
      /* The labels under the plot: every one while each fits its column, else every second, third and so on, so that on
         a narrow card none is cut. A label is centred on its column and may reach into the empty ones beside it. */
      var xrow = $('.tray-chart__x', frame), xs = $$('span', xrow);
      watch(xrow, function () {
        var col = xrow.clientWidth / n, wide = 0, r = document.createRange();
        if (!col) return;
        labels.forEach(function (l, i) { xs[i].textContent = l; r.selectNodeContents(xs[i]); wide = Math.max(wide, r.getBoundingClientRect().width); });
        var step = Math.max(every, Math.ceil((wide + 8) / col));
        labels.forEach(function (l, i) { xs[i].textContent = i % step ? '' : l; });
      });
      var plot = $('.tray-chart__plot', frame), lines = [];
      var peak = null;
      if (series.length === 1 && cfg.label !== 'none') {
        var top = Math.max.apply(null, series[0].values);
        peak = { i: series[0].values.indexOf(top), v: top };
      }
      if (type === 'bar') {
        var cols = make('div', 'tray-chart__cols');
        cols.innerHTML = labels.map(function (_, i) {
          return '<div class="tray-chart__col' + (stacked ? ' tray-chart__col--stack' : '') + '">' + series.map(function (s, k) {
            return '<span class="tray-chart__bar" style="' + colour(k) + ';block-size:' + ((s.values[i] || 0) / max * 100).toFixed(2) + '%"></span>';
          }).join('') + (peak && peak.i === i ? '<span class="tray-chart__peak" style="inset-block-end:calc(' + (peak.v / max * 100).toFixed(2) + '% + 6px)">' + val(peak.v) + '</span>' : '') + '</div>';
        }).join('');
        plot.appendChild(cols);
      } else {
        var svg = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">', base = labels.map(function () { return 0; });
        series.forEach(function (s, k) {
          var pts = s.values.map(function (v, i) { return [(i + .5) / n * 100, 100 - (stacked ? base[i] + v : v) / max * 100]; });
          var d = pts.map(function (p, i) { return !i ? 'M' + p[0].toFixed(2) + ' ' + p[1].toFixed(2) : (cfg.step ? 'H' + p[0].toFixed(2) + 'V' + p[1].toFixed(2) : 'L' + p[0].toFixed(2) + ' ' + p[1].toFixed(2)); }).join('');
          if (type === 'area') {
            var floor = stacked ? base.map(function (b, i) { return [(i + .5) / n * 100, 100 - b / max * 100]; }).reverse() : [[pts[n - 1][0], 100], [pts[0][0], 100]];
            svg += '<path class="tray-chart__area" style="' + colour(k) + '" d="' + d + floor.map(function (p) { return 'L' + p[0].toFixed(2) + ' ' + p[1].toFixed(2); }).join('') + 'Z"/>';
          }
          svg += '<path class="tray-chart__line" style="' + colour(k) + '" d="' + d + '"/>';
          if (stacked) base = base.map(function (b, i) { return b + s.values[i]; });
          lines.push(pts);
        });
        plot.insertAdjacentHTML('beforeend', svg + '</svg>');
        if (peak) {
          var p = lines[0][peak.i];
          plot.insertAdjacentHTML('beforeend', '<span class="tray-chart__dot" style="' + colour(0) + ';inset-inline-start:' + p[0] + '%;inset-block-start:' + p[1] + '%"></span>' +
            '<span class="tray-chart__peak" style="inset-inline-start:' + p[0] + '%;inset-block-end:calc(' + (100 - p[1]) + '% + 10px)">' + val(peak.v) + '</span>');
        }
      }
      var cross = type === 'bar' ? null : make('span', 'tray-chart__cross'), tip = make('div', 'tray-tip'), dots = [], active = null;
      if (cross) { cross.hidden = true; plot.appendChild(cross); }
      tip.hidden = true;
      plot.appendChild(tip);
      el.appendChild(live);
      function hide() {
        active = null; tip.hidden = true;
        if (cross) cross.hidden = true;
        dots.forEach(function (d) { d.remove(); }); dots = [];
        $$('.tray-chart__col', plot).forEach(function (c) { c.removeAttribute('data-active'); });
        $$('.tray-chart__peak', plot).forEach(function (c) { c.style.visibility = ''; });
      }
      function show(i, announce) {
        if (i == null || i < 0 || i >= n) { hide(); return; }
        active = i;
        var x = (i + .5) / n * 100;
        if (cross) { cross.hidden = false; cross.style.insetInlineStart = x + '%'; }
        $$('.tray-chart__col', plot).forEach(function (c, k) { c.toggleAttribute('data-active', k === i); });
        dots.forEach(function (d) { d.remove(); }); dots = [];
        lines.forEach(function (pts, k) { var d = make('span', 'tray-chart__dot'); d.style.cssText = colour(k) + ';inset-inline-start:' + pts[i][0] + '%;inset-block-start:' + pts[i][1] + '%'; plot.appendChild(d); dots.push(d); });
        tip.hidden = false;
        tip.innerHTML = series.length > 1
          ? '<span>' + esc(labels[i]) + '</span>' + series.map(function (s, k) { return '<span class="tray-tip__row"><span class="tray-swatch" style="' + colour(k) + '"></span>' + esc(s.name) + '<b>' + val(s.values[i]) + '</b></span>'; }).join('')
          : esc(labels[i]) + ', ' + val(series[0].values[i]);
        tip.style.insetBlockStart = '0';
        tip.style.insetInlineStart = x < 50 ? 'calc(' + x + '% + 14px)' : 'auto';
        tip.style.insetInlineEnd = x < 50 ? 'auto' : 'calc(' + (100 - x) + '% + 14px)';
        $$('.tray-chart__peak', plot).forEach(function (c) { c.style.visibility = 'hidden'; });
        if (announce) live.textContent = labels[i] + ': ' + series.map(function (s) { return (series.length > 1 ? s.name + ' ' : '') + val(s.values[i]); }).join(', ');
      }
      function at(e) {
        var box = plot.getBoundingClientRect(), f = (e.clientX - box.left) / box.width;
        if (getComputedStyle(plot).direction === 'rtl') f = 1 - f;
        return clamp(Math.floor(f * n), 0, n - 1);
      }
      plot.addEventListener('pointermove', function (e) { show(at(e)); });
      plot.addEventListener('pointerdown', function (e) { show(at(e)); });
      plot.addEventListener('pointerleave', lingers(plot, hide));
      plot.addEventListener('blur', hide);
      plot.addEventListener('keydown', function (e) {
        var rtl = getComputedStyle(plot).direction === 'rtl', step = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 }[e.key];
        if (step) { e.preventDefault(); show(clamp((active == null ? (peak ? peak.i : 0) - step : active) + step, 0, n - 1), true); }
        else if (e.key === 'Home') { e.preventDefault(); show(0, true); }
        else if (e.key === 'End') { e.preventDefault(); show(n - 1, true); }
        else if (e.key === 'Escape') hide();
      });
      if (series.length > 1) legend(series.map(function (s) { return s.name; }));
    }

    function horizontal() {
      var vals = series[0].values, max = cfg.max || Math.max.apply(null, vals);
      var rows = make('div', 'tray-chart__rows');
      /* Every chart is a stop for Tab, so its summary is read there. Each figure is written beside its bar: nothing to walk. */
      rows.setAttribute('tabindex', '0');
      rows.setAttribute('role', 'img');
      rows.setAttribute('aria-label', summary);
      rows.innerHTML = labels.map(function (l, i) {
        return '<span>' + esc(l) + '</span><span class="tray-chart__track"><span style="' + colour(0) + ';inline-size:' + (vals[i] / max * 100).toFixed(2) + '%"></span></span><span class="tray-num">' + val(vals[i]) + '</span>';
      }).join('');
      el.appendChild(rows);
    }

    function donut() {
      var vals = series[0].values, total = vals.reduce(function (a, b) { return a + b; }, 0), r = 40, a0 = -Math.PI / 2, gap = .04;
      var round = make('div', 'tray-chart__round'), svg = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">';
      vals.forEach(function (v, i) {
        var sweep = v / total * Math.PI * 2, s = a0 + gap / 2, e = a0 + sweep - gap / 2;
        if (e > s) svg += '<path class="tray-chart__seg" data-i="' + i + '" style="' + colour(i) + '" d="M' + (50 + r * Math.cos(s)).toFixed(2) + ' ' + (50 + r * Math.sin(s)).toFixed(2) +
          'A' + r + ' ' + r + ' 0 ' + (e - s > Math.PI ? 1 : 0) + ' 1 ' + (50 + r * Math.cos(e)).toFixed(2) + ' ' + (50 + r * Math.sin(e)).toFixed(2) + '"/>';
        a0 += sweep;
      });
      round.innerHTML = svg + '</svg><div class="tray-chart__center"><b></b><span></span></div>';
      round.setAttribute('tabindex', '0');
      round.setAttribute('role', 'img');
      round.setAttribute('aria-label', summary);
      el.appendChild(round);
      el.appendChild(live);
      var big = $('.tray-chart__center b', round), small = $('.tray-chart__center span', round), active = null;
      function show(i, announce) {
        active = i;
        $$('.tray-chart__seg', round).forEach(function (seg) { seg.toggleAttribute('data-active', +seg.dataset.i === i); });
        round.toggleAttribute('data-hover', i != null);
        big.textContent = i == null ? val(total) : val(vals[i]);
        small.textContent = i == null ? (cfg.totalLabel || 'Total') : labels[i] + ', ' + Math.round(vals[i] / total * 100) + '%';
        if (announce && i != null) live.textContent = labels[i] + ': ' + val(vals[i]) + ', ' + Math.round(vals[i] / total * 100) + '%';
      }
      round.addEventListener('pointerover', function (e) { var seg = e.target.closest && e.target.closest('.tray-chart__seg'); show(seg ? +seg.dataset.i : null); });
      round.addEventListener('pointerleave', lingers(round, function () { show(null); }));
      round.addEventListener('blur', function () { show(null); });
      round.addEventListener('keydown', function (e) {
        var step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
        if (step) { e.preventDefault(); show(((active == null ? (step > 0 ? -1 : 0) : active) + step + vals.length) % vals.length, true); }
        else if (e.key === 'Escape') show(null);
      });
      show(null);
      var key = make('table', 'tray-chart__key');
      key.innerHTML = '<tbody>' + labels.map(function (l, i) { return '<tr><th scope="row"><span class="tray-swatch" style="' + colour(i) + '"></span>' + esc(l) + '</th><td>' + val(vals[i]) + '</td><td>' + Math.round(vals[i] / total * 100) + '%</td></tr>'; }).join('') + '</tbody>';
      el.appendChild(key);
    }

    function radial() {
      var vals = series[0].values.slice(0, 3), max = cfg.max || 100;
      var round = make('div', 'tray-chart__round'), svg = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">';
      vals.forEach(function (v, i) {
        var r = 43 - i * 10, c = 2 * Math.PI * r;
        svg += '<circle class="tray-chart__ring" cx="50" cy="50" r="' + r + '"/><circle class="tray-chart__value" cx="50" cy="50" r="' + r + '" style="' + colour(i) + '" stroke-dasharray="' + (c * clamp(v / max, 0, 1)).toFixed(2) + ' ' + c.toFixed(2) + '" transform="rotate(-90 50 50)"/>';
      });
      round.innerHTML = svg + '</svg>' + (vals.length === 1 ? '<div class="tray-chart__center"><b>' + val(vals[0]) + '</b><span>' + esc(labels[0] || '') + '</span></div>' : '');
      /* A stop for Tab like every chart, so its summary is read there; its figures are in the middle or in the key. */
      round.setAttribute('tabindex', '0');
      round.setAttribute('role', 'img');
      round.setAttribute('aria-label', summary);
      el.appendChild(round);
      if (vals.length > 1) {
        var key = make('table', 'tray-chart__key');
        key.innerHTML = '<tbody>' + vals.map(function (v, i) { return '<tr><th scope="row"><span class="tray-swatch" style="' + colour(i) + '"></span>' + esc(labels[i]) + '</th><td>' + val(v) + '</td></tr>'; }).join('') + '</tbody>';
        el.appendChild(key);
      }
    }

    function radar() {
      var n = labels.length, max = cfg.max || niceMax(Math.max.apply(null, all())), R = 36;
      function pt(i, v) { var a = -Math.PI / 2 + i / n * Math.PI * 2, r = v / max * R; return [50 + r * Math.cos(a), 50 + r * Math.sin(a)]; }
      function poly(fn) { return labels.map(function (_, i) { var p = fn(i); return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' '); }
      var round = make('div', 'tray-chart__round'), svg = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">';
      [1 / 3, 2 / 3, 1].forEach(function (f) { svg += '<polygon class="tray-chart__web" points="' + poly(function (i) { return pt(i, max * f); }) + '"/>'; });
      labels.forEach(function (_, i) { var p = pt(i, max); svg += '<line class="tray-chart__web" x1="50" y1="50" x2="' + p[0].toFixed(2) + '" y2="' + p[1].toFixed(2) + '"/>'; });
      series.forEach(function (s, k) { svg += '<polygon class="tray-chart__shape" style="' + colour(k) + '" points="' + poly(function (i) { return pt(i, s.values[i]); }) + '"/>'; });
      round.innerHTML = svg + '</svg>' + labels.map(function (l, i) { var p = pt(i, max * 1.24); return '<span class="tray-chart__spoke" style="inset-inline-start:' + p[0].toFixed(1) + '%;inset-block-start:' + p[1].toFixed(1) + '%" aria-hidden="true">' + esc(l) + '</span>'; }).join('');
      round.setAttribute('tabindex', '0');
      round.setAttribute('role', 'img');
      round.setAttribute('aria-label', summary);
      round.style.direction = 'ltr';
      el.appendChild(round);
      var tip = make('div', 'tray-tip'), active = null;
      tip.hidden = true;
      round.appendChild(tip);
      el.appendChild(live);
      function show(i, announce) {
        active = i;
        tip.hidden = i == null;
        if (i == null) return;
        tip.innerHTML = '<span>' + esc(labels[i]) + '</span>' + series.map(function (s, k) { return '<span class="tray-tip__row"><span class="tray-swatch" style="' + colour(k) + '"></span>' + esc(s.name) + '<b>' + val(s.values[i]) + '</b></span>'; }).join('');
        var p = pt(i, max * .6);
        tip.style.left = p[0] + '%';
        tip.style.top = p[1] + '%';
        tip.style.transform = 'translate(-50%, -50%)';
        if (announce) live.textContent = labels[i] + ': ' + series.map(function (s) { return s.name + ' ' + val(s.values[i]); }).join(', ');
      }
      function point(e) {
        var box = round.getBoundingClientRect(), a = Math.atan2(e.clientY - box.top - box.height / 2, e.clientX - box.left - box.width / 2) + Math.PI / 2;
        show(Math.round(((a + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * n) % n);
      }
      /* a tap moves nothing: it shows the spoke under it as it lands */
      round.addEventListener('pointermove', point);
      round.addEventListener('pointerdown', point);
      round.addEventListener('pointerleave', lingers(round, function () { show(null); }));
      round.addEventListener('blur', function () { show(null); });
      round.addEventListener('keydown', function (e) {
        var step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
        if (step) { e.preventDefault(); show(((active == null ? (step > 0 ? -1 : 0) : active) + step + n) % n, true); }
        else if (e.key === 'Escape') show(null);
      });
      if (series.length > 1) legend(series.map(function (s) { return s.name; }));
    }

    if (type === 'donut') donut();
    else if (type === 'radial') radial();
    else if (type === 'radar') radar();
    else if (type === 'bar' && cfg.horizontal) horizontal();
    else cartesian();
    table();
    return { update: function (next) { return UI.chart(el, next); } };
  };
  UI.register('chart', function (el) { if (el.hasAttribute('data-chart')) UI.chart(el); });

  /* ---------- Data table ----------
     data-tray="datatable" on the wrapper of a .tray-table. Optional parts, found by attribute:
     .tray-sort buttons in column heads, [data-filter] input, [data-select-all] and [data-select] checkboxes, [data-selected-count],
     data-page-size on the wrapper with [data-page-prev], [data-page-next], [data-page-status], and a [data-empty] row. */
  UI.register('datatable', function (root) {
    var table = $('table', root), body = table.tBodies[0];
    var empty = $('[data-empty]', body), rows = $$('tr', body).filter(function (r) { return r !== empty; });
    var filter = $('[data-filter]', root), size = +(root.dataset.pageSize || 0), page = 0;
    var status = $('[data-page-status]', root), prev = $('[data-page-prev]', root), next = $('[data-page-next]', root);
    var count = $('[data-selected-count]', root), allBox = $('[data-select-all]', root);
    function matched() {
      var q = filter ? filter.value.trim().toLowerCase() : '';
      return rows.filter(function (r) { return !q || r.textContent.toLowerCase().indexOf(q) >= 0; });
    }
    function key(cell) {
      var v = cell.dataset.value != null ? cell.dataset.value : cell.textContent.trim();
      var t = /^\d{4}-\d{2}-\d{2}/.test(v) ? Date.parse(v) : NaN;  /* a date written as 2026-11-27 or 2026-11-27T10:31 */
      if (!isNaN(t)) return t;
      var n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
      return /^[^a-z]*[0-9]/i.test(v) && !isNaN(n) ? n : String(v).toLowerCase();
    }
    function paint() {
      var list = matched(), per = size || list.length || 1, pages = Math.max(1, Math.ceil(list.length / per));
      page = clamp(page, 0, pages - 1);
      rows.forEach(function (r) { r.hidden = true; });
      list.slice(page * per, page * per + per).forEach(function (r) { r.hidden = false; });
      if (empty) empty.hidden = list.length > 0;
      if (status) status.textContent = list.length ? (page * per + 1) + '–' + Math.min(list.length, (page + 1) * per) + ' of ' + list.length : 'Nothing to show';
      /* A button that turns off under the reader's finger, on the first or the last page, hands focus to the other one
         (or to the count when both are off), so focus is not dropped to the top of the page. */
      var first = page === 0, last = page >= pages - 1;
      if (prev && !first) prev.disabled = false;
      if (next && !last) next.disabled = false;
      if (prev && first) { rescue(prev, !last && next || status); prev.disabled = true; }
      if (next && last) { rescue(next, !first && prev || status); next.disabled = true; }
      /* The row's checkbox carries the state: aria-selected means nothing on the row of a plain table. */
      var picked = 0;
      rows.forEach(function (r) { var c = $('[data-select]', r); if (c && c.checked) picked += 1; });
      if (count) count.textContent = picked ? picked + ' of ' + rows.length + ' selected' : rows.length + ' rows';
      if (allBox) { allBox.checked = picked === rows.length && rows.length > 0; allBox.indeterminate = picked > 0 && picked < rows.length; }
      fire(root, 'change', { selected: picked, page: page });
    }
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('.tray-sort');
      if (btn) {
        var th = btn.closest('th'), i = [].indexOf.call(th.parentNode.children, th), dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
        $$('th', table.tHead).forEach(function (h) { h.removeAttribute('aria-sort'); var u = $('.tray-sort use', h); if (u) u.setAttribute('href', '#tray-i-arrow-up-down'); });
        th.setAttribute('aria-sort', dir);
        /* the icon is optional: aria-sort on the head says the order, the arrow only shows it */
        var use = $('use', btn);
        if (use) use.setAttribute('href', '#tray-i-arrow-' + (dir === 'ascending' ? 'up' : 'down'));
        rows.sort(function (a, b) { var x = key(a.children[i]), y = key(b.children[i]); return (x > y ? 1 : x < y ? -1 : 0) * (dir === 'ascending' ? 1 : -1); });
        rows.forEach(function (r) { body.insertBefore(r, empty || null); });
        page = 0; paint();
      }
      if (e.target.closest('[data-page-prev]')) { page -= 1; paint(); }
      if (e.target.closest('[data-page-next]')) { page += 1; paint(); }
    });
    root.addEventListener('change', function (e) {
      if (e.target === allBox) matched().forEach(function (r) { var c = $('[data-select]', r); if (c) c.checked = allBox.checked; });
      if (e.target === allBox || e.target.matches('[data-select]')) paint();
    });
    if (filter) filter.addEventListener('input', function () { page = 0; paint(); });
    paint();
  });

  /* ---------- Conversation ---------- */

  /* Message scroller: data-tray="scroller" on .tray-scroller holding .tray-scroller__viewport and an optional .tray-scroller__jump button.
     It stays at the newest message while the reader is there, and offers a jump when they have scrolled up. */
  UI.register('scroller', function (root) {
    var view = $('.tray-scroller__viewport', root), jump = $('.tray-scroller__jump', root), count = jump && $('[data-count]', jump), fresh = 0;
    function atEnd() { return view.scrollHeight - view.scrollTop - view.clientHeight < 24; }
    function toEnd(smooth) {
      var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      view.scrollTo({ top: view.scrollHeight, behavior: smooth && !calm ? 'smooth' : 'auto' });
    }
    function paint() {
      if (atEnd()) fresh = 0;
      /* "Latest" goes once the newest message is in view: focus on it moves to the conversation it scrolled. */
      if (jump && atEnd()) rescue(jump, view);
      if (jump) jump.hidden = atEnd();
      if (count) { count.textContent = fresh ? String(fresh) : ''; count.hidden = !fresh; }
    }
    view.setAttribute('tabindex', '0');
    view.setAttribute('role', 'log');
    view.addEventListener('scroll', paint, { passive: true });
    if (jump) jump.addEventListener('click', function () { toEnd(true); });
    /* Any change of what is in it is followed while the reader is at the end: a new row, words streamed into the last
       message (as new nodes, or a text that grows in place). Only new rows at the end count as new messages: words streamed
       into a message are not one, and older messages loaded above are not new. */
    new MutationObserver(function (records) {
      var thread = $('.tray-thread', view) || view, added = [];
      records.forEach(function (r) { [].forEach.call(r.addedNodes, function (n) { if (n.nodeType === 1 && n.parentNode === thread) added.push(n); }); });
      var rows = added.filter(function (n) { for (var s = n.nextElementSibling; s; s = s.nextElementSibling) if (added.indexOf(s) < 0) return false; return true; }).length;
      if (root.__pinned) { toEnd(false); } else { fresh += rows; }
      paint();
    }).observe(view, { childList: true, subtree: true, characterData: true });
    view.addEventListener('scroll', function () { root.__pinned = atEnd(); }, { passive: true });
    root.__pinned = root.dataset.start !== 'top';
    watch(view, function () { if (root.__pinned) toEnd(false); paint(); });
    root.__scroller = { toEnd: toEnd, atEnd: atEnd };
  });

  /* Reaction: data-tray="reaction" on a button with aria-pressed and a [data-count] inside. */
  UI.register('reaction', function (btn) {
    var out = $('[data-count]', btn);
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      if (out) out.textContent = String(Math.max(0, (+out.textContent || 0) + (on ? 1 : -1)));
    });
  });

  /* Show more: data-tray="more" on a button whose aria-controls names a clamped .tray-bubble. */
  UI.register('more', function (btn) {
    var target = document.getElementById(btn.getAttribute('aria-controls'));
    if (!target) return;
    function paint() { var open = !target.hasAttribute('data-clamp'); btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? 'Show less' : 'Show more'; }
    btn.addEventListener('click', function () { target.toggleAttribute('data-clamp'); paint(); });
    paint();
  });

  /* Questionnaire: data-tray="questionnaire" on the form. Each .tray-questionnaire__step is one question; [data-back] and [data-next]
     move between them; [data-progress] and .tray-steps follow; a [data-done] block shows the answers and takes focus, so it is read.
     Fires tray:complete with detail.answers. */
  UI.register('questionnaire', function (root) {
    /* A filled pill carries data-done too: the block of answers is the [data-done] outside the pills. */
    var done = $$('[data-done]', root).filter(function (n) { return !n.closest('.tray-steps'); })[0];
    var steps = $$('.tray-questionnaire__step', root), back = $('[data-back]', root), next = $('[data-next]', root);
    var progress = $('[data-progress]', root), pills = $$('.tray-steps span', root), foot = $('.tray-questionnaire__foot', root), i = 0;
    /* Where focus goes in a question: the answer already chosen, or its first field. */
    function field(step) { return step && ($('input[type="radio"]:checked', step) || $('input:not([hidden]), textarea:not([hidden])', step)); }
    function answer(step) {
      var picked = $$('input:checked', step).map(function (inp) {
        var other = inp.hasAttribute('data-other') && $('[data-other-text]', step);
        return other && other.value.trim() ? other.value.trim() : (inp.dataset.label || inp.value);
      });
      var text = $('textarea, input[type="text"]:not([data-other-text])', step);
      if (!picked.length && text && text.value.trim()) picked = [text.value.trim()];
      return picked;
    }
    function paint() {
      var end = i >= steps.length;
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      /* What comes in is shown before what goes is hidden, so focus in the part that goes can move to it:
         from Finish to the answers, from "Change the answers" to the first question. */
      if (done && end) { done.hidden = false; done.setAttribute('tabindex', '-1'); rescue(foot, done); }
      if (foot && !end) { foot.hidden = false; rescue(done, function () { return field(steps[i]); }); }
      if (done && !end) done.hidden = true;
      if (foot && end) foot.hidden = true;
      if (end) return;
      if (progress) progress.textContent = 'Question ' + (i + 1) + ' of ' + steps.length;
      pills.forEach(function (p, k) { p.toggleAttribute('data-done', k <= i); });
      /* Back turns off on the first question and Next until a question is answered: focus on either goes to the question. */
      if (back) { if (i === 0) rescue(back, function () { return field(steps[0]) || next; }); back.disabled = i === 0; }
      if (next) {
        var wait = !steps[i].hasAttribute('data-optional') && !answer(steps[i]).length;
        if (wait) rescue(next, function () { return field(steps[i]); });
        next.disabled = wait;
        next.firstChild.textContent = i === steps.length - 1 ? 'Finish' : 'Next';
      }
      $$('[data-other-text]', steps[i]).forEach(function (t) { var o = $('[data-other]', steps[i]); t.hidden = !(o && o.checked); });
    }
    function finish() {
      var answers = steps.map(function (s) { return { question: ($('legend', s) || s).textContent.trim(), answer: answer(s) }; });
      var list = done && $('.tray-questionnaire__answers', done);
      if (list) list.innerHTML = answers.map(function (a) { return '<div><dt>' + esc(a.question) + '</dt><dd>' + esc(a.answer.join(', ') || 'Skipped') + '</dd></div>'; }).join('');
      fire(root, 'complete', { answers: answers });
    }
    root.addEventListener('change', paint);
    root.addEventListener('input', paint);
    root.addEventListener('submit', function (e) { e.preventDefault(); });
    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-back]')) { i = Math.max(0, i - 1); paint(); }
      else if (e.target.closest('[data-next]')) { i += 1; if (i >= steps.length) finish(); paint(); var f = field(steps[i]); if (f) f.focus(); }
      else if (e.target.closest('[data-restart]')) { i = 0; paint(); }
    });
    paint();
  });

  /* Copy: data-tray="copy" on a button with data-target="#id"; copies that element's text (a field's value) and says what
     happened for two seconds: on the button, and aloud through a status beside it, since a button's own content is not
     announced as it changes. A copy the browser refuses says so; it never claims "Copied". */
  var lastSaid = '';
  /* statusAfter(el): a hidden role="status" region placed after el. say(region, words) has it read the words aloud. */
  function statusAfter(el) {
    var status = document.createElement('span');
    status.className = 'tray-vh';
    status.setAttribute('role', 'status');
    el.insertAdjacentElement('afterend', status);
    return status;
  }
  function say(status, words) {
    status.textContent = '';
    /* the same words twice are read only if they differ: a no-break space makes them differ, and is not read */
    var said = words === lastSaid ? words + '\u00a0' : words;
    lastSaid = said;
    requestAnimationFrame(function () { status.textContent = said; });
  }
  UI.register('copy', function (btn) {
    var label = $('[data-label]', btn), was = label ? label.textContent : '', timer = null;
    var status = statusAfter(btn);
    function report(ok) {
      var words = ok ? 'Copied' : 'Copy failed';
      clearTimeout(timer);
      if (label) label.textContent = words;
      btn.toggleAttribute('data-copied', ok);
      btn.toggleAttribute('data-failed', !ok);
      say(status, words);
      timer = setTimeout(function () {
        if (label) label.textContent = was;
        btn.removeAttribute('data-copied'); btn.removeAttribute('data-failed');
        status.textContent = '';
      }, 2000);
    }
    btn.addEventListener('click', function () {
      var source = document.querySelector(btn.dataset.target);
      if (!source) return;
      var text = source.matches('input, textarea') ? source.value : source.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { report(true); }, function () { report(false); });
      else report(false);
    });
  });

  /* ---------- Application set: banners, metrics, billing, account, onboarding ---------- */

  /* beyond(el): where focus goes when el is taken away from the page: the first control after it, as Tab would go,
     or else the main content, or else the last control before it. */
  var CONTROLS = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
  function beyond(el) {
    var all = $$(CONTROLS).filter(function (n) { return !el.contains(n) && n.getClientRects().length > 0; });
    var after = all.filter(function (n) { return el.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING; })[0];
    return after || $('main, [role="main"]') || all.filter(function (n) { return el.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_PRECEDING; }).pop();
  }
  /* The control to focus in el: el itself, or the first one inside it. */
  function controlIn(el) { return el && (el.matches(CONTROLS) ? el : $(CONTROLS, el)); }

  /* A pip repeats the count that the aria-label of its button already says ("Notifications, 2 unread"): it is hidden from
     screen readers, so the number is not read twice. */
  UI.upgrade('.tray-pip', function (pip) { pip.setAttribute('aria-hidden', 'true'); });

  /* dismiss: a button that takes away the block it sits in. Put data-dismissable on that block, or name it with data-target.
     Focus moves on to the next control in the page, so it is not dropped to the top. */
  UI.register('dismiss', function (btn) {
    btn.addEventListener('click', function () {
      var root = btn.getAttribute('data-target') ? $(btn.getAttribute('data-target')) : btn.closest('[data-dismissable]');
      if (!root) return;
      rescue(root, function () { return beyond(root); });
      hide(root);
      fire(root, 'close');
    });
  });

  /* spark: a small trend line from data-points="3,5,4,8". It is decoration: the figure beside it carries the value. */
  UI.register('spark', function (el) {
    var pts = (el.getAttribute('data-points') || '').split(',').map(Number).filter(function (n) { return !isNaN(n); });
    if (pts.length < 2) return;
    var lo = Math.min.apply(null, pts), hi = Math.max.apply(null, pts), span = hi - lo || 1, w = 100, h = 32, pad = 3;
    var d = pts.map(function (v, i) {
      return (i ? 'L' : 'M') + ((i / (pts.length - 1)) * w).toFixed(1) + ' ' + (pad + (1 - (v - lo) / span) * (h - 2 * pad)).toFixed(1);
    }).join('');
    el.innerHTML = '<svg class="tray-spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>';
  });

  /* uptime: a bar per day, oldest first. data-days="90"; data-incidents='{"12":"degraded","47":"down"}' counts days back from today. */
  UI.register('uptime', function (el) {
    var days = parseInt(el.getAttribute('data-days'), 10) || 90, inc = {}, html = '';
    try { inc = JSON.parse(el.getAttribute('data-incidents') || '{}'); } catch (e) { inc = {}; }
    for (var i = days - 1; i >= 0; i -= 1) html += '<span' + (inc[i] ? ' data-s="' + esc(inc[i]) + '"' : '') + '></span>';
    el.innerHTML = html;
    el.setAttribute('aria-hidden', 'true');
  });

  /* pricing: a billing-period switch. Inside the wrapper, an element with data-monthly and data-yearly shows the text of the chosen period.
     Focus stays on the switch while the prices change, so a hidden status reads the new ones. */
  UI.register('pricing', function (root) {
    /* The status region is there from the start, empty: a screen reader hears a live region only once it knows it, so
       one made at the first change could lose the first prices. */
    var status = document.createElement('span');
    status.className = 'tray-vh';
    status.setAttribute('role', 'status');
    root.appendChild(status);
    function words(el) { return [].slice.call(el.childNodes).map(function (n) { return n.textContent.trim(); }).filter(Boolean).join(' '); }
    function spoken(on, period) {
      var label = on && on.closest('label') ? on.closest('label').textContent.trim() : period;
      var plans = $$('.tray-plan', root).filter(function (p) { return $('[data-' + period + ']', p); }).map(function (p) {
        var h = $('.tray-plan__name', p), price = $('.tray-plan__price', p);
        /* the plan's name is the first words of its heading, before a badge such as "Most chosen" */
        var name = h ? (h.firstChild && h.firstChild.nodeType === 3 ? h.firstChild.textContent : h.textContent).trim() : '';
        return (name ? name + ', ' : '') + (price ? words(price) : '');
      });
      /* a plan comparison has no cards: each plan is the head of a column, its name and then its price */
      if (!plans.length) plans = $$('th[scope="col"]', root).filter(function (th) { return $('[data-' + period + ']', th); }).map(function (th) {
        var name = th.firstChild && th.firstChild.nodeType === 3 ? th.firstChild.textContent.trim() : '';
        return (name ? name + ', ' : '') + words($('[data-' + period + ']', th));
      });
      return label + ' prices' + (plans.length ? ': ' + plans.join('; ') : '');
    }
    function apply(tell) {
      var on = $('input[type="radio"][name="' + (root.getAttribute('data-name') || 'period') + '"]:checked', root);
      var period = on ? on.value : 'monthly';
      root.setAttribute('data-period', period);
      $$('[data-' + period + ']', root).forEach(function (n) { n.textContent = n.getAttribute('data-' + period); });
      if (!tell) return;
      say(status, spoken(on, period));
      fire(root, 'change', { period: period });
    }
    root.addEventListener('change', function (e) { if (e.target.type === 'radio') apply(true); });
    apply(false);
  });

  /* mask: while it is typed, groups a card number in fours (data-mask="card") or writes an expiry date as MM/YY (data-mask="expiry"). */
  UI.register('mask', function (input) {
    var kind = input.getAttribute('data-mask');
    input.addEventListener('input', function () {
      var at = input.selectionStart, v = input.value, d = v.replace(/\D/g, '');
      var before = at == null ? d.length : v.slice(0, at).replace(/\D/g, '').length;
      if (kind === 'card') input.value = d.slice(0, 19).replace(/(.{4})(?=.)/g, '$1 ');
      else if (kind === 'expiry') { d = d.slice(0, 4); input.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; }
      else return;
      /* Writing the value puts the caret at the end: put it back after the digit it followed, so a number edited in the middle keeps its place. */
      if (at == null || document.activeElement !== input) return;
      var out = input.value, pos = 0, seen = 0;
      while (pos < out.length && seen < before) { if (/\d/.test(out.charAt(pos))) seen += 1; pos += 1; }
      input.setSelectionRange(pos, pos);
    });
  });

  /* secret: shows and hides a key and copies the real value either way. data-value holds the key; the code element holds its masked form. */
  UI.register('secret', function (root) {
    var code = $('code', root), value = root.getAttribute('data-value') || '', masked = code ? code.textContent : '', shown = false;
    var show = $('[data-secret="show"]', root), copy = $('[data-secret="copy"]', root);
    var labels = [show && show.getAttribute('aria-label') || 'Show the key', show && show.getAttribute('data-label-on') || 'Hide the key'];
    if (show) {
      /* The name says what a press will do, "Show the key" or "Hide the key". aria-pressed would say it a second time
         ("Hide the key, pressed"), so the button carries none. */
      show.removeAttribute('aria-pressed');
      show.addEventListener('click', function () {
        shown = !shown;
        code.textContent = shown ? value : masked;
        show.setAttribute('aria-label', labels[shown ? 1 : 0]);
        show.innerHTML = icon(shown ? 'eye-off' : 'eye');
      });
    }
    if (copy) {
      /* What happened is shown on the button for a moment and said through a hidden status beside it: a copy the
         browser refuses says so, and never shows the check. */
      var status = statusAfter(copy), timer = null;
      var report = function (ok) {
        clearTimeout(timer);
        copy.innerHTML = icon(ok ? 'check' : 'circle-alert');
        copy.toggleAttribute('data-failed', !ok);
        say(status, ok ? 'Copied' : 'Copy failed');
        timer = setTimeout(function () { copy.innerHTML = icon('copy'); copy.removeAttribute('data-failed'); status.textContent = ''; }, 1800);
        fire(root, 'change', { copied: ok });
      };
      copy.addEventListener('click', function () {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(value).then(function () { report(true); }, function () { report(false); });
        else report(false);
      });
    }
  });

  /* A chip with a remove button, as the tag input and the filter bar make them. A wrong one (wrong: what is wrong, in words)
     carries data-invalid and says so in a hidden span, since its danger edge is seen and not read. */
  function chipOf(value, label, wrong) {
    var chip = document.createElement('span');
    chip.className = 'tray-chip';
    chip.setAttribute('data-value', value);
    if (wrong) chip.setAttribute('data-invalid', '');
    chip.innerHTML = esc(label || value) + (wrong ? wrongText(wrong) : '') + '<button type="button" class="tray-chip__x" aria-label="Remove ' + esc(label || value) + '">' + icon('x', 'tray-icon--sm') + '</button>';
    return chip;
  }
  function wrongText(words) { return '<span class="tray-vh" data-invalid-text>, ' + esc(words) + '</span>'; }

  /* taginput: several values in one field. Enter or a comma adds one, Backspace on an empty field takes the last away, a pasted list is split.
     A wrong value (data-pattern="email") keeps its chip, marked data-invalid, and makes the text field aria-invalid; at data-max
     what was typed stays in the field and the limit is said. */
  UI.register('taginput', function (root) {
    var input = $('input:not([type="hidden"])', root), store = $('input[type="hidden"]', root);
    if (!input) return;
    var kind = root.getAttribute('data-pattern'), max = parseInt(root.getAttribute('data-max'), 10) || Infinity;
    var wrong = root.getAttribute('data-invalid-text') || (kind === 'email' ? 'not an email address' : 'not valid');
    var live = document.createElement('span'), mine = false;
    live.className = 'tray-vh';
    live.setAttribute('aria-live', 'polite');
    root.appendChild(live);
    function ok(v) { return kind !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    function chips() { return $$('.tray-chip', root); }
    function values() { return chips().map(function (c) { return c.getAttribute('data-value'); }); }
    /* aria-invalid belongs on the text field, which a screen reader reaches, not on the tray around it. The behaviour takes
       away only the mark it set itself: an error put on the field from elsewhere (a Field's, the server's) stays. */
    function mark() {
      var bad = !!$('.tray-chip[data-invalid]', root);
      root.removeAttribute('aria-invalid');
      if (bad && input.getAttribute('aria-invalid') !== 'true') { input.setAttribute('aria-invalid', 'true'); mine = true; }
      else if (!bad && mine) { input.removeAttribute('aria-invalid'); mine = false; }
    }
    function sync(said) {
      if (store) store.value = values().join(',');
      mark();
      if (said) say(live, said);
      fire(root, 'change', { values: values(), valid: !$('.tray-chip[data-invalid]', root) });
    }
    /* add(v, words): puts one value in, and what happened in words. False when there is no room for it. */
    function add(v, words) {
      if (values().indexOf(v) >= 0) { words.push(v + ' is already in the list'); return true; }
      if (values().length >= max) return false;
      var bad = !ok(v);
      root.insertBefore(chipOf(v, null, bad ? wrong : null), input);
      words.push(v + ' added' + (bad ? ', ' + wrong : ''));
      return true;
    }
    /* addAll(list): one value typed or a whole list pasted, said in one message ("jam added. honey added. salt added"),
       so a pasted list is heard whole and not only its last value. Returns what did not fit, for the field to keep. */
    function addAll(list) {
      var words = [], before = values().length;
      var left = list.map(function (v) { return String(v).trim().replace(/[,;]+$/, ''); }).filter(Boolean).filter(function (v) { return !add(v, words); });
      if (left.length) words.push(left.join(', ') + ' not added: the limit is ' + max);
      if (values().length !== before) sync(words.join('. '));
      else if (words.length) say(live, words.join('. '));
      return left;
    }
    function drop(chip) { var v = chip.getAttribute('data-value'); chip.remove(); sync(v + ' removed'); }
    root.addEventListener('click', function (e) {
      var x = e.target.closest('.tray-chip__x');
      if (x) { drop(x.closest('.tray-chip')); input.focus(); } else if (e.target === root) input.focus();
    });
    input.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) { e.preventDefault(); if (!addAll([input.value]).length) input.value = ''; }
      else if (e.key === 'Backspace' && !input.value) { var all = chips(); if (all.length) drop(all[all.length - 1]); }
    });
    input.addEventListener('paste', function (e) {
      var text = (e.clipboardData || window.clipboardData).getData('text');
      if (!/[,;\s]/.test(text.trim())) return;
      e.preventDefault();
      /* what does not fit stays in the field, so nothing pasted is lost */
      var left = addAll(text.split(/[,;\s]+/));
      if (left.length) input.value = left.join(', ');
    });
    input.addEventListener('blur', function () { if (input.value.trim() && !addAll([input.value]).length) input.value = ''; });
    chips().forEach(function (c) {
      if (!c.hasAttribute('data-value')) c.setAttribute('data-value', c.textContent.trim());
      var x = $('.tray-chip__x', c);
      if (c.hasAttribute('data-invalid') && !$('[data-invalid-text]', c)) { if (x) x.insertAdjacentHTML('beforebegin', wrongText(wrong)); else c.insertAdjacentHTML('beforeend', wrongText(wrong)); }
    });
    if (store) store.value = values().join(',');
    mark();
  });

  /* dropzone: takes files that are dropped or chosen and lists them in the element named by data-list. data-max-mb marks a file as too large. It uploads nothing. */
  UI.register('dropzone', function (root) {
    var input = $('input[type="file"]', root), list = root.getAttribute('data-list') ? $(root.getAttribute('data-list')) : null;
    var max = parseFloat(root.getAttribute('data-max-mb')) || 0;
    function size(b) { return b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1) + ' MB'; }
    function take(files) {
      files = [].slice.call(files || []);
      if (!files.length) return;
      if (list) files.forEach(function (f) {
        var big = max && f.size > max * 1048576, row = document.createElement('div');
        row.className = 'tray-attachment';
        if (big) row.setAttribute('data-state', 'error');
        row.innerHTML = '<span class="tray-attachment__media">' + icon(/^image\//.test(f.type) ? 'image' : 'file') + '</span>' +
          '<span class="tray-attachment__body"><span class="tray-attachment__name">' + esc(f.name) + '</span><span class="tray-attachment__meta">' +
          (big ? esc((root.getAttribute('data-too-large') || 'Too large. The limit is {max} MB.').replace('{max}', max)) : size(f.size)) + '</span></span>' +
          '<button class="tray-btn tray-btn--ghost tray-btn--xs tray-btn--icon" type="button" aria-label="Remove ' + esc(f.name) + '">' + icon('x') + '</button>';
        $('button', row).addEventListener('click', function () {
          /* focus goes to the next file's remove button, or the one before, or back to the field once the list is empty */
          rescue(row, function () { var sib = row.nextElementSibling || row.previousElementSibling; return (sib && $('button', sib)) || input || root; });
          row.remove();
          fire(root, 'change', { removed: f.name });
        });
        list.appendChild(row);
      });
      fire(root, 'change', { files: files });
    }
    ['dragenter', 'dragover'].forEach(function (n) { root.addEventListener(n, function (e) { e.preventDefault(); root.setAttribute('data-over', ''); }); });
    ['dragleave', 'drop'].forEach(function (n) { root.addEventListener(n, function (e) { e.preventDefault(); root.removeAttribute('data-over'); }); });
    root.addEventListener('drop', function (e) { take(e.dataTransfer && e.dataTransfer.files); });
    if (input) input.addEventListener('change', function () { take(input.files); input.value = ''; });
  });

  /* checklist: a button with data-task-done finishes its task; the next open task becomes the current one and the progress follows.
     A done task says so in words too: a hidden ", done" after its title, which 80-saas.css lets a screen reader hear only while
     the task carries data-done. Markup that holds its own [data-task-state] span keeps its words. */
  UI.register('checklist', function (root) {
    var tasks = $$('.tray-task', root);
    tasks.forEach(function (t) {
      var b = $('.tray-task__body > b', t);
      if (b && !$('[data-task-state]', t)) b.insertAdjacentHTML('beforeend', '<span class="tray-vh" data-task-state>, done</span>');
    });
    function paint() {
      var done = tasks.filter(function (t) { return t.hasAttribute('data-done'); }).length;
      var next = tasks.filter(function (t) { return !t.hasAttribute('data-done'); })[0];
      tasks.forEach(function (t) { if (t === next) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current'); });
      var bar = $('.tray-progress__bar', root), val = $('.tray-progress__value', root), end = $('[data-checklist-done]', root);
      if (bar) {
        bar.style.setProperty('--tray-v', Math.round(done / tasks.length * 100));
        bar.setAttribute('aria-valuemax', tasks.length);
        bar.setAttribute('aria-valuenow', done);
        bar.setAttribute('aria-valuetext', done + ' of ' + tasks.length);
      }
      if (val) val.textContent = done + ' of ' + tasks.length;
      if (end) end.hidden = done < tasks.length;
      return done;
    }
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-task-done]');
      if (!btn) return;
      btn.closest('.tray-task').setAttribute('data-done', '');
      var done = paint(), next = $('.tray-task[aria-current] .tray-btn', root), end = $('[data-checklist-done]', root);
      /* Focus follows to the next task's button. After the last one, whose button goes, it moves to the closing line, so that line is read. */
      if (next) next.focus();
      else rescue(btn, end && !end.hidden ? end : root);
      fire(root, done === tasks.length ? 'complete' : 'change', { done: done, total: tasks.length });
    });
    paint();
  });

  /* tour: steps that point at parts of the page, one at a time. Each .tray-tour names its target with data-for; buttons carry data-tour="next", "back" or "skip". */
  UI.register('tour', function (root) {
    var steps = $$('.tray-tour', root), at = 0;
    steps.forEach(function (s, i) { if (!s.hidden) at = i; });
    function target(s) { return s && s.getAttribute('data-for') ? $(s.getAttribute('data-for'), root) : null; }
    function place(s, t) {
      var r = root.getBoundingClientRect(), b = t.getBoundingClientRect();
      var top = b.bottom - r.top + 14, above = b.top - r.top - s.offsetHeight - 14;
      if (top + s.offsetHeight > r.height && above >= 0) top = above;
      s.style.top = top + 'px';
      s.style.left = clamp(b.left - r.left, 8, Math.max(8, r.width - s.offsetWidth - 8)) + 'px';
    }
    function show(i) {
      steps.forEach(function (s, n) {
        s.hidden = n !== i;
        var t = target(s);
        if (t) { if (n === i) t.setAttribute('data-tour-on', ''); else t.removeAttribute('data-tour-on'); }
      });
      at = i;
      var s = steps[i], count = s && $('.tray-tour__count', s);
      if (!s) return;
      if (count) count.textContent = (i + 1) + ' of ' + steps.length;
      if (target(s)) place(s, target(s));
    }
    /* The tour ends: focus in the step goes to the part the step pointed at, the last thing it spoke of, or else to the area. */
    function end(finished) {
      var s = steps[at], t = target(s);
      if (s) rescue(s, function () { return controlIn(t) || t || root; });
      show(-1);
      fire(root, 'complete', { finished: finished });
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tour]');
      if (!b) return;
      var act = b.getAttribute('data-tour');
      /* Back on the first step has nowhere to go and does nothing; only Next on the last step finishes the tour */
      if (act === 'back') { if (at <= 0) return; show(at - 1); }
      else if (act === 'next' && at < steps.length - 1) show(at + 1);
      else if (act === 'next' || act === 'skip') { end(act === 'next'); return; }
      else return;
      var go = $('[data-tour="next"]', steps[at]);
      if (go) go.focus();
      fire(root, 'change', { step: at + 1 });
    });
    /* Escape anywhere in the area closes the tour, as Skip does: also from the part a step covers (on a phone the step
       may lie over a control), where focus is not in the step. A menu or a list there closes first on its own Escape. */
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || e.defaultPrevented || at < 0 || !steps[at]) return;
      e.preventDefault();
      end(false);
    });
    watch(root, function () { if (at >= 0 && steps[at]) show(at); });
  });

  /* feedback: choosing a rating opens the follow-up; sending it shows the thanks and reports both. */
  UI.register('feedback', function (root) {
    var more = $('[data-feedback="more"]', root), thanks = $('[data-feedback="thanks"]', root);
    root.addEventListener('change', function (e) { if (e.target.name === 'rating' && more) more.hidden = false; });
    root.addEventListener('submit', function (e) {
      e.preventDefault();
      var r = $('input[name="rating"]:checked', root), t = $('textarea', root);
      $$('[data-feedback="ask"], [data-feedback="more"]', root).forEach(function (n) { n.hidden = true; });
      if (thanks) { thanks.hidden = false; thanks.setAttribute('tabindex', '-1'); thanks.focus(); }
      fire(root, 'complete', { rating: r ? r.value : null, comment: t ? t.value : '' });
    });
  });

  /* consent: buttons with data-consent="all", "necessary" or "save" close the panel and report the choice of each checkbox by name. */
  UI.register('consent', function (root) {
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-consent]');
      if (!b) return;
      var kind = b.getAttribute('data-consent'), choice = {};
      $$('input[type="checkbox"]', root).forEach(function (c) {
        if (kind === 'all') c.checked = true;
        if (kind === 'necessary' && !c.disabled) c.checked = false;
        choice[c.name || c.id] = c.checked;
      });
      /* the answer closes the panel under the reader's finger: focus moves on to the next control in the page */
      rescue(root, function () { return beyond(root); });
      root.hidden = true;
      fire(root, 'complete', { choice: choice });
    });
  });

  /* notices: opening a notification marks it read, "mark all as read" clears the rest, and the count on the trigger follows:
     in the pip, which is aria-hidden, and in the trigger's aria-label ("Notifications, 2 unread"). */
  UI.register('notices', function (root) {
    var scope = root.closest('.tray-anchor') || root;
    var bell = scope !== root ? $(':scope > button, :scope > a', scope) : null;
    var named = bell && bell.getAttribute('aria-label') ? bell.getAttribute('aria-label').replace(/,\s*\d+\s+unread$/i, '') : '';
    function read(n) { n.removeAttribute('data-unread'); var v = $('.tray-vh', n); if (v) v.remove(); }
    function paint() {
      var n = $$('.tray-notice[data-unread]', root).length, only = $('input[name="notices-view"][value="unread"]', root);
      only = !!(only && only.checked);
      $$('[data-notices-count]', scope).forEach(function (p) { p.textContent = n ? String(n) : ''; p.setAttribute('aria-hidden', 'true'); });
      if (named) bell.setAttribute('aria-label', n ? named + ', ' + n + ' unread' : named);
      var all = $('[data-notices="read-all"]', root), empty = $('[data-notices="empty"]', root);
      /* With nothing to mark, "Mark all as read" is aria-disabled, not disabled: it keeps focus when it is the one pressed,
         and it stays the first stop in the panel, where the Popover puts focus as it opens. */
      if (all) { all.disabled = false; all.setAttribute('aria-disabled', String(!n)); }
      if (empty) empty.hidden = !(only && !n);
      var items = $$('.tray-notice', root), keep = function (item) { return !only || item.hasAttribute('data-unread'); };
      items.forEach(function (item, k) {
        var row = item.closest('li') || item;
        /* a notification read in the Unread view goes from it: focus on it moves to the next one left, or to what is shown instead */
        if (!keep(item)) rescue(row, function () { var to = items.slice(k + 1).filter(keep)[0] || items.slice(0, k).filter(keep).pop(); return to || (empty && !empty.hidden ? empty : all); });
        row.hidden = !keep(item);
      });
      return n;
    }
    root.addEventListener('click', function (e) {
      var all = e.target.closest('[data-notices="read-all"]'), item = e.target.closest('.tray-notice');
      if (all && all.getAttribute('aria-disabled') === 'true') return;
      if (all) $$('.tray-notice[data-unread]', root).forEach(read);
      else if (item && item.hasAttribute('data-unread')) read(item);
      else return;
      fire(root, 'change', { unread: paint() });
    });
    root.addEventListener('change', function (e) { if (e.target.name === 'notices-view') paint(); });
    paint();
  });

  /* filterbar: a checked menu item with data-value becomes a chip; removing the chip unchecks it; "clear" removes them all. */
  UI.register('filterbar', function (root) {
    var chips = $('.tray-filterbar__chips', root);
    if (!chips) return;
    function all() { return $$('.tray-chip', chips); }
    function option(v) { return $$('[role="menuitemcheckbox"][data-value]', root).filter(function (o) { return o.getAttribute('data-value') === v; })[0]; }
    function find(v) { return all().filter(function (c) { return c.getAttribute('data-value') === v; })[0]; }
    function tell() { fire(root, 'change', { filters: all().map(function (c) { return c.getAttribute('data-value'); }) }); }
    /* The button of the menu a filter came from, or else the first control of the bar: where focus goes once no chip is left. */
    function home(v) { var o = v && option(v), a = o && o.closest('.tray-anchor'); return (a && $(':scope > button', a)) || $('input, button', root); }
    function drop(chip) {
      var v = chip.getAttribute('data-value'), o = option(v);
      /* focus on the chip goes to the next chip, or the one before, or back to the menu it came from */
      rescue(chip, function () { var rest = all().filter(function (c) { return c !== chip; }), k = all().indexOf(chip), to = rest[k] || rest[k - 1]; return to ? $('.tray-chip__x', to) : home(v); });
      if (o) o.setAttribute('aria-checked', 'false');
      chip.remove();
    }
    root.addEventListener('click', function (e) {
      var x = e.target.closest('.tray-chip__x'), clear = e.target.closest('[data-filter="clear"]'), opt = e.target.closest('[role="menuitemcheckbox"][data-value]');
      if (x && chips.contains(x)) { drop(x.closest('.tray-chip')); tell(); }
      /* "Clear all" goes with the last chip: focus on it moves back to the menu of the first filter */
      else if (clear) { var first = all()[0]; rescue(clear, function () { return home(first && first.getAttribute('data-value')); }); all().forEach(drop); tell(); }
      else if (opt) setTimeout(function () {
        var v = opt.getAttribute('data-value'), on = opt.getAttribute('aria-checked') === 'true', have = find(v);
        if (on && !have) chips.insertBefore(chipOf(v, opt.getAttribute('data-label') || v), $('[data-filter="clear"]', chips));
        if (!on && have) have.remove();
        tell();
      }, 0);
    });
  });

  /* ---------- Start: once the document is parsed, add the icon sprite and wire up what is there ---------- */
  function start() { sprite(); UI.init(document); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
