const { EventEmitter } = require("events");
const bus = new EventEmitter();

// Evénements possibles :
//  - status: { ping, uptimeSec, guildCount, rssMB }
//  - audit:  { ts, userId, action, guildId, meta }
//  - guild:  { ts, type: 'join'|'leave'|'memberAdd'|'memberRemove', guildId, userId?, name? }

module.exports = bus;
