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
    return art;
}

Tile.prototype.getMemoryArt = function() {
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
        this.door=this.secretDoor.door;
        this.char=this.secretDoor.char;
        this.color=this.secretDoor.color;
        this.bgColor=this.secretDoor.bgColor;
        this.passable=true;
        this.seeThrough=true;
        this.open=true;
        this.secretDoor=null;
    }
}