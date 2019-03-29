function Tile(x,y,char,color,bgColor,seeThrough,passable,door=null,name="") {
    this.x=x;
    this.y=y;
    this.char=char;
    this.color=color;
    this.bgColor=bgColor;
    this.entity=null;
    this.mess=null;
    this.seeThrough=seeThrough;
    this.passable=passable;
    this.door=door;
    this.secretDoor=null;
    this.open=false;
    this.important=false;
    this.name=name;
    this.lastSeen=" ";
    this.visible=false;
}

Tile.prototype.getArt = function() {
    var art;
    if (this.entity != null) {
        art=this.entity.getArt();
    }
    else if (this.mess != null) {
        art=this.mess.getArt();
    }
    else if (this.door != null && this.open) {
        art=[this.door,this.bgColor,'#000'];
    }
    else {
        art=[this.char,this.color,this.bgColor];
    }
    this.lastSeen=art[0];
    this.visible=true;
    if (this.secretDoor != null) {
        let dist = Math.abs(this.x - Game.player.x)+Math.abs(this.y-Game.player.y);
        let probability=1.0/parseFloat(0.5*dist);//Math.pow(0.7,parseFloat(dist));
        if (ROT.RNG.getUniform()<probability) {
            Game.sendMessage(this.secretDoor.sound,false);
        }
    }
    return art;
}

Tile.prototype.getMemoryArt = function() {
    this.visible=false;
    return [this.lastSeen,'#555','#000'];
}

Tile.prototype.lightPasses = function() {
    if (this.door != null) {
        return this.open;
    }
    else {
        return this.seeThrough;
    }
}

Tile.prototype.passThrough = function() {
    if (this.entity != null) {
        return false;
    }
    else if (this.door != null) {
        return this.open;
    }
    else {
        return this.passable;
    }
}

Tile.prototype.openSecretDoor = function() {
    if (this.secretDoor != null) {
        Game.player.wait(500);
        this.door=this.secretDoor.door;
        this.char=this.secretDoor.char;
        this.color=this.secretDoor.color;
        this.bgColor=this.secretDoor.bgColor;
        this.passable=true;
        this.seeThrough=true;
        this.secretDoor=null;
    }
}