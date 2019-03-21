function Player(x,y) {
    this.x=x;
    this.y=y;
    this.char='@';
    this.color='#fff';
    this.bgColor='#000';
    this.keyMap = {};
    this.keyMap[38] = 0;
    this.keyMap[75] =0;
    this.keyMap[104] = 0;
    this.keyMap[85] = 1;
    this.keyMap[33] = 1; //85
    this.keyMap[105] = 1;
    this.keyMap[76] = 2;
    this.keyMap[39] = 2;//76
    this.keyMap[102] = 2;
    this.keyMap[78] = 3;
    this.keyMap[34] = 3;//78
    this.keyMap[99] = 3;
    this.keyMap[74] = 4;
    this.keyMap[40] = 4;//74
    this.keyMap[98] = 4;
    this.keyMap[66] = 5;
    this.keyMap[35] = 5;//66
    this.keyMap[97] = 5;
    this.keyMap[72] = 6;
    this.keyMap[37] = 6;//72
    this.keyMap[100] = 6;
    this.keyMap[89] = 7;
    this.keyMap[36] = 7;//89
    this.keyMap[103] = 7;

}

Player.prototype.getArt = function() {
    return [this.char,this.color,this.bgcolor];
}

Player.prototype.act = function() {
    Game.engine.lock();
    window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
    let code = e.keyCode;
    //console.log(this.keyMap);
    if (!(code in this.keyMap)) {
        return;
    }
    //console.log(code);

    // movement
    let diff = ROT.DIRS[8][this.keyMap[code]];
    let testKey = (this.x+diff[0])+','+(this.y+diff[1]);
    let parts = testKey.split(',');

    if (this.moveTo(Math.round(parseInt(parts[0])), Math.round(parseInt(parts[1])))) {
        //console.log(this.x+','+this.y);
        Game.drawMap();
        window.removeEventListener("keydown", this);
        Game.engine.unlock();
    }
}

Player.prototype.moveTo = function(x,y) {
    let oldKey = this.x+','+this.y;
    let newKey = x+','+y;

    if (newKey in Game.map && Game.map[newKey].door != null && !Game.map[newKey].open) {
        Game.map[newKey].open=true;
        return true;
    }

    if (newKey in Game.map && Game.map[newKey].passThrough()) {
        Game.map[newKey].entity=this;
        this.x=x;
        this.y=y;
    }
    else {
        return false;
    }
    /*console.log(Game.getRoomIndex(x,y));
    if (Game.getRoomIndex(x,y)>=0) {
        console.log('Exits:'+Game.rooms[Game.getRoomIndex(x,y)][4]);
    }*/
    if (oldKey != newKey && oldKey in Game.map && Game.map[oldKey].entity==this) {
        Game.map[oldKey].entity=null;
    }
    return true;
}