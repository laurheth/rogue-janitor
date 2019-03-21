function Tile(x,y,char,color,bgColor,seeThrough,passable,door=null) {
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
    this.open=false;
}

Tile.prototype.getArt = function() {
    if (this.entity != null) {
        return this.entity.getArt();
    }
    else if (this.mess != null) {
        return this.mess.getArt();
    }
    else if (this.door != null && this.open) {
        return [this.door,this.bgColor,'#000'];
    }
    else {
        return [this.char,this.color,this.bgColor];
    }
}

Tile.prototype.lightPasses = function() {
    if (this.door != null) {
        return this.open;
    }
    else {
        return this.lightPasses;
    }
}

Tile.prototype.passThrough = function() {
    if (this.entity != null) {
        return false;
    }
    else {
        return this.passable;
    }
}