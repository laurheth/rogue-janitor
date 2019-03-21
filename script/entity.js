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
    this.drinking=Math.floor(300*ROT.RNG.getUniform())+100;
    if ('monster' in tags) {
        Game.scheduler.add(this,true);
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

Entity.prototype.act = function() {
    if (!this.alive) {
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
        let dx = Math.sign(Game.adventurer.x - this.x);
        let dy = Math.sign(Game.adventurer.y - this.y);
        this.moveTo(this.x+dx,this.y+dy);
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
    var options=['Gold'];
    return GetEntity(ROT.RNG.getItem(options),x,y);
}

function AddMonster(x,y,level) {
    var options=['Goblin'];
    if (level==2) {
        options=['Ogre'];
    }
    else if (level==3) {
        options=['Troll'];
    }
    else if (level>=4) {
        options=['Balor']
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
        case 'Ogre':
        newEntity = new Entity(x,y,'O','#fa0',name,4,{monster:true},2);
        break;
        case 'Troll':
        newEntity = new Entity(x,y,'T','#0c0',name,6,{monster:true},3);
        break;
        case 'Balor':
        newEntity = new Entity(x,y,'&','#f00',name,9,{monster:true},4);
        break;
        case 'Gold':
        newEntity = new Entity(x,y,'$','#ff0',name,1,{loot:true});
        break;
    }
    return newEntity;
}