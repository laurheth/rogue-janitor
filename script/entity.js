function Entity(x,y,char,color,species,hp=1,tags={},level=1) {
    this.x=x;
    this.y=y;
    this.char=char;
    this.color=color;
    this.hp=hp;
    this.level=level;
    this.tags=tags;
    this.active=false;
    this.alive=true;
    this.spreading=null;
    this.spreadCount=0;
    this.name=RandomName()+" the "+species;
    this.drinking=Math.floor(300*ROT.RNG.getUniform())+100;
    this.home=null;
    this.retired=false;
    if ('monster' in tags) {
        Game.scheduler.add(this,true);
        Game.monsterList.push(this);
    }
    let dx=0;
    let dy=0;
    while (!this.moveTo(x+dx,y+dy)) {
        let r=0;
        r++;
        for (let i=-r;i<=r;i++) {
            for (let j=-r;j<=r;j++) {
                let testKey=(i+x)+','+(j+y);
                if (testKey in Game.map && Game.map[testKey].passThrough()) {
                    dx=i;
                    dy=j;
                }
            }
        }
    }
};

Entity.prototype.adventurerAct = function() {
    if ('loot' in this.tags) {
        let key = this.x+','+this.y;
        if (key in Game.map && Game.map[key].entity==this) {
            Game.map[key].entity=null;
        }
        if ('mess' in this.tags) {
            let newmess=makeMess(this.x,this.y,this.tags.mess);
            newmess.parent=this;
        }
        if ('splashes' in this.tags) {
            let dx;
            let dy;
            do {
                dx = Math.floor(3*ROT.RNG.getUniform())-1;
                dy = Math.floor(3*ROT.RNG.getUniform())-1;
            } while (dx==0 && dy==0);
            makeMess(this.x+dx,this.y+dy,this.tags.splashes);
        }
    }
    else if ('monster' in this.tags) {
        this.hp -= Game.adventurer.dmg;
        let dx = Math.floor(3*ROT.RNG.getUniform())-1;
        let dy = Math.floor(3*ROT.RNG.getUniform())-1;
        let newMess1=makeMess(this.x,this.y,"BloodPool");
        let newMess2=makeMess(this.x+dx,this.y+dy,"BloodPool");
        if (this.hp <= 0) {
            this.alive=false;
            let key = this.x+','+this.y;
            if (key in Game.map && Game.map[key].entity==this) {
                Game.map[key].entity=null;
            }
        }
        else {
            Game.adventurer.damage();
        }
    }
};

// talk to
Entity.prototype.cleanerAct = function() {
    if ('monster' in this.tags) {
        Game.drawMap();
        Game.display.drawText(2,2*Game.offset[1]-3,this.name+' : "Wow that was a good day in the dungeon :^)"');
    }
}

Entity.prototype.retiredAct = function() {
    if (this.home == null) {
        this.home = [this.x,this.y];
    }
    if (ROT.RNG.getUniform()>0.95) {
        if (this.x != this.home[0] || this.y != this.home[1]) {
            this.moveTo(this.home[0],this.home[1]);
        }
        else {
            let dx = Math.floor(3*ROT.RNG.getUniform())-1;
            let dy = Math.floor(3*ROT.RNG.getUniform())-1;
            this.moveTo(this.x+dx,this.y+dy);
        }
    }
};

Entity.prototype.act = function() {
    if (!this.alive) {
        return;
    }
    else if (this.retired) {
        this.retiredAct();
        return;
    }
    this.drinking--;
    if (this.drinking==0) {
        this.drinking=Math.floor(300*ROT.RNG.getUniform())+100;
        let options=["EmptyBottle","EmptyMug","AppleCore"];
        let newmess=makeMess(this.x,this.y,ROT.RNG.getItem(options));
    }
    if (this.spreadCount>0 && this.spreading != null) {
        let newMess = makeMess(this.x,this.y,this.spreading);
        this.spreadCount--;
    }
    if (!this.active) {
        let dx = Math.floor(3*ROT.RNG.getUniform())-1;
        let dy = Math.floor(3*ROT.RNG.getUniform())-1;
        this.moveTo(this.x+dx,this.y+dy);
    }
    else {
        if ('ranged' in this.tags && ROT.RNG.getUniform()>0.4) {
            for (let i=0;i<this.tags.ranged;i++) {
                let dx=0;
                let dy=0;
                if (ROT.RNG.getUniform()>0.5) {
                    dx = Math.floor(3*ROT.RNG.getUniform())-1;
                    dy = Math.floor(3*ROT.RNG.getUniform())-1;
                }
                else {
                    Game.adventurer.hp--;
                }
                makeMess(Game.adventurer.x+dx,Game.adventurer.y+dy,this.tags.rangeMess);
            }
        }
        else {
            let dx = Math.sign(Game.adventurer.x - this.x);
            let dy = Math.sign(Game.adventurer.y - this.y);
            this.moveTo(this.x + dx, this.y + dy);
        }
    }
}

Entity.prototype.getArt = function() {
    if (this.alive) {
        return [this.char,this.color,'#000'];
    }
    else {
        return ['%','#f00','#000'];
    }
}

Entity.prototype.moveTo=function(x,y) {
    let oldKey = this.x+','+this.y;
    let newKey = x+','+y;
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
    /*console.log(Game.getRoomIndex(x,y));
    if (Game.getRoomIndex(x,y)>=0) {
        console.log('Exits:'+Game.rooms[Game.getRoomIndex(x,y)][4]);
    }*/
    if (oldKey != newKey && oldKey in Game.map && Game.map[oldKey].entity==this) {
        Game.map[oldKey].entity=null;
    }
    return true;
};

function AddCollectible(x,y) {
    var options=['Chest','Cauldron','Candleabra','Statue'];
    return GetEntity(ROT.RNG.getItem(options),x,y);
}

function AddMonster(x,y,level) {
    var options=['Goblin','Kobold'];
    if (level==2) {
        options=['Ogre','Imp'];
    }
    else if (level==3) {
        options=['Troll','Naga'];
    }
    else if (level>=4) {
        options=['Balor','Hydra','Dragon'];
    }
    return GetEntity(ROT.RNG.getItem(options),x,y);
}

function GetEntity(name,x,y) {
    var newEntity;
    switch (name) {
        default:
        case 'Goblin':
        newEntity = new Entity(x,y,'g','#0f0',name,2,{monster:true},1);
        break;
        case 'Kobold':
        newEntity = new Entity(x,y,'k','#fa0',name,2,{monster:true},1);
        break;
        case 'Ogre':
        newEntity = new Entity(x,y,'O','#fa0',name,4,{monster:true},2);
        break;
        case 'Imp':
        newEntity = new Entity(x,y,"i",'#fd1',name,3,{monster:true,ranged:1,rangeMess:'Scorch'});
        break;
        case 'Troll':
        newEntity = new Entity(x,y,'T','#0c0',name,6,{monster:true},3);
        break;
        case 'Naga':
        newEntity = new Entity(x,y,'N','#0c2',name,5,{monster:true,ranged:1,rangeMess:'AcidPool'},3);
        break;
        case 'Balor':
        newEntity = new Entity(x,y,'&','#f00',name,8,{monster:true,ranged:1,rangeMess:'Scorch'},4);
        break;
        case 'Hydra':
        newEntity = new Entity(x,y,'H','#fa0',name,9,{monster:true},4);
        break;
        case 'Dragon':
        newEntity = new Entity(x,y,'D','#0f0',name,7,{monster:true,ranged:2,rangeMess:'Scorch'},4)
        break;
        case 'Gold':
        newEntity = new Entity(x,y,'$','#ff0',name,1,{loot:true});
        break;
        case 'Chest':
        newEntity = new Entity(x,y,'\u03C0','#fa0','Treasure Chest',1,{loot:true,mess:'BrokenChest'});
        break;
        case 'Table':
        newEntity = new Entity(x,y,'\u2564','#fa0',"Table",1,{loot:true,mess:'BrokenTable'});
        break;
        case 'Cauldron':
        newEntity = new Entity(x,y,'U','#ccc','Cauldron',1,{loot:true,mess:'TippedCauldron',splashes:'Water'});
        break;
        case 'Statue':
        newEntity = new Entity(x,y,'\u03A9','#ccc','Statue',1,{loot:true,mess:'SmashedStatue'});
        break;
        case 'Candleabra':
        newEntity = new Entity(x,y,'\u03A8','#ff0','Candleabrum',1,{loot:true,mess:'SmashedCandle',splashes:'Scorch'});
        break;
    }
    return newEntity;
}

function RandomName() {
    var sg=new ROT.StringGenerator({order:2});
    var nameList=[
        'Ralph',
        'Franklin',
        'Susan',
        'Jim',
        'Todd',
        'Billy',
        'Jack',
        'Helen',
        'Timmy',
        'Greg',
        'Meghan',
        'Scritches',
        'Rose',
        'Betty',
        'Constance',
        'Sam',
    ];
    for (let i=0;i<nameList.length;i++) {
        sg.observe(nameList[i].toLowerCase());
    }
    let name;
    do {
        name=sg.generate();
        name = name.charAt(0).toUpperCase()+name.slice(1)
    } while (name.length < 3 || name.length > 10 || Game.nameRegistry.indexOf(name)>=0);
    Game.nameRegistry.push(name);
    return name;
}