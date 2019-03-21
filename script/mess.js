function Mess(x,y,char,color,bgColor,name,importance,spreads=null,spreadCount=0,altname="") {
    this.x=x;
    this.y=y;
    this.char=char;
    this.color=color;
    this.bgColor=bgColor;
    this.name=name;
    this.spreads=spreads;
    this.spreadCount=spreadCount;
    this.importance=importance;
    let key=x+','+y;
    if (key in Game.map && Game.map[key].passable && !Game.map[key].important && (Game.map[key].mess == null || (this.importance >= Game.map[key].mess.importance))) {
        Game.map[key].mess=this;
    }
    else if (spreads != null && key in Game.map && (!Game.map[key].passable || Game.map[key].important)) {
        Game.map[key].mess=this;
        this.char = Game.map[key].char;
        let newbgColor = ROT.Color.fromString(this.color);
        newbgColor=ROT.Color.multiply(newbgColor,[100,100,100]);
        this.bgColor = ROT.Color.toHex(newbgColor);
    }
}

Mess.prototype.getArt = function() {
    return [this.char, this.color, this.bgColor];
}

Mess.prototype.spread = function(spreader) {
    if (spreader.spreadCount <= 0 || spreader.spreading == this.spreads) {
        spreader.spreading=this.spreads;
        spreader.spreadCount=this.spreadCount;//Math.max(this.spreadCount,spreader.spreadCount+2);
    }
}

function makeMess(x,y,name) {
    var newMess;
    switch(name) {
        default:
        case 'Wrapper':
        newMess = new Mess(x,y,'w','#ccc','#000','Discarded Candy Wrapper',10,null,0);
        break;
        case 'AppleCore':
        newMess = new Mess(x,y,'%','#0f0','#000','Apple Core',10,null,0,"");
        break;
        case 'EmptyBottle':
        newMess = new Mess(x,y,'!','#080','#000',"Empty Bottle",10,null);
        break;
        case 'EmptyMug':
        newMess = new Mess(x,y,'u','#999','#000',"Empty Coffee Mug",10,null);
        break;
        case 'EmptyPotion':
        newMess = new Mess(x,y,'!','#0ff','#000',"Empty Potion",11,null);
        break;
        case 'BloodPool':
        newMess = new Mess(x,y,"~",'#f00','#000','"Blood"',6,"BloodPrints",6,'"Blood" Covered');
        break;
        case 'BloodPrints':
        newMess = new Mess(x,y,",",'#f00','#000','"Blood" Footprints',3,"",0,'"Blood" Covered');
        break;
        case 'AcidPool':
        newMess = new Mess(x,y,"~",'#0f0','#000','Acid',7,"AcidPrints",6,'Acid Covered');
        break;
        case 'AcidPrints':
        newMess = new Mess(x,y,",",'#0f0','#000','Acid Footprints',4,"",0,'Acid Covered');
        break;
        case 'MudPrints':
        newMess = new Mess(x,y,",",'#960','#000','Muddy Footprints',3,"",0,'Mud Covered');
        break;
        case 'BrokenChest':
        newMess = new Mess(x,y,'/','#fa0','#000',"Smashed Treasure Chest",12,"Splinters",2,"");
        break;
        case 'Splinters':
        newMess = new Mess(x,y,',','#fa0','#000',"Broken Wood",4,null,0,"");
        break;
        case 'TippedCauldron':
        newMess = new Mess(x,y,'C','#ccc','#000',"Tipped Over Cauldron",12,"Water",2,"");
        break;
        case 'Water':
        newMess = new Mess(x,y,'~','#00f','#000',"Water",5,"WetPrints",6,"Soggy");
        break;
        case 'WetPrints':
        newMess = new Mess(x,y,',','#00f','#000',"Wet Footprints",2,"",0,"Soggy");
        break;
        case 'Scorch':
        newMess = new Mess(x,y,'*','#999','#000',"Scorch Marks",7,"",0,"Scorched");
        break;
    }

    return newMess;
}