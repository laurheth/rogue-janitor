var Game = {
    display: null,
    map: {},
    freeCells:[],
    hallCells:[],
    rooms:[],
    roomCenters:[],
    player:null,
    scheduler:null,
    engine:null,
    offset: [],
    corners:[],
    dungeonTheme:{
        floorColor:'#ddd',
        corridorWalls:['#b82','#842'],
        roomWalls:['#ddd','#777'],
        doorColor:['#ddd','#842'],
    },
    staffRoomID:-1,
    animalRoomID:-1,
    partyRoomID:-1,
    stairs:[[0,0,-1],[0,0,-1]],
    nameRegistry:[],
    adventurer: null,
    fov:null,
    monsterList:[],
    petList:[],
    playerPet:null,
    messNumbers:[0,0],
    screen: null,
    lastMessage: "",
    lastlastMessage: "",
    lastlastMessageTime:-1,
    coffeeThreshold:Math.floor(40*ROT.RNG.getUniform())+20,
    inviteOutThreshold:Math.floor(15*ROT.RNG.getUniform())+80,
    convoTags:{},
    day: 1,
    unionist: null,
    targetPoints:1500,
    yendorPoints:0,
    victory:false,
    init: function() {
        this.screen = document.getElementById("gameContainer");
        this.display = new ROT.Display({fontSize:16});
        this.getSize(false);
        this.screen.appendChild(this.display.getContainer());
        this.scheduler = new ROT.Scheduler.Simple();
        this.player = new Player(-1,-1,-1);
        //this.scheduler.add(this.player);
        this.generateDungeon();
        //this.generateDiner();
        this.fov = new ROT.FOV.PreciseShadowcasting(function(x,y){
            return Game.lightPasses(x,y);
        });
        //this.drawMap();

        this.engine = new ROT.Engine(this.scheduler);
        this.engine.start();
    },

    getSize: function(redraw=true) {
        var setsize=this.display.computeSize(this.screen.clientWidth,this.screen.clientHeight);
        this.display.setOptions({width: setsize[0],height: setsize[1]});
        this.offset[0] = parseInt(setsize[0]/2);
        this.offset[1] = parseInt(setsize[1]/2);
        if (redraw) {
            Game.drawMap();
        }
    },

    drawMap: function() {
        this.display.clear();

        if (Game.player.instructions) {
            let instructions=[
                ["--- Rogue Janitor ---",0],
                ["A game about cleaning dungeons.",0],
                ["",0],
                ["--- Movement ---",0],
                ["Move with arrow keys, numpad, or with VI keys (hjkl, yubn)",0],
                ["Wait with %c{#ff0}.%c{} or %c{#ff0}5%c{}",24],
                ["",0],
                ["--- Cleaning ---",0],
                ["(%c{#ff0}M%c{})op messes.",12],
                ["(%c{#ff0}P%c{})ick up or (%c{#ff0}G%c{})et garbage or other items.",24],
                ["(%c{#ff0}F%c{})ix or (%c{#ff0}R%c{})epair broken furniture.",24],
                ["All cleaning methods affect tiles you are next to.",0],
                ["All cleaning methods can reveal hidden doors!",0],
                ["",0],
                ["--- Other ---",0],
                ["(%c{#ff0}O%c{})pen or (%c{#ff0}C%c{})lose doors.",24],
                ["(%c{#ff0}EX%c{})amine your surroundings.",12],
                ["Walk into monsters and other objects to interact with them.",0],
                ["Display this help prompt with %c{#ff0}?%c{}",12]
            ];
            let halfLength=Math.floor(instructions.length/2);
            for (let i=0;i<instructions.length;i++) {
                let halfwidth=Math.floor((instructions[i][0].length - instructions[i][1])/2);
                this.display.drawText(this.offset[0]-halfwidth,this.offset[1]-halfLength+i,instructions[i][0]);
            }
            return;
        }

        for (let i=-this.offset[0]+this.player.x;i<=this.offset[0]+this.player.x;i++) {
            for (let j=-this.offset[1]+this.player.y;j<=this.offset[1]+this.player.y;j++) {
                let key=i+','+j;
                //console.log(key);
                if (key in this.map) {
                    let art = this.map[key].getMemoryArt();
                    this.display.draw(i+this.offset[0]-this.player.x,j+this.offset[1]-this.player.y,art[0],art[1],art[2]);
                }
            }
        }
        this.fov.compute(Game.player.x,Game.player.y,50,function(x,y,r,visibility) {
            let key=x+','+y;
            if (key in Game.map) {
                let art = Game.map[key].getArt();
                Game.display.draw(x+Game.offset[0]-Game.player.x,y+Game.offset[1]-Game.player.y,art[0],art[1],art[2]);
            }
        });

        this.display.drawText(1,1,"Cleanliness: " + this.cleanPercent() + "%");
        var dayCounter="Day: "+this.day;
        //var pointCounter = "Points: "+(this.yendorPoints+this.cleanPercent());
        this.display.drawText(2*this.offset[0]-dayCounter.length-2,1,dayCounter);
        //this.display.drawText(2*this.offset[0]-pointCounter.length-2,2,pointCounter);

        if (Game.player.examining != null) {
            this.display.draw(Game.player.examining[0]+Game.offset[0]-Game.player.x,Game.player.examining[1]+Game.offset[1]-Game.player.y,'X','#ff0');
            let lookKey=Game.player.examining[0]+','+Game.player.examining[1];
            if (lookKey in this.map && this.map[lookKey].visible) {
                if (this.map[lookKey].entity != null) {
                    if (this.map[lookKey].entity == Game.player) {
                        this.sendMessage("It's you!");
                    }
                    else {
                        this.sendMessage(this.map[lookKey].entity.name+".");
                    }
                }
                else if (this.map[lookKey].mess != null) {
                    this.sendMessage(this.map[lookKey].mess.name+". "+this.map[lookKey].mess.getAction());
                }
                else if (this.map[lookKey].door != null) {
                    if (this.map[lookKey].open) {
                        this.sendMessage("Open door.");
                    }
                    else {
                        this.sendMessage("Closed door.");
                    }
                }
                else if (!this.map[lookKey].passable) {
                    this.sendMessage("Wall.");
                }
                else if (this.map[lookKey].char=='>') {
                    this.sendMessage("Down staircase.");
                }
                else if (this.map[lookKey].char=='<') {
                    this.sendMessage("Up staircase.");
                }
                else {
                    this.sendMessage("Floor.");
                }
            }
            else {
                this.sendMessage("You can't see that area.");
            }
        }

        if (Game.player.talking) {
            Game.player.talking.doConvo();
        }
        else {
            this.sendMessage();
        }
    },

    sendMessage: function(msg=null,important=true) {
        if (this.lastMessage != "" && !important) {
            msg=null;
        }
        if (msg != null) {
            this.lastlastMessage=msg;
            this.lastlastMessageTime=4;
            this.lastMessage=msg;
            this.display.drawText(2,2*this.offset[1]-2,"> "+msg);
        }
        else {
            if (this.lastMessage != "") {
                this.display.drawText(2,2*this.offset[1]-2,"> "+this.lastMessage);
            }
            else {
                if (this.lastlastMessage != "" && this.lastlastMessageTime>=0) {
                    this.display.drawText(2,2*this.offset[1]-2,"%c{#444}> "+this.lastlastMessage+"%c{}");
                }
            }
        }
    },

    cleanPercent: function() {
        let cleaned = Game.messNumbers[1] - Game.messNumbers[0];
        let toReturn = 100 * cleaned / Game.messNumbers[1];
        if (toReturn > this.coffeeThreshold || toReturn > this.inviteOutThreshold) {
            this.coffeeThreshold+=200;
            let sendIndex;
            do {
                sendIndex = Math.floor(this.monsterList.length * ROT.RNG.getUniform());
            } while (this.monsterList[sendIndex].alive == false || this.monsterList[sendIndex].retired == false || this.monsterList[sendIndex].partying);

            if (toReturn > this.inviteOutThreshold) {
                this.inviteOutThreshold+=200;
                this.monsterList[sendIndex].invitationQuest();
            }
            else {
                this.monsterList[sendIndex].coffeeQuest();
            }
        }
        return Math.floor(toReturn);
    },

    lightPasses: function(x,y) {
        let key=x+','+y;
        if (key in Game.map && Game.map[key].lightPasses()) {
            return true;
        }
        return false;
    },

    makeTheme: function(hueint,sat=0.5) {
        hue=parseFloat(hueint)/360.0;
        //offsethue=parseFloat(hueint+60 % 360)/360.0;
        var colors=[
            ROT.Color.hsl2rgb([hue,0.1*sat,0.6]),
            ROT.Color.hsl2rgb([hue,sat,0.4]),
            ROT.Color.hsl2rgb([hue,sat,0.2]),
            ROT.Color.hsl2rgb([hue,sat,0.6]),
            ROT.Color.hsl2rgb([hue,sat,0.3]),
            ROT.Color.hsl2rgb([hue,0,0.6]),
            ROT.Color.hsl2rgb([hue,0.5*sat,0.2]),
        ];
        return {
            floorColor:ROT.Color.toHex(colors[0]),
            corridorWalls:[ROT.Color.toHex(colors[1]),ROT.Color.toHex(colors[2])],
            roomWalls:[ROT.Color.toHex(colors[3]),ROT.Color.toHex(colors[4])],
            doorColor:[ROT.Color.toHex(colors[5]),ROT.Color.toHex(colors[6])],
        }
    },

    generateDungeon: function() {
        var thetheme=this.dungeonTheme;
        this.coffeeThreshold = Math.floor(10*ROT.RNG.getUniform()+20*ROT.RNG.getUniform())+30;
        this.inviteOutThreshold =Math.floor(7*ROT.RNG.getUniform()+8*ROT.RNG.getUniform())+80;
        //thetheme=this.makeTheme(300.0/360);
        if ('paint' in this.convoTags) {
            switch(this.convoTags.paint) {
                default:
                thetheme=this.dungeonTheme;
                break;
                case 'purple':
                thetheme=this.makeTheme(300);
                break;
                case 'red':
                thetheme=this.makeTheme(0);
                break;
                case 'blue':
                thetheme=this.makeTheme(240);
                break;
                case 'green':
                thetheme=this.makeTheme(120);
                break;
                case 'yellow':
                thetheme=this.makeTheme(60);
                break;
            }
        }
        this.generateMap(430,[4,10],5,thetheme);
        this.addStairs();
        this.adventurer = new Adventurer(this.stairs[0][0],this.stairs[0][1]);
        this.populateRooms();
        this.addDoors(thetheme);
    },

    generateDiner: function() {
        var thetheme = {
            floorColor:'#ddd',
            corridorWalls:['#a0a','#505'],
            roomWalls:['#f0f','#808'],
            doorColor:['#ddd','#842'],
        };
        this.generateMap(300,[6,8],0,thetheme);
        //this.addStairs();
        //this.adventurer = new Adventurer(this.stairs[0][0],this.stairs[0][1]);
        //this.populateRooms();
        this.addDoors(thetheme);
        this.scheduler.add(Game.player,true);
    },

    addSecretRoom: function(size,theme,spacing,doorSound=null) {
        let position=[0,0];
        while (!this.checkFits(size,position,spacing)) {
            position[0] += (Math.floor(5*ROT.RNG.getUniform())-2);
            position[1] += (Math.floor(5*ROT.RNG.getUniform())-2);
        }
        this.roomCenters.push([position[0]+Math.floor(size[0]/2) , position[1]+Math.floor(size[1]/2)]);
        this.secretCorridor(this.roomCenters,theme,doorSound);
        this.buildRoom(size,position,theme);
    },

    secretCorridor: function(roomCenters,theme,doorSound=null) {
        let lastCenter = [roomCenters[roomCenters.length-1][0], roomCenters[roomCenters.length-1][1]];
        let index;// = Math.floor((roomCenters.length-1) * ROT.RNG.getUniform());
        let allCells=this.freeCells.concat(this.hallCells);
        let best = 1000;
        let startCenter=[0,0];
        //let index=-1;
        for (let i = 0; i < allCells.length - 1; i++) {
            let key = allCells[i];
            if (key in this.map && this.map[key].mess == null && this.map[key].passThrough()) {
                let parts=key.split(',');
                let px=parseInt(parts[0]);
                let py=parseInt(parts[1]);
                if (Math.abs(lastCenter[0] - px) + Math.abs(lastCenter[1] - py) < best) {
                    index = i;
                    best = Math.abs(lastCenter[0] - px) + Math.abs(lastCenter[1] - py);
                    startCenter[0]=px;
                    startCenter[1]=py;
                }
            }
        }
        //let startCenter = roomCenters[index];
        let direction=[0,0];
        let position=[startCenter[0],startCenter[1]];
        if (Math.abs(lastCenter[0]-startCenter[0]) > Math.abs(lastCenter[1]-startCenter[1])) {
            direction=[Math.sign(lastCenter[0]-startCenter[0]),0];
        }
        else {
            direction=[0,Math.sign(lastCenter[1]-startCenter[1])];
        }
        //let keepGoing=true;
        let secretDoorPlaced=false;
        let outside=false;
        while (position[0] != lastCenter[0] || position[1] != lastCenter[1]) {
            for (let i=-1;i<2;i++) {
                for (let j=-1;j<2;j++) {
                    let key = (position[0]+i)+','+(position[1]+j);
                    //this.map[key] = new Tile(position[0]+i,position[1]+j,'.',theme.floorColor,'#000',true,true);

                    if (i==0 && j==0) {
                        if (key in Game.map && !Game.map[key].passable) {
                            if (secretDoorPlaced) {
                                this.map[key] = new Tile(position[0]+i,position[1]+j,'.',theme.floorColor,'#000',true,true);
                                outside=true;
                            }
                            else {
                                //this.map[key].char='x';
                                this.map[key].secretDoor = {
                                    char:'+',
                                    door:'-',
                                    color:theme.doorColor[0],
                                    bgColor:theme.doorColor[1],
                                    sound:doorSound,
                                }
                                secretDoorPlaced=true;
                            }
                        }
                    }
                    else {
                        if (!(key in Game.map)) {
                            this.map[key] = new Tile(position[0]+i,position[1]+j,'#',theme.corridorWalls[0],theme.corridorWalls[1],false,false);
                        }
                    }
                }
            }
            if (outside==secretDoorPlaced) {
                //direction=[Math.sign(lastCenter[0]-position[0]),Math.sign(lastCenter[1]-position[1])];
                if (Math.abs(lastCenter[0]-position[0])+ ((ROT.RNG.getUniform()>0.5) ? 1 : 0) > Math.abs(lastCenter[1]-position[1])) {
                    direction=[Math.sign(lastCenter[0]-position[0]),0];
                }
                else {
                    direction=[0,Math.sign(lastCenter[1]-position[1])];
                }
                let nextKey=(position[0]+direction[0])+','+(position[1]+direction[1]);
                let nextnextKey=(position[0]+2*direction[0])+','+(position[1]+2*direction[1]);
                if (nextKey in this.map && !this.map[nextKey].passable && nextnextKey in this.map && !this.map[nextnextKey].passable) {
                    if (direction[0]==0) {
                        direction=[Math.sign(lastCenter[0]-position[0]),0];
                    }
                    else {
                        direction=[0,Math.sign(lastCenter[1]-position[1])];
                    }
                }
                //if (position[0]+direction[0])

            }
            position[0]+=direction[0];
            position[1]+=direction[1];
        }
    },

    generateMap: function(targSize = 400 , minMax=[4,10], spacing=5,theme=this.dungeonTheme) {
        this.corners=[[0,0],[0,0]];
        this.messNumbers=[0,0];
        this.roomCenters=[];
        var breaker=0;
        //let minMax=[4,10];
        //let targSize=Math.min(400+30*this.day,800);
        this.map={};
        this.freeCells=[];
        this.hallCells=[];
        this.scheduler.clear();
        this.rooms=[];
        this.staffRoomID=-1;
        while (this.freeCells.length<targSize && breaker<10000) {
            let roomSize = [ Math.floor((minMax[1]-minMax[0])*ROT.RNG.getUniform())+minMax[0], Math.floor((minMax[1]-minMax[0])*ROT.RNG.getUniform())+minMax[0] ];
            let roomCorner=[0,0];
            var breaker2=0;
            while (!this.checkFits(roomSize,roomCorner,spacing)) {
                roomCorner[0] += (Math.floor(3*ROT.RNG.getUniform())-1);
                roomCorner[1] += (Math.floor(3*ROT.RNG.getUniform())-1);
                roomSize = [ Math.floor((minMax[1]-minMax[0])*ROT.RNG.getUniform())+minMax[0], Math.floor((minMax[1]-minMax[0])*ROT.RNG.getUniform())+minMax[0] ];
                if (this.freeCells.length + roomSize[0] * roomSize[1] >= targSize) {
                    roomSize[0]=minMax[1];
                    roomSize[1] = minMax[1];
                }
                breaker2++;
            }
            if (this.roomCenters.length>0) {
                this.roomCenters.push([roomCorner[0]+Math.floor(roomSize[0]/2) , roomCorner[1]+Math.floor(roomSize[1]/2)]);
            }
            else {
                this.roomCenters = [[roomCorner[0]+Math.floor(roomSize[0]/2) , roomCorner[1]+Math.floor(roomSize[1]/2)]];
            }
            this.buildRoom(roomSize,roomCorner,theme);
            if (ROT.RNG.getUniform()>0.5 && this.freeCells.length<targSize) {
                this.connectRoom(this.roomCenters,1,theme);
                this.connectRoom(this.roomCenters,0,theme);
            }
            else {
                this.connectRoom(this.roomCenters,-1,theme);
            }
            breaker++;
        }
        this.staffRoomID = this.rooms.length-1;
        this.player.moveTo(this.roomCenters[this.roomCenters.length-1][0],this.roomCenters[this.roomCenters.length-1][1]);
    },

    addDoors: function(theme=this.dungeonTheme) {
        for (let i=this.corners[0][0];i <= this.corners[1][0];i++) {
            for (let j=this.corners[0][1]; j<= this.corners[1][1];j++) {
                let key = i+','+j;
                let orthoCount=0;
                let diagCount=0;
                let count=0;
                let touchRoom=false;
                if (key in this.map && this.map[key].char == '.') {
                    for (let ii=-1;ii<2;ii++) {
                        for (let jj=-1;jj<2;jj++) {
                            let testKey = (i+ii)+','+(j+jj);
                            if (this.freeCells.indexOf(testKey)>=0) {
                                touchRoom=true;
                            }
                            if (testKey in this.map && this.map[testKey].char=='#') {
                                count++;
                                if (ii==0 || jj==0) {
                                    orthoCount += Math.abs(ii) + 3*Math.abs(jj);
                                }
                                else {
                                    diagCount++;
                                }
                            }
                        }
                    }
                    if (touchRoom && (orthoCount==2 || orthoCount==6) && count>2 && this.hallCells.indexOf(key)>=0) {
                        this.map[key].char='+';
                        this.map[key].door='-';
                        this.map[key].color=theme.doorColor[0];
                        this.map[key].bgColor=theme.doorColor[1];
                    }
                }
            }
        }
    },

    checkFits: function(roomSize,roomCorner,spacing=5) {
        for (let i=-spacing;i<roomSize[0]+spacing;i++) {
            for (let j=-spacing;j<roomSize[1]+spacing;j++) {
                let key = (i+roomCorner[0])+','+(j+roomCorner[1]);
                if (key in this.map) {
                    return false;
                }
            }
        }
        return true;
    },

    buildRoom: function(roomSize,roomCorner,theme=this.dungeonTheme) {
        if (this.rooms.length<1) {
            this.rooms=[ [roomCorner[0],roomCorner[1],roomCorner[0]+roomSize[0],roomCorner[1]+roomSize[1] , 0] ]
        }
        else {
            this.rooms.push( [roomCorner[0],roomCorner[1],roomCorner[0]+roomSize[0],roomCorner[1]+roomSize[1],0] );
        }
        for (let i=-1;i<roomSize[0]+1;i++) {
            for (let j=-1;j<roomSize[1]+1;j++) {
                let key = (i+roomCorner[0])+','+(j+roomCorner[1]);
                
                //console.log(key);
                if (i>=0 && i<roomSize[0] && j>=0 && j<roomSize[1]) {
                    //this.map[key]='.';
                    this.map[key] = new Tile(i,j,'.',theme.floorColor,'#000',true,true);
                    this.freeCells.push(key);
                }
                else {
                    //this.map[key]='#';
                    if (!(key in this.map) || !this.map[key].passable) {
                        this.map[key] = new Tile(i,j,'#',theme.roomWalls[0],theme.roomWalls[1],false,false);
                    }
                    if (i+roomCorner[0] < this.corners[0][0]) {
                        this.corners[0][0] = i+roomCorner[0];
                    }
                    if (j+roomCorner[1] < this.corners[0][1]) {
                        this.corners[0][1] = j+roomCorner[1];
                    }
                    if (i+roomCorner[0] > this.corners[1][0]) {
                        this.corners[1][0] = i+roomCorner[0];
                    }
                    if (j+roomCorner[1] > this.corners[1][1]) {
                        this.corners[1][1] = j+roomCorner[1];
                    }
                }
            }
        }
    },

    getRoomIndex: function(x,y) {
        for (let i=0;i<this.rooms.length;i++) {
            if (this.rooms[i][0] <= x && this.rooms[i][1] <= y && this.rooms[i][2]>=x && this.rooms[i][3]>=y) {
                return i;
            }
        }
        return -1;
    },

    connectRoom: function(roomCenters,xy=-1,theme=this.dungeonTheme) {
        //console.log(roomCenters);

        let lastCenter = [roomCenters[roomCenters.length-1][0], roomCenters[roomCenters.length-1][1]];
        let index = Math.floor((roomCenters.length-1) * ROT.RNG.getUniform());
        let best = 1000;
        //let index=-1;
        for (let i=0;i<roomCenters.length-1;i++) {
            if (xy==0) {
                if (Math.abs(lastCenter[0]-roomCenters[i][0]) < best) {
                    index=i;
                    best=Math.abs(lastCenter[0]-roomCenters[i][0])
                }
            }
            else if (xy==1) {
                if (Math.abs(lastCenter[1]-roomCenters[i][1]) < best) {
                    index=i;
                    best = Math.abs(lastCenter[1]-roomCenters[i][1]);
                }
            }
            else {
                if (Math.abs(lastCenter[0]-roomCenters[i][0]) + Math.abs(lastCenter[1]-roomCenters[i][1]) < best) {
                    index=i;
                    best = Math.abs(lastCenter[0]-roomCenters[i][0]) + Math.abs(lastCenter[1]-roomCenters[i][1]);
                }
            }
        }
        let targCenter = roomCenters[index];
        let startedDigging=false;
        let doFirst = Math.floor(2*ROT.RNG.getUniform());
        for (let k=0;k<2;k++) {
            var breaker=0;
            while (lastCenter[doFirst] != targCenter[doFirst] && breaker<1000) {
                for (let i=-1;i<2;i++) {
                    for (let j=-1;j<2;j++) {
                        let key = (lastCenter[0]+i)+','+(lastCenter[1]+j);
                        if (!(key in this.map) && !startedDigging) {
                            this.rooms[this.rooms.length-1][4]++;
                            startedDigging=true;
                        }
                        if (i==0 && j==0) {
                            //console.log(key);
                            if (this.map[key].char == '.' && startedDigging) {
                                if (this.getRoomIndex(lastCenter[0],lastCenter[1]) >= 0) {
                                    this.rooms[this.getRoomIndex(lastCenter[0],lastCenter[1])][4]++;
                                }
                                return;
                            }
                            if (key in this.map && this.map[key].char != '.') {
                                this.hallCells.push(key);
                            }
                            //this.map[key]='.';
                            this.map[key] = new Tile(i,j,'.',theme.floorColor,'#000',true,true);
                        }
                        else if (!(key in this.map)) {
                            //this.map[key]='#';
                            this.map[key] = new Tile(i,j,'#',theme.corridorWalls[0],theme.corridorWalls[1],false,false);
                        }
                    }
                }
                if (lastCenter[doFirst] > targCenter[doFirst]) {
                    lastCenter[doFirst]--;
                }
                else if (lastCenter[doFirst] < targCenter[doFirst]) {
                    lastCenter[doFirst]++;
                }
                breaker++;
            }
            doFirst++;
            doFirst %= 2;
        }
    },

    addStairs: function() {
        // try to put as far apart as possible. Exclude staff room
        let best=[-1,-1,-1];
        for (let i=0;i<this.rooms.length;i++) {
            if (i==this.staffRoomID) {
                continue;
            }
            for (let j=i;j<this.rooms.length;j++) {
                if (j==this.staffRoomID) {
                    continue;
                }
                let center1 = [Math.round((this.rooms[i][0]+this.rooms[i][2])/2),Math.round((this.rooms[i][1]+this.rooms[i][3])/2)];
                let center2 = [Math.round((this.rooms[j][0]+this.rooms[j][2])/2),Math.round((this.rooms[j][1]+this.rooms[j][3])/2)];
                let dist = Math.abs(center1[0] - center2[0]) + Math.abs(center1[1] - center2[1]);
                //console.log(dist);
                if (dist > best[2]) {
                    best[0]=i;
                    best[1]=j;
                    best[2]=dist;
                    console.log(best[0]+','+best[1]+','+best[2]);
                }
            }
        }
        if (ROT.RNG.getUniform()>0.5) {
            let scratch=best[0];
            best[0]=best[1];
            best[1]=scratch;
        }
        let center1 = [Math.floor((this.rooms[best[0]][0]+this.rooms[best[0]][2])/2),Math.floor((this.rooms[best[0]][1]+this.rooms[best[0]][3])/2)];
        let center2 = [Math.floor((this.rooms[best[1]][0]+this.rooms[best[1]][2])/2),Math.floor((this.rooms[best[1]][1]+this.rooms[best[1]][3])/2)];
        let key1=center1[0]+','+center1[1];
        let key2=center2[0]+','+center2[1];
        this.map[key1].char='<';
        this.map[key1].important=true;
        this.map[key2].important=true;
        this.map[key2].char='>';
        this.stairs=[ [center1[0],center1[1],best[0]] , [center2[0],center2[1],best[1]] ];
        console.log(this.stairs);
    },

    getCenter(roomID) {
        if (roomID<0 || roomID >= this.rooms.length) {
            return null;
        }
        let center = [Math.floor((this.rooms[roomID][0]+this.rooms[roomID][2])/2),Math.floor((this.rooms[roomID][1]+this.rooms[roomID][3])/2)];
        return center;
    },

    populateRooms: function() {
        for (let i=0;i<this.rooms.length;i++) {
            if (i==this.staffRoomID) {
                continue;
            }
            let center=this.getCenter(i);
            let validForItems=[];
            let roomSize=0;
            for (let x = this.rooms[i][0]; x < this.rooms[i][2]; x++) {
                for (let y = this.rooms[i][1]; y < this.rooms[i][3]; y++) {
                    roomSize++;
                    let wallCount = 0;
                    let floorCount = 0;
                    for (let ii = -1; ii < 2; ii++) {
                        for (let jj = -1; jj < 2; jj++) {
                            let key = (x + ii) + ',' + (y + jj);
                            if (key in this.map) {
                                if (this.map[key].passThrough()) {
                                    floorCount++;
                                }
                                else {
                                    wallCount++;
                                }
                            }
                        }
                    }
                    if (wallCount==3 && floorCount==6) {
                        let key=x+','+y;
                        validForItems.push(key);
                        //continue;
                    }
                }
            }
            if (validForItems.length > 0) {
                for (let k = 0; k < Math.max(2, 5 - this.rooms[i][4]); k++) {
                    let index = Math.floor(ROT.RNG.getUniform() * validForItems.length);
                    let parts = validForItems[index].split(',');
                    AddCollectible(parseInt(parts[0]), parseInt(parts[1]));
                    validForItems.splice(index,1);
                    if (validForItems.length<=0) {
                        break;
                    }
                }
            }

            let maxLevel = Math.floor(4*ROT.RNG.getUniform())+1;
            let danger = Math.max(1,Math.ceil(roomSize/40));
            if (this.rooms[i][4]<3) {
                danger++;
            }
            if (this.rooms[i][4]<2) {
                maxLevel++;
                danger*=2;
            }
            if (i==this.stairs[1][2]) {
                maxLevel=6;
                danger=7;
            }
            if (i==this.stairs[0][2]) {
                danger=1;
            }
            while (danger>0) {
                let level = Math.min(danger,Math.floor(ROT.RNG.getUniform()*maxLevel)+1);
                let newMonster=AddMonster(center[0],center[1],level);
                danger-=newMonster.level;
            }
        }
    },

    moveMonstersToLounge: function() {
        // build the party room
        this.addSecretRoom([5,5],this.makeTheme(300,0.9),1,"You hear the sound of muffled music.");
        this.partyRoomID=this.rooms.length-1;

        if ('animal' in this.convoTags && this.convoTags.animal != 'none') {
            let doorSound;
            switch (this.convoTags.animal) {
                default:
                case 'dog':
                doorSound="You hear the faint sound of barking.";
                break;
                case 'cat':
                doorSound="You hear a muffled meowing sound.";
                break;
                case 'rat':
                doorSound="You hear a muffled squeaking sound.";
                break;
                case 'rabbit':
                doorSound="You hear the sound of thumping.";
                break;
                case 'horse':
                doorSound="You hear sound of galloping."
                break;
            }
            this.addSecretRoom([5,5],this.makeTheme(200,0.75),1,doorSound);
            this.animalRoomID=this.rooms.length-1;
            let animalCenter=[
                Math.floor((this.rooms[this.animalRoomID][0]+this.rooms[this.animalRoomID][2])/2),
                Math.floor((this.rooms[this.animalRoomID][1]+this.rooms[this.animalRoomID][3])/2)
            ];
            let feederPos=[ this.rooms[this.animalRoomID][0]+1 , this.rooms[this.animalRoomID][1]+1 ];
            let foodBowl = new FoodBowl(feederPos[0],feederPos[1]);
            //let feederKey = feederPos[0]+','+feederPos[1];
            if (this.petList.length>0 && this.playerPet==null && this.player.cutscene==null) {
                let mostLove=[-1,-1];
                for (let i=0;i<this.petList.length;i++) {
                    if (this.petList[i].playerInteractions>mostLove[0]) {
                        mostLove[0]=this.petList[i].playerInteractions;
                        mostLove[1]=i;
                    }
                }
                if (mostLove[0]>5) {
                    this.playerPet=this.petList[mostLove[1]];
                    this.player.cutscene=[{message:"%c{#ff0}"+this.playerPet.name+" loves you a lot! They have adopted you.%c{}",any:-1}]
                }
            }
            //console.log('center'+animalCenter);
            let iterations=Math.min(8,Math.floor(this.yendorPoints/200)+2);
            for (let i=0;i<iterations;i++) {
                if (i<this.petList.length) {
                    if (this.petList[i]==this.playerPet) {
                        this.petList[i].recenter(this.player.x,this.player.y);
                    }
                    else {
                        this.petList[i].recenter(animalCenter[0],animalCenter[1]);
                    }
                }
                else {
                    let newPet = AddPet(animalCenter[0],animalCenter[1],this.convoTags.animal);//new Pet(animalCenter[0],animalCenter[1],'d','Dog');
                }
            };
        }

        let validSpots=[];
        let validPartySpots=[];
        ConversationBuilder.usedGenericOptions=[];

        for (let x = this.rooms[this.partyRoomID][0]; x < this.rooms[this.partyRoomID][2]; x++) {
            for (let y = this.rooms[this.partyRoomID][1]; y < this.rooms[this.partyRoomID][3]; y++) {
                let wallCount = 0;
                let floorCount = 0;
                for (let ii = -1; ii < 2; ii++) {
                    for (let jj = -1; jj < 2; jj++) {
                        let key = (x + ii) + ',' + (y + jj);
                        if (key in this.map) {
                            if (this.map[key].passable) {
                                floorCount++;
                            }
                            else {
                                wallCount++;
                            }
                        }
                    }
                }
                if ((wallCount == 3 && floorCount == 6)) {//} || (wallCount == 5 && floorCount == 4)) {
                    let key = x + ',' + y;
                    if (Game.map[key].entity == null) {
                        validPartySpots.push(key);
                        continue;
                    }
                }
            }
        }

        for (let x = this.rooms[this.staffRoomID][0]; x < this.rooms[this.staffRoomID][2]; x++) {
            for (let y = this.rooms[this.staffRoomID][1]; y < this.rooms[this.staffRoomID][3]; y++) {
                let wallCount = 0;
                let floorCount = 0;
                for (let ii = -1; ii < 2; ii++) {
                    for (let jj = -1; jj < 2; jj++) {
                        let key = (x + ii) + ',' + (y + jj);
                        if (key in this.map) {
                            if (this.map[key].passable) {
                                floorCount++;
                            }
                            else {
                                wallCount++;
                            }
                        }
                    }
                }
                if ((wallCount == 3 && floorCount == 6)) {//} || (wallCount == 5 && floorCount == 4)) {
                    let key = x + ',' + y;
                    if (Game.map[key].entity == null) {
                        validSpots.push(key);
                        continue;
                    }
                }

                if (x%2==0 || y%2==0) {
                    continue;
                }

                let suitableForTable = true;
                for (let ii = -1; ii < 2; ii++) {
                    for (let jj = -1; jj < 2; jj++) {
                        let key = (x + ii) + ',' + (y + jj);
                        if (validSpots.indexOf(key)>=0) {
                            suitableForTable = false;
                            break;
                        }
                        if (!(key in this.map && this.map[key].passThrough())) {
                            suitableForTable = false;
                            break;
                        }
                    }
                    if (!suitableForTable) {
                        break;
                    }
                }
                if (suitableForTable) {
                    //let key=x+','+y;
                    console.log("??");
                    GetEntity('Table', x, y);
                }
            }
        }
        let level=4;
        let maxPlace=Math.floor(validSpots.length/2);
        let maxParty=Math.floor(validPartySpots.length/2);
        // Sort monsters. Prioritize higher level, more loved by the player, more loved by eachother
        this.monsterList.sort(function (a,b) {
            return 2*b.level+b.playerInteractions+b.friends.length - 2*a.level+a.playerInteractions+a.friends.length;
        });
        let questItemIndex = Math.floor(maxPlace * ROT.RNG.getUniform());
        let partyCommenced=false;
        let donePlacing=false;
        for (let i = 0; i < this.monsterList.length; i++) {
            //if (this.monsterList[i].level != level) {
            //    continue;
            //}
            this.monsterList[i].spreadCount=-1;
            this.monsterList[i].spreading=null;
            this.monsterList[i].alive=false; // default, incase we run out of space
            if (this.monsterList[i].retired || donePlacing) {
                continue; // retired never got reset. They were not in the dungeon today!
            }

            // Remove them from their current location if they are still there
            let alivePosKey=this.monsterList[i].x+','+this.monsterList[i].y;
            if (alivePosKey in this.map && this.map[alivePosKey].entity == this.monsterList[i]) {
                this.map[alivePosKey].entity=null;
            }

            if (!partyCommenced) {
                if (this.monsterList[i].questItem != null && !this.monsterList[i].questItem.pickedUp) {
                    let questPos = this.randomFarFromPlayer();
                    this.monsterList[i].questItem.x = questPos[0];
                    this.monsterList[i].questItem.y = questPos[1];
                    let questKey = questPos[0] + ',' + questPos[1];
                    Game.map[questKey].mess = this.monsterList[i].questItem;
                }
                else if (this.monsterList[i].questItem == null && questItemIndex >= 0) {
                    if (questItemIndex == 0 || (this.unionist != null && this.unionist == this.monsterList[i].name)) {
                        let questPos = this.randomFarFromPlayer();
                        QuestMess(this.monsterList[i], questPos[0], questPos[1]);
                        questItemIndex -= 1000;
                    }
                }
                questItemIndex--;

                this.monsterList[i].alive = true;
                this.monsterList[i].retired = true;
                this.monsterList[i].partying=false;
                //ConversationBuilder.buildConvos(this.monsterList[i]);
                let index = Math.floor(ROT.RNG.getUniform() * validSpots.length);
                Game.map[validSpots[index]].entity = this.monsterList[i];
                let parts = validSpots[index].split(',');
                this.monsterList[i].x = parseInt(parts[0]);
                this.monsterList[i].y = parseInt(parts[1]);
                validSpots.splice(index, 1);
                if (validSpots.length <= maxPlace || validSpots == null) {
                    partyCommenced = true;
                }
            }
            else {
                this.monsterList[i].alive = true;
                this.monsterList[i].retired = true;
                this.monsterList[i].partying=true;
                //ConversationBuilder.buildConvos(this.monsterList[i],true);
                let index = Math.floor(ROT.RNG.getUniform() * validPartySpots.length);
                Game.map[validPartySpots[index]].entity = this.monsterList[i];
                let parts = validPartySpots[index].split(',');
                this.monsterList[i].x = parseInt(parts[0]);
                this.monsterList[i].y = parseInt(parts[1]);
                validPartySpots.splice(index, 1);
                if (validPartySpots.length <= maxParty || validPartySpots == null) {
                    donePlacing=true;
                }
            }
        }

        // do conversations in reverse order
        for (let j = 0; j < 2; j++) {
            for (let i = this.monsterList.length - 1; i >= 0; i--) {
                if (this.monsterList[i].alive) {
                    if ((j==0) == (!this.monsterList[i].partying)) {
                        ConversationBuilder.buildConvos(this.monsterList[i],j!=0);
                    }
                }
            }
        }

        // Add exit door
        {
            let index = Math.floor(ROT.RNG.getUniform() * validSpots.length);
            let parts = validSpots[index].split(',');
            let px = parseInt(parts[0]);
            let py = parseInt(parts[1]);
            //console.log(px+','+py);
            let exitDoor = GetEntity('ExitDoor', px, py);
            //let ughKey=exitDoor.x+','+exitDoor.y;
            //Game.map[ughKey].lastSeen='?';
            //console.log('exit:'+exitDoor.x+","+exitDoor.y);
            let best=[0,0,100];
            for (let i =-5;i<6;i++) {
                for (let j=-2;j<3;j++) {
                    let fits=true;
                    for (let ii=-3;ii<3;ii++) {
                        let testKey=(exitDoor.x+i+ii)+','+(exitDoor.y+j);
                        if (testKey in Game.map) {
                            fits=false;
                        }
                    }
                    if (fits) {
                        let dist=Math.abs(i)+Math.abs(j);
                        if (dist < best[2]) {
                            best[0]=i;
                            best[1]=j;
                            best[2]=dist;
                        }
                    }
                }
            }
            if (best[2] < 100) {
                let letters = ['*', 'E', 'X', 'I', 'T', '*'];
                for (let ii = -3; ii < 3; ii++) {
                    let testKey = (exitDoor.x + best[0] + ii) + ',' + (exitDoor.y + best[1]);
                    Game.map[testKey] = new Tile(best[0], best[1], letters[ii + 3], '#fff', '#000', false, false);
                    Game.map[testKey].lastSeen = letters[ii + 3];
                }
            }
        }

        for (let i=0;i<this.monsterList.length;i++) {
            if (!(this.monsterList[i].retired)) {
                this.monsterList[i].alive=false;
                let key = this.monsterList[i].x + ',' + this.monsterList[i].y;
                if (key in Game.map && Game.map[key].entity == this.monsterList[i]) {
                    Game.map[key].entity = null;
                }
            }
        }
        //let newPet = new Pet(this.player.x,this.player.y,'d','red','Dog');
    },

    randomFarFromPlayer: function(tries=10) {
        var best=[0,0,0];
        var i=0;
        while (i<tries) {
            let testKey = ROT.RNG.getItem(this.freeCells);

            if (testKey in Game.map && Game.map[testKey].entity == null && Game.map[testKey].mess==null && !(Game.map[testKey].important)) {
                let parts = testKey.split(',');
                let px = parseInt(parts[0]);
                let py = parseInt(parts[1]);
                let dist = Math.abs(this.player.x - px) + Math.abs(this.player.y - py);
                if (dist > best[2]) {
                    best[2]=dist;
                    best[0]=px;
                    best[1]=py;
                }
                tries--;
            }
        }
        return [best[0],best[1]];
    },

    checkConditions: function(conditions,speaker=null)  {
        let success=true;

        if ('cleanliness' in conditions) {
            if (this.cleanPercent() < conditions.cleanliness) {
                success=false;
            }
        }

        if ('questItemGot' in conditions && speaker!=null) {
            console.log(conditions.questItemGot+','+speaker.questItem.pickedUp);
            if (speaker.questItem != null && conditions.questItemGot == speaker.questItem.pickedUp) {
                success&=true;
            }
            else {
                success=false;
            }
            console.log("success:"+success);
        }

        let keys = Object.getOwnPropertyNames(conditions);
        for (let i=0;i<keys.length;i++) {
            if (keys[i]=='cleanliness') {
                continue;
            }
            if (keys[i]=='questItemGot') {
                continue;
            }
            if (keys[i] in Game.convoTags) {
                if (typeof Game.convoTags[keys[i]] == typeof conditions[keys[i]]) {
                    success &= (Game.convoTags[keys[i]] == conditions[keys[i]]); // do they match?
                }
                else {
                    success &= conditions[keys[i]]; // condition is "does it exist?"
                }
            }
            else {
                success &= !(conditions[keys[i]]); // condition is "does it not exist?"
            }
        }
        return success;
    },

    nextDay() {
        this.day++;
        this.yendorPoints += this.cleanPercent();
        if (this.yendorPoints>=this.targetPoints && !this.victory) {
            this.player.cutscene=ConversationBuilder.victoryPrompt();
            this.victory=true;
        }
        //this.engine.unlock();
        this.generateDungeon();
    },
};