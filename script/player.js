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
    this.spreading=null;
    this.spreadCount=0;
    this.talking=null;
    this.reach=1;
    this.cutscene=null;
}

Player.prototype.getArt = function() {
    return [this.char,this.color,this.bgcolor];
}

Player.prototype.act = function() {
    Game.engine.lock();
    console.log(this.x+','+this.y);
    if (this.spreadCount>0 && this.spreading != null) {
        let newMess = makeMess(this.x,this.y,this.spreading);
        this.spreadCount--;
        if (this.spreadCount==0 && newMess.spreads!=null && newMess.spreads!="") {
            newMess.spread(this);
        }
    }
    if (this.cutscene != null) {
        Game.player.talking=Game.monsterList[0];
        Game.monsterList[0].convoIndex=Game.monsterList[0].convos.length;
        Game.monsterList[0].convoInnerDex=0;
        //Game.monsterList[0].convos=[];
        Game.monsterList[0].convos.push(this.cutscene);
        this.cutscene=null;
        window.addEventListener("keydown",Game.monsterList[0]);
        window.addEventListener("keypress",Game.monsterList[0]);
    }
    
    Game.drawMap();
    window.addEventListener("keydown", this);
}

Player.prototype.endTurn = function() {
    Game.drawMap();
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
}

Player.prototype.openClose=function(openclose) {
    for (let i=-1;i<2;i++) {
        for (let j=-1;j<2;j++) {
            if (i==0 && j==0) {
                continue;
            }
            let key = (this.x+i)+','+(this.y+j);
            if (key in Game.map && Game.map[key].mess == null && Game.map[key].door != null) {
                if (Game.map[key].open != openclose) {
                    Game.map[key].open=openclose;
                    if (openclose) {
                        Game.sendMessage("You open the door.")
                    }
                    else {
                        Game.sendMessage("You close the door.")
                    }
                }
            }
        }
    }
}

Player.prototype.clean = function(verb) {
    for (let i=-this.reach;i<=this.reach;i++) {
        for (let j=-this.reach;j<=this.reach;j++) {
            if (i==0 && j==0) {
                continue;
            }
            let key = (this.x+i)+','+(this.y+j);
            if (key in Game.map && Game.map[key].mess != null && Game.map[key].mess.cleanMethod == verb) {
                if (verb=='fix' && Game.map[key].entity==null) {
                    Game.map[key].entity = Game.map[key].mess.parent;
                    Game.sendMessage("You fix the "+Game.map[key].entity.name.toLowerCase()+".");
                }
                else {
                    if (verb=='get') {
                        verb="pick up";
                    }
                    if (Game.map[key].mess.unique) {
                        Game.sendMessage("You "+verb+Game.map[key].mess.name+"!");
                    }
                    else {
                        Game.sendMessage("You "+verb+" the "+Game.map[key].mess.name.toLowerCase()+".");
                    }
                }
                if (Game.map[key].mess.droppedBy != null) {
                    ConversationBuilder.cleanConvo(Game.map[key].mess);
                }
                Game.map[key].mess.pickedUp=true;
                Game.map[key].mess=null;
                Game.messNumbers[0]--;
                return;
            }
        }
    }
}

Player.prototype.handleEvent = function(e) {
    let code = e.keyCode;
    if (this.talking != null) {
        // cancel conversation
        /*if (code == 27 || code == 8 || code == 88) {
            this.talking.cancelConvo();
//            this.talking.convoIndex=-1;
            this.talking=null;
            Game.drawMap();
        }*/
        return;
    }
    //console.log(this.keyMap);
    if (!(code in this.keyMap)) {
        switch (code) {
            default:
            return;
            // m for mop
            case 77:
            this.clean('mop');
            this.endTurn();
            return;
            // c for close
            case 67:
            this.openClose(false);
            this.endTurn();
            return;
            // o for open
            case 79:
            this.openClose(true);
            this.endTurn();
            return;
            // g or p for get or pick up
            case 80:
            case 71:
            this.clean('get');
            this.endTurn();
            return;
            // r or f for repair or fix
            case 82:
            case 70:
            this.clean('fix');
            this.endTurn();
            return;
        }
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
    else {
        let testKey = Math.round(parseInt(parts[0]))+','+Math.round(parseInt(parts[1]));
        if (testKey in Game.map && Game.map[testKey].entity != null && Game.map[testKey].entity != this) {
            Game.map[testKey].entity.cleanerAct();
        }
    }
}

Player.prototype.moveTo = function(x,y) {
    let oldKey = this.x+','+this.y;
    let newKey = x+','+y;

    if (newKey in Game.map && Game.map[newKey].door != null && !Game.map[newKey].open) {
        Game.sendMessage("You open the door.");
        Game.map[newKey].open=true;
        return true;
    }

    if (newKey in Game.map && Game.map[newKey].passThrough()) {
        Game.map[newKey].entity=this;
        this.x=x;
        this.y=y;
        if (Game.map[newKey].mess != null) {
            Game.map[newKey].mess.spread(this);
        }
    }
    else {
        return false;
    }
    Game.lastMessage="";
    /*console.log(Game.getRoomIndex(x,y));
    if (Game.getRoomIndex(x,y)>=0) {
        console.log('Exits:'+Game.rooms[Game.getRoomIndex(x,y)][4]);
    }*/
    if (oldKey != newKey && oldKey in Game.map && Game.map[oldKey].entity==this) {
        Game.map[oldKey].entity=null;
    }
    return true;
}