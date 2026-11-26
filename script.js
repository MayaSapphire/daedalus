roomIdToName = {
  "brd": "Bridge",
  "fbt": "Front Bravo Turret",
  "fat": "Front Alpha Turret",
  "fc": "Front Corridor",
  "lab": "Laboratory",
  "hg": "Hydroponic Garden",
  "ml": "Medlab",
  "fs": "Front Storage",
  "cbt": "Central Bravo Turret",
  "cat": "Central Alpha Turret",
  "bb": "Bravo Bay",
  "cc": "Central Corridor",
  "ab": "Alpha Bay",
  "rf": "Refectory",
  "cbs": "Central Bravo Storage",
  "cas": "Central Alpha Storage",
  "bd": "Bravo Dorm",
  "nx": "Nexus",
  "ad": "Alpha Dorm",
  "rc": "Rear Corridor",
  "ab2": "Alpha Bay 2",
  "ib": "Icarus Bay",
  "rbs": "Rear Bravo Storage",
  "ras": "Rear Alpha Storage",
  "rbt": "Rear Bravo Turret",
  "er": "Engine Room",
  "rat": "Rear Alpha Turret"
}

function onRoomClick(objectId) {
  document.getElementById('selectedRoomInfo').hidden = false; 
  document.getElementById('selectedRoom').textContent = roomIdToName[objectId] || objectId;
}