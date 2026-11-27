let selected = null;
let selectedType = null;


class CrewMember {
  constructor(name, nameFull, picture, commanderPriority, commsPriority, neronPriority, gloryPath, availableSkills, traits) {
    this.name = name;
    this.nameFull = nameFull;
    this.picture = picture;
    this.commanderPriority = commanderPriority;
    this.commsPriority = commsPriority;
    this.neronPriority = neronPriority;
    this.gloryPath = gloryPath;
    this.availableSkills = availableSkills;
    this.skills = [];
    this.traits = traits;

    this.isAlive = true
    this.lastLocation = null;
    this.isGuarding = false;
    this.health = 16;
    this.healthMax = 16;
    this.morale = 8;
    this.moraleMax = 16
    this.location = rooms.get("lab");
    this.location.crewMembers.push(this);
    this.portraitPosition = null;
    this.ap = 8;
    this.apMax = 12;
    this.mp = 12;
    this.mpMax = 12;
  }

  move(targetRoom) {
    // Moves the crew member to an adjacent room.

    // Check that the door isn't broken.
    
    // Move.
    this.lastLocation = this.location;
    const currentRoom = this.location;
    const crewIndex = currentRoom.crewMembers.indexOf(this);
    if (crewIndex !== -1) currentRoom.crewMembers.splice(crewIndex, 1);
    this.location = targetRoom;
    this.portraitPosition = null;
    targetRoom.crewMembers.push(this);
    updateDisplay();
  }
}

class Room {
  constructor(name, id, doors, objects, items) {
    this.name = name;
    this.id = id;
    this.doors = doors;
    this.objects = objects;
    this.items = items;

    this.isOnFire = false;
    this.isBreached = false;
    this.hasGuarding = false;
    this.crewMembers = [];
    this.npcs = [];
  }
}

class Door {
  constructor(room1, room2) {
    this.room1 = room1;
    this.room2 = room2;

    this.isBroken = false;
  }
}


function initializeGame() {
  selected = null;

}

function addCrewMember(name) {
  if (name === "Roland") {
    daedalus.crew.push(new CrewMember(
      "Roland", 
      "Roland Zuccali",
      "assets/roland.png",
      1, 1, 1,
      "hunters",
      [],
      []
    ));
  }
  updateDisplay();
}

function selectItem(object, objectType) {
  if (object === null) {
    document.getElementById('selectedInfo').hidden = true;
    document.getElementById('selected').textContent = '';
    selected = null;
    selectedType = null;
    updateSelectedActions();
    return;
  }
  document.getElementById('selectedInfo').hidden = false; 
  
  if (objectType === "room") {
    document.getElementById('selected').textContent = object.name;
    selectedType = "room";
  } else if (objectType === "crew") {
    document.getElementById('selected').textContent = object.nameFull;
    selectedType = "crew";
  }

  selected = object;
  updateSelectedActions();
}

function updateSelectedActions() {
  const selectedActionsDiv = document.getElementById('selectedActions');
  if (!selectedActionsDiv) return;
  selectedActionsDiv.replaceChildren();


  if (selectedType === "room") {
    if (!selected || !Array.isArray(selected.crewMembers)) return;
    // show crew and select buttons for them
    if (selected.crewMembers.length > 0) {
      const presentCrew = document.createElement('ul');
      presentCrew.textContent = "Crew here:" // technically not correct
      selectedActionsDiv.appendChild(presentCrew);
      for (const crewMember of selected.crewMembers) {
        const crewLabel = document.createElement('li');
        crewLabel.textContent = `${crewMember.name}`;
        presentCrew.appendChild(crewLabel);
        // create the select button
        const selectCrewBtn = document.createElement('button');
        selectCrewBtn.textContent = "Select";
        selectCrewBtn.onclick = () => onSelectCrew(crewMember);
        crewLabel.appendChild(selectCrewBtn);
      }
    }
    return;
  }

  if (selectedType === "crew") {
    const crewMember = selected;
    for (const destination of crewMember.location.doors) {
      const moveButton = document.createElement('button');
      moveButton.className = 'action-button';
      moveButton.textContent = `Move: ${destination.name}`;
      moveButton.onclick = () => crewMember.move(destination);
      selectedActionsDiv.appendChild(moveButton);
    }
  }
}

function onSelectCrew(crew) {
  selectItem(crew, "crew");
  updateDisplay();
}

function onRoomClick(roomId) {
  const room = rooms.get(roomId);
  selectItem(room, "room");
  updateDisplay();
}

function onMapBackgroundClick(event) {
  if (event.target !== event.currentTarget) return;

  selectItem(null);
}

function findPortraitPosition(roomElement, svg, maxSize, padding) {
  const bounds = roomElement.getBBox();
  const point = svg.createSVGPoint();

  for (let size = maxSize; size >= 8; size -= 2) {
    const availableWidth = bounds.width - size - padding * 2;
    const availableHeight = bounds.height - size - padding * 2;
    if (availableWidth < 0 || availableHeight < 0) continue;

    for (let attempt = 0; attempt < 1000; attempt += 1) {
      const x = bounds.x + padding + Math.random() * availableWidth;
      const y = bounds.y + padding + Math.random() * availableHeight;
      let fitsInsideRoom = true;

      for (let row = 0; row <= 4 && fitsInsideRoom; row += 1) {
        for (let column = 0; column <= 4; column += 1) {
          point.x = x + size * column / 4;
          point.y = y + size * row / 4;
          if (!roomElement.isPointInFill(point)) {
            fitsInsideRoom = false;
            break;
          }
        }
      }

      if (fitsInsideRoom) return { roomId: roomElement.id, x, y, size };
    }
  }

  return null;
}

function updateDisplay() {
  updateSelectedActions();

  const svg = document.querySelector('#map svg');
  if (!svg) return;

  svg.querySelectorAll('.crew-portrait').forEach(portrait => portrait.remove());

  for (const crewMember of daedalus.crew) {
    if (!crewMember.isAlive) continue;

    const roomId = crewMember.location.id;
    if (!roomId) continue;

    const roomElement = svg.getElementById(`${roomId}Room`);
    if (!roomElement) continue;

    const bounds = roomElement.getBBox();
    const padding = 2;
    const maxSize = Math.min(24, bounds.width / 3, Math.max(12, bounds.height - padding * 2));
    if (!crewMember.portraitPosition || crewMember.portraitPosition.roomId !== roomId) {
      crewMember.portraitPosition = findPortraitPosition(roomElement, svg, maxSize, padding);
    }
    if (!crewMember.portraitPosition) continue;

    const portrait = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    portrait.setAttribute('href', crewMember.picture);
    portrait.setAttribute('x', crewMember.portraitPosition.x);
    portrait.setAttribute('y', crewMember.portraitPosition.y);
    portrait.setAttribute('width', crewMember.portraitPosition.size);
    portrait.setAttribute('height', crewMember.portraitPosition.size);
    portrait.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    portrait.setAttribute('class', 'crew-portrait');
    portrait.setAttribute('pointer-events', 'none');

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = crewMember.nameFull;
    portrait.appendChild(title);
    svg.appendChild(portrait);
  }
}

function spawnRoland() {
  // Debug function. Spawns a new Roland.
  addCrewMember('Roland');
}


daedalus = {
  hull: 100,
  oxygen: 24,
  fuel: 24,
  shields: null,
  alerts: null,
  crew: [],
};

const roomDefinitions = [
  { id: "brd", name: "Bridge", doors: ["fat", "fbt", "fc"] },
  { id: "fbt", name: "Front Bravo Turret", doors: ["brd", "fc"] },
  { id: "fat", name: "Front Alpha Turret", doors: ["brd", "fc"] },
  { id: "fc", name: "Front Corridor", doors: ["brd", "fbt", "fat", "lab", "hg", "ml", "fs", "cc"] },
  { id: "lab", name: "Laboratory", doors: ["fc", "ml"] },
  { id: "hg", name: "Hydroponic Garden", doors: ["fc", "fs"] },
  { id: "ml", name: "Medlab", doors: ["fc", "lab"] },
  { id: "fs", name: "Front Storage", doors: ["fc", "hg", "cat"] },
  { id: "cbt", name: "Central Bravo Turret", doors: ["bb"] },
  { id: "cat", name: "Central Alpha Turret", doors: ["fs", "ab"] },
  { id: "bb", name: "Bravo Bay", doors: ["cbt", "cc", "cbs", "bd", "rc"] },
  { id: "cc", name: "Central Corridor", doors: ["fc", "bb", "ab", "rf"] },
  { id: "ab", name: "Alpha Bay", doors: ["cc", "cat", "cas", "ad", "ab2"] },
  { id: "rf", name: "Refectory", doors: ["cc"] },
  { id: "cbs", name: "Central Bravo Storage", doors: ["bb"] },
  { id: "cas", name: "Central Alpha Storage", doors: ["ab"] },
  { id: "bd", name: "Bravo Dorm", doors: ["bb", "rc"] },
  { id: "nx", name: "Nexus", doors: ["rc"] },
  { id: "ad", name: "Alpha Dorm", doors: ["ab", "rc"] },
  { id: "rc", name: "Rear Corridor", doors: ["bb", "bd", "nx", "ad", "ab2", "ib", "rbs", "ras"] },
  { id: "ab2", name: "Alpha Bay 2", doors: ["ab", "rc", "ras", "rat"] },
  { id: "ib", name: "Icarus Bay", doors: ["rc", "rbt", "er"] },
  { id: "rbs", name: "Rear Bravo Storage", doors: ["rc", "er"] },
  { id: "ras", name: "Rear Alpha Storage", doors: ["rc", "ab2", "er"] },
  { id: "rbt", name: "Rear Bravo Turret", doors: ["ib", "er"] },
  { id: "er", name: "Engine Room", doors: ["ib", "rbs", "ras", "rbt", "rat"] },
  { id: "rat", name: "Rear Alpha Turret", doors: ["ab2", "er"] }
];

const rooms = new Map(roomDefinitions.map(({ id, name, doors }) => [
  id,
  new Room(name, id, doors, [], [])
]));

for (const room of rooms.values()) {
  room.doors = room.doors.map(roomId => rooms.get(roomId));
}
