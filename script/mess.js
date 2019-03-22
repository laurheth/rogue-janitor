function Mess(x,y,char,color,bgColor,name,importance,spreads=null,spreadCount=0,altname="",cleanMethod="mop") {
    this.x=x;
    this.y=y;
    this.char=char;
    this.color=color;
    this.bgColor=bgColor;
    this.name=name;
    this.spreads=spreads;
    this.spreadCount=spreadCount;
    this.importance=importance;
    this.cleanMethod=cleanMethod;
    this.parent=null;
    let key=x+','+y;
    let increment=true;
    if (Game.map[key].mess != null) {
        increment=false;
    }
    if (key in Game.map && Game.map[key].passable && !Game.map[key].important && (Game.map[key].mess == null || (this.importance >= Game.map[key].mess.importance))) {
        Game.map[key].mess=this;
        if (increment) {
            Game.messNumbers[0]++;
            Game.messNumbers[1]++;
        }
    }
    else if (spreads != null && key in Game.map && (!Game.map[key].passable || Game.map[key].important)) {
        Game.map[key].mess=this;
        this.char = Game.map[key].char;
        let newbgColor = ROT.Color.fromString(this.color);
        newbgColor=ROT.Color.multiply(newbgColor,[100,100,100]);
        this.bgColor = ROT.Color.toHex(newbgColor);
        if (increment) {
            Game.messNumbers[0]++;
            Game.messNumbers[1]++;
        }
    }
}

Mess.prototype.getArt = function() {
    return [this.char, this.color, this.bgColor];
}

Mess.prototype.spread = function(spreader) {
    if (spreader.spreadCount < this.spreadCount || spreader.spreading == this.spreads) {
        spreader.spreading=this.spreads;
        spreader.spreadCount=this.spreadCount;//Math.max(this.spreadCount,spreader.spreadCount+2);
    }
}

function makeMess(x,y,name) {
    var newMess;
    switch(name) {
        default:
        case 'Wrapper':
        newMess = new Mess(x,y,'w','#ccc','#000','Discarded Candy Wrapper',10,null,0,"","get");
        break;
        case 'AppleCore':
        newMess = new Mess(x,y,'%','#0f0','#000','Apple Core',10,null,0,"","get");
        break;
        case 'EmptyBottle':
        newMess = new Mess(x,y,'!','#080','#000',"Empty Bottle",10,null,0,"","get");
        break;
        case 'EmptyMug':
        newMess = new Mess(x,y,'u','#999','#000',"Empty Coffee Mug",10,null,0,"","get");
        break;
        case 'EmptyPotion':
        newMess = new Mess(x,y,'!','#0ff','#000',"Empty Potion",11,null,0,"","get");
        break;
        case 'BloodPool':
        newMess = new Mess(x,y,"~",'#f00','#000','"Blood"',6,"BloodPrints",6,'"Blood" Covered');
        break;
        case 'BloodPrints':
        newMess = new Mess(x,y,",",'#f00','#000','"Blood" Footprints',3,"",0,'"Blood" Covered');
        break;
        case 'AcidPool':
        newMess = new Mess(x,y,"~",'#0f0','#000','Acid',6,"AcidPrints",6,'Acid Covered');
        break;
        case 'AcidPrints':
        newMess = new Mess(x,y,",",'#0f0','#000','Acid Footprints',3,"",0,'Acid Covered');
        break;
        case 'MudPrints':
        newMess = new Mess(x,y,",",'#960','#000','Muddy Footprints',3,"",0,'Mud Covered');
        break;
        case 'BrokenTable':
        newMess = new Mess(x,y,'/','#fa0','#000',"Smashed Table",12,"Splinters",2,"","fix");
        break;
        case 'BrokenChest':
        newMess = new Mess(x,y,'/','#fa0','#000',"Smashed Treasure Chest",12,"Splinters",2,"","fix");
        break;
        case 'Splinters':
        newMess = new Mess(x,y,',','#fa0','#000',"Broken Wood",4,null,0,"");
        break;
        case 'TippedCauldron':
        newMess = new Mess(x,y,'C','#ccc','#000',"Tipped Over Cauldron",12,"Water",2,"","fix");
        break;
        case 'Water':
        newMess = new Mess(x,y,'~','#00f','#000',"Water",6,"WetPrints",6,"Soggy");
        break;
        case 'WetPrints':
        newMess = new Mess(x,y,',','#00f','#000',"Wet Footprints",3,"",0,"Soggy");
        break;
        case 'Scorch':
        newMess = new Mess(x,y,'*','#999','#000',"Scorch Marks",7,"",0,"Scorched");
        break;
        case 'SmashedStatue':
        newMess = new Mess(x,y,';','#ccc',"#000","Smashed Statue",12,null,0,"","fix");
        break;
        case 'SmashedCandle':
        newMess = new Mess(x,y,'/','#ff0',"#000","Smashed Candleabrum",12,null,0,"","fix");
        break;

    }

    return newMess;
}