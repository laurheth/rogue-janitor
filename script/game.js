var Game = {
    display: null,
    map: {},
    freeCells:[],
    hallCells:[],
    rooms:[],
    player:null,
    scheduler:null,
    engine:null,
    offset: [],
    corners:[],
    floorColor:'#ddd',
    corridorWalls:['#b82','#842'],
    roomWalls:['#ddd','#777'],
    doorColor:['#ddd','#842'],
    staffRoomID:-1,
    stairs:[[0,0,-1],[0,0,-1]],
    adventurer: null,
    init: function() {
        let screen = document.getElementById("gameContainer");
        this.display = new ROT.Display();
        var setsize=this.display.computeSize(screen.clientWidth,screen.clientHeight);
        //console.log(screen.clientWidth+','+screen.clientHeight);
        this.display.setOptions({width: setsize[0],height: setsize[1]});
        this.offset[0] = parseInt(setsize[0]/2);
        this.offset[1] = parseInt(setsize[1]/2);
        screen.appendChild(this.display.getContainer());
        this.scheduler = new ROT.Scheduler.Simple();
        this.player = new Player(-1,-1,-1);

        this.scheduler.add(this.player,true);

        this.generateMap();

        this.drawMap();

        this.engine = new ROT.Engine(this.scheduler);
        this.engine.start();
    },

    drawMap: function() {
        this.display.clear();
        for (let i=-this.offset[0]+this.player.x;i<=this.offset[0]+this.player.x;i++) {
            for (let j=-this.offset[1]+this.player.y;j<=this.offset[1]+this.player.y;j++) {
                let key=i+','+j;
                //console.log(key);
                if (key in this.map) {
                    let art = this.map[key].getArt();
                    this.display.draw(i+this.offset[0]-this.player.x,j+this.offset[1]-this.player.y,art[0],art[1],art[2]);
                }
            }
        }
    },

    lightPasses: function(x,y) {
        let key=x+','+y;
        if (key in Game.map && Game.map[key].lightPasses()) {
            return true;
        }
        return false;
    },

    generateMap: function() {
        this.corners=[[0,0],[0,0]];
        var roomCenters=[];
        var breaker=0;
        let minMax=[4,15];
        let targSize=400;
        while (this.freeCells.length<targSize && breaker<10000) {
            let roomSize = [ Math.floor((minMax[1]-minMax[0])*ROT.RNG.getUniform())+minMax[0], Math.floor((minMax[1]-minMax[0])*ROT.RNG.getUniform())+minMax[0] ];
            let roomCorner=[0,0];
            var breaker2=0;
            while (!this.checkFits(roomSize,roomCorner)) {
                roomCorner[0] += (Math.floor(3*ROT.RNG.getUniform())-1);
                roomCorner[1] += (Math.floor(3*ROT.RNG.getUniform())-1);
                roomSize = [ Math.floor((minMax[1]-minMax[0])*ROT.RNG.getUniform())+minMax[0], Math.floor((minMax[1]-minMax[0])*ROT.RNG.getUniform())+minMax[0] ];
                breaker2++;
            }
            if (roomCenters.length>0) {
                roomCenters.push([roomCorner[0]+Math.floor(roomSize[0]/2) , roomCorner[1]+Math.floor(roomSize[1]/2)]);
            }
            else {
                roomCenters = [[roomCorner[0]+Math.floor(roomSize[0]/2) , roomCorner[1]+Math.floor(roomSize[1]/2)]];
            }
            this.buildRoom(roomSize,roomCorner);
            if (ROT.RNG.getUniform()>0.5 && this.freeCells.length<targSize) {
                this.connectRoom(roomCenters,1);
                this.connectRoom(roomCenters,0);
            }
            else {
                this.connectRoom(roomCenters,-1);
            }
            breaker++;
        }
        this.staffRoomID = this.rooms.length-1;
        this.player.moveTo(roomCenters[roomCenters.length-1][0],roomCenters[roomCenters.length-1][1]);
//        this.player.x = roomCenters[roomCenters.length-1][0];
//        this.player.y = roomCenters[roomCenters.length-1][1];
        this.addStairs();
        this.adventurer = new Adventurer(this.stairs[0][0],this.stairs[0][1]);
        this.populateRooms();
        this.addDoors();

    },

    addDoors: function() {
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
                        this.map[key].color=this.doorColor[0];
                        this.map[key].bgColor=this.doorColor[1];
                    }
                }
            }
        }
    },

    checkFits: function(roomSize,roomCorner) {
        for (let i=-5;i<roomSize[0]+5;i++) {
            for (let j=-5;j<roomSize[1]+5;j++) {
                let key = (i+roomCorner[0])+','+(j+roomCorner[1]);
                if (key in this.map) {
                    return false;
                }
            }
        }
        return true;
    },

    buildRoom: function(roomSize,roomCorner) {
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
                    this.map[key] = new Tile(i,j,'.',this.floorColor,'#000',true,true);
                    this.freeCells.push(key);
                }
                else {
                    //this.map[key]='#';
                    this.map[key] = new Tile(i,j,'#',this.roomWalls[0],this.roomWalls[1],false,false);
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

    connectRoom: function(roomCenters,xy=-1) {
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
                            this.map[key] = new Tile(i,j,'.',this.floorColor,'#000',true,true);
                        }
                        else if (!(key in this.map)) {
                            //this.map[key]='#';
                            this.map[key] = new Tile(i,j,'#',this.corridorWalls[0],this.corridorWalls[1],false,false);
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
                    }
                }
            }
            if (validForItems.length > 0) {
                for (let k = 0; k < Math.max(2, 5 - this.rooms[i][4]); k++) {
                    let index = Math.floor(ROT.RNG.getUniform() * validForItems.length);
                    let parts = validForItems[index].split(',');
                    AddCollectible(parseInt(parts[0]), parseInt(parts[1]));
                }
            }

            let maxLevel = Math.floor(2*ROT.RNG.getUniform())+1;
            let danger = Math.max(1,Math.floor(roomSize/50));
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

};