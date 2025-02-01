export interface StatusOnline {
    online: boolean;
    ip: string;
    port: number;
    hostname: string;
    debug: Debug;
    version: string;
    protocol: Protocol;
    icon: string;
    software: string;
    map: Map;
    gamemode: string;
    serverid: string;
    eula_blocked: boolean;
    motd: Motd;
    players: Players;
    plugins: Plugins[];
    mods: Mods[];
    info: Info;
}

interface Debug {
    ping: boolean;
    query: boolean;
    srv: boolean;
    querymismatch: boolean;
    ipinsrv: boolean;
    cnameinsrv: boolean;
    animatedmotd: boolean;
    cachehit: boolean;
    cachetime: number;
    cacheexpire: number;
    apiversion: number;
}

interface Protocol {
    version: number;
    name: string;
}

interface Map {
    raw: string;
    clean: string;
    html: string;
}

interface Motd {
    raw: string[];
    clean: string[];
    html: string[];
}

interface Players {
    online: number;
    max: number;
    list?: List[];
}

interface List {
    name: string;
    uuid: string;
}

interface Plugins {
    name: string;
    version: string;
}

interface Mods {
    name: string;
    version: string;
}

interface Info {
    raw: string[];
    clean: string[];
    html: string[];
}

export interface OfflineStatus {
    online: boolean;
    ip: string;
    port: number;
    hostname: string;
    debug: Debug;
}

export interface Status {  
    online: boolean;
}