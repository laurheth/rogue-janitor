var ConversationBuilder = {
    idleOptions: ["is vaping.","is enjoying a relaxing drink.","is reading a book.","is having a coffee.","is eating an apple."],
    buildConvos: function(speaker) {
        speaker.playerTalkedToday=false;
        var newConversation = [[{action: ROT.RNG.getItem(this.idleOptions),any:-1}]];
        newConversation.push(this.randomGeneric(speaker));

        if (speaker.friends.length>0) {
            let friend=ROT.RNG.getItem(speaker.friends);
            newConversation.push(this.loveMyFriend(friend));
        }
        //return newConversation;
        if (speaker.damagedealt>=4) {
            newConversation.push(this.lottaDamage(speaker));
        }
        else if (speaker.damagedealt<=1 && ROT.RNG.getUniform()>0.8) {
            newConversation.push(this.noDamage(speaker));
        }
        //newConversation.push(this.impressed());
        let specificConvo = this.specificConvo(speaker);

        if (specificConvo != null) {
            newConversation.push(specificConvo);
        }

        if (!speaker.metPlayer) {
            newConversation.push(this.meetingPlayer(speaker));
        }
        speaker.convos=newConversation;
        speaker.lastDay = Game.day;
    },
    
    specificConvo: function(speaker) {
        if (speaker.playerInteractions > 0) {
            if ('wantsCareer' in speaker.convoTags) {
                if (speaker.convoTags.wantsCareer == 'painter' || speaker.convoTags.wantsCareer == 'artist') {
                    if (ROT.RNG.getUniform() > 0.5) {
                        speaker.convoTags.wantsToPaint = true;
                    }
                    if ('wantsToPaint' in speaker.convoTags && speaker.convoTags.wantsToPaint) {
                        return [
                            { text: "Hmm... I've been thinking, the colors on these walls are getting kind of old!", any: 1 },
                            { text: "Do you think I should repaint the dungeon?", y: 2, n: 9 },
                            {
                                text: "Heck yeah! What colour do you think I should go with?",
                                "How about a nice dark purple?": 3,
                                "Lets make everything red!": 4,
                                "Hmm... Lets make it green!": 5,
                                "Blue, like the sky!": 6,
                                "Lets make it a nice golden yellow!": 7,
                                "Honestly, it's rustic, but I like the classic colours!": 8,
                                globalTags:{yendorPoints:20}
                            },
                            { text: "Heck yeah! I'll have the dungeon purple by tomorrow :D", any: -1, globalTags: { paint: 'purple' } },
                            { text: "Bold! I like it. The dungeon will be red by tomorrow!", any: -1, globalTags: { paint: 'red' } },
                            { text: "How vibrant! I'll paint it green overnight tonight :D", any: -1, globalTags: { paint: 'green' } },
                            { text: "Nice! Good way to make the inside feel outdoorsy. Blue, coming up!", any: -1, globalTags: { paint: 'blue' } },
                            { text: "I like it! The dungeon will be yellow by tomorrow :D", any: -1, globalTags: { paint: 'yellow' } },
                            { text: "Fair! Sometimes, classic really is the best! I'll have it painted tomorrow :)", any: -1, globalTags: { paint: 'default' } },
                            { text: "Fair! I just wanna practice on something... let me know if you change your mind!", any: -1 }
                        ];
                    }
                }
            }
        }
        if (speaker.playerInteractions > 2) {
            if ('wantsCareer' in speaker.convoTags && !('appliedToSchool' in speaker.convoTags)) {
                var newConvo= [
                    {text: "So, I've been thinking of applying to Monster School to become a "+speaker.convoTags.wantsCareer+"!",any:1},
                    {text: "This application is huge though, holy frig.",
                        "Dang, that sucks. Thoughts and prayers, friend.":2,
                        "You can do it! Maybe other folks in the dungeon could help out?":3,
                        "Hey, I bet I could help out!":4,
                    },
                    {text:"Thanks! With the power of thoughts and prayers I'm certain this will work out!",any:-1,tags:{appliedToSchool:false}},
                    {},
                    {text:"Hey, thanks so much! Here's my cover letter, let me know what you think!",any:5},
                    {message:"You read the paper...",any:6},
                    {message:"Dear Monster School,",any:7},
                    {message:"All my life, I have lived here, deep in a dungeon.",any:8},
                    {message:"All that time, I have yearned to be a "+speaker.convoTags.wantsCareer+".",any:9},
                    {message:"Please accept me to Monster School.",any:10},
                    {message:"Sincerely, "+speaker.name,any:11},
                    {text:"So, what do you think??","It's good!":12,"It's bad.":12},
                    {text:"Thanks for your opinion!! I'll keep at it and let you know when I hear back :)",any:-1,tags:{appliedToSchool:true},globalTags:{yendorPoints:50}},
                ];
                if (speaker.friends.length>0) {
                    newConvo[3] = {text:"Yeah! My good friend "+ROT.RNG.getItem(speaker.friends)+" will help for sure!",any:-1,tags:{appliedToSchool:true}};
                }
                else {
                    newConvo[3] = {text:"Hmm... yeah? Maybe I can ask around. Thanks!",any:-1,tags:{appliedToSchool:false}};
                }
                return newConvo;
            }
            if ('depression' in speaker.convoTags && !('depressionConvoA' in speaker.convoTags)) {
                var newConvo = [{
                                    text: "How've you been doing today, friend?",
                                    "I'm doing pretty well today!":1,
                                    "Ehh, I've been better, but I'm alright.":2,
                                    "Honestly, having a rough time today.":3,
                                },
                                {text:"I'm glad to hear that :D!",any:4},
                                {text:"That's real. I'm glad you're doing alright, though :)",any:4},
                                {text:"Oof. I'm sorry to hear that. I'm having a rough time, too. My anxiety is through the roof.",any:5},
                                {text:"I'm having a hard time today. My anxiety is through the roof.",any:5},
                                {text:"Is it okay if I talk it?",y:7,n:6},
                                {text:"That's legit! Maybe we can chat another time :)",any:-1},
                                {text:"I'm terrified I'll just never amount to anything, and nothing I do will ever matter.",any:8},
                                {text:"And like... what if other folks in the dungeon are only pretending to be nice to me?",any:9},
                                {
                                    text:"I'm not sure if I'm making sense.",
                                    "You're totally making sense. I feel that way sometimes too.":12,
                                    "I'm not sure, but your feelings are real and I'm here for you.":12,
                                    "Maybe you should vape some more?":10,
                                    "Have you tried not worrying about things?":11
                                },
                                {text:"Hmm. I already vape a lot, but I'll try to vape even more!",any:-1,tags:{depressionConvoA:false}},
                                {text:"Uh. Yes. Constantly? Nevermind.",any:-1,tags:{depressionConvoA:false},globalTags:{yendorPoints:-20}},
                                {text:"That's comforting to hear.",any:13},
                                {text:"Thank you for listening, friend ^.^",any:-1,tags:{depressionConvoA:true},globalTags:{yendorPoints:50}}
                            ];
                return newConvo;
            }
        }
        if (speaker.playerInteractions>4) {
            if ('wantsCareer' in speaker.convoTags && 'appliedToSchool' in speaker.convoTags && !('careerConcluded' in speaker.convoTags)) {
                if (speaker.convoTags.appliedToSchool) {
                    return [
                        {text:"Hey! Guess what??",any:1},
                        {text:"I got accepted to Monster School!!",any:2},
                        {text:"I'm gonna take some classes and then become a professional "+speaker.convoTags.wantsCareer+"!",any:3},
                        {text:"I'm so excited! Thank you so much for your help!",any:-1,tags:{careerConcluded:true},globalTags:{yendorPoints:50}},
                    ];
                }
                else {
                    return [
                        {action:"wipes away tears.",any:1},
                        {text:"I didn't get into Monster School :(",any:2},
                        {text:"I'm disappointed, but I've got a good gig here. Life goes on and all that.",any:-1,tags:{careerConcluded:false}},
                        //{text:"I can still do "+speaker.convoTags.wantsCareer+" stuff as a hobby! I think that will be enough.",any:-1,tags:{careerConcluded:false}},
                    ];
                }
            }
        }
        return null;
    },

    randomGeneric: function(speaker) {
        //let option = Math.floor(ROT.RNG.getUniform() * 10);
        let possibilities=[
            [
                "It's nice to relax after a long day in the dungeon!"
            ],
            [
                "Sometimes you're in a really remote room in the dungeon...",
                "It takes forever for the adventurer to show up!",
                "It's alright though. It's relaxing to hang out for a bit."
            ],
            [
                "Adventuring is the biggest industry in dungeons. It's like tourism, but more fun."
            ],
            [
                "Psst, don't tell adventurers, but all that 'blood' is just watered down ketchup.",
                "Real violence is a strict violation of workplace safety regulations!"
            ],
            [
                "Golly I could go for a hot cup of coffee right about now."
            ],
            [
                "Dang I love fighting adventurers!"
            ],
        ];
        if (Game.unionist != null && Game.union != this.name) {
            possibilities.push([
                "This dungeon used to have a really bad boss. They were a mean wizard who hoarded wealth and kept docking our pay.",
                "At some point, it got to be too much.",
                Game.unionist+" set up a meeting, we started working together as comrades, and we overthrew the boss!",
                "After all, there were many more of us, and money can't save you from the teeth and claws of organized monsters!",
                "These days, we run the dungeon as a workers co-op. Everyone who is a part of the dungeon has a say, and everyone reaps the rewards!"
            ]);
        }
        if ('big' in speaker.tags) {
            possibilities.push([
                "When you're a big monster like me, it's sometimes hard to move around.",
                "When you think about it, dungeons are pretty cramped, underground spaces!",
                "Luckily, for a "+speaker.species.toLowerCase()+", I'm pretty good at squeezing through hallways."
            ]);
            possibilities.push([
                "With long limbs like mine, it's pretty easy to reach things that are really high up.",
                "Smaller monsters sometimes can't reach things. And, you know what? That's okay!",
                "I'm always happy to help my friends out!"
            ]);
            possibilities.push([
                "I'm huge, which means I have huge guts, and a huge appetite!",
                "Luckily, we have very generous and flexible lunch breaks here.",
                "Always take your lunch break! Your health is more important than your job!"
            ]);
        }
        if ('small' in speaker.tags) {
            possibilities.push([
                "When I first started working here, it was intimidating to work with some pretty huge monsters.",
                "I'm really small, and they're really big! Honestly I was afraid they would crush me by accident.",
                "But in my time here I've learned...",
                "They're all a bunch of softies!",
                "You know what they say: The biggest monsters also have the biggest hearts!"
            ]);
            possibilities.push([
                "This dungeon is full of little nooks and crannies. I love trying to fit into them."
            ]);
        }
        if (speaker.species=='Hydra') {
            possibilities.push([
                "Hey, pull my head ;)",
                "OH NO OH FRIG YOU PULLED ONE OF MY HEADS OFF",
                "Hahaha just kidding, I've got like a dozen.",
                "When you're a hydra you get to have some fun party tricks."
            ]);
        }
        if ('rangeMess' in speaker.tags && speaker.tags.rangeMess=='Scorch') {
            possibilities.push([
                "Do I like fire? Yes of course.",
                "But does that mean I like to just burn things, willy nilly?",
                "...also yes."
            ]);
        }

        if (speaker.species=='Imp' || speaker.species=='Balor') {
            possibilities.push([
                "The best thing about being a demonic being of eternally burning flame?",
                "I always host the BEST barbeques.",
                "Next time I have one, I'll invite you!"
            ]);
        }

        if (speaker.species=='Naga') {
            possibilities.push([
                "Being a cold blooded snake monster is tough sometimes.",
                "It gets so cold! Folks never seem to have the heat turned up enough.",
                "Make sure you close doors behind you. It gets so drafty in here sometimes."
            ]);
            possibilities.push([
                "Spitting acid is fun. It is pretty messy though.",
                "On the bright side, it kills just about any bacteria that might be growing on a surface?",
                "I havn't been sick in at least a few decades."
            ]);
        }

        let fancyOptions=3;
        let option=Math.floor(ROT.RNG.getUniform() * (possibilities.length+fancyOptions));

        if (!('careerChange' in speaker.tags)) {
            if (option==2) {
                option+=Math.floor(ROT.RNG.getUniform() * (possibilities.length))+1;
            }
        }
        else {
            if (!('wantsCareer' in speaker.convoTags)) {
                //if (ROT.RNG.getUniform())
                option=2;
            }
        }

        switch(option) {
            case 0:
            return [{text:"Hey friend, want to vape with me?",y:1,n:2},
                    {action:"passes you their vape. It's nice!",any:-1},
                    {text:"Legit! Nobody should make you feel bad for saying no :)",any:-1},
                    ];
            case 1:
            return [{text:"Gee whiz I love dogs. And cats. Humans have good taste in critters.",any:1,conditions:{animal:false}},
                    {text:"What's your favourite type of critter?","I love cats!":2,"Dog's are good and I like to pet them!":3,"Rabbits are great!":4,"Rats are my favourite!":5,"I love horses. Neigh!":6,"I'm not really an animal person...":7},
                    {text:"Wow! Cats! Me too!",any:-1,globalTags:{animal:'cat'}},
                    {text:"Wow! Dogs! Me too!",any:-1,globalTags:{animal:'dog'}},
                    {text:"Wow! Rabbits! Me too!",any:-1,globalTags:{animal:'rabbit'}},
                    {text:"Wow! Rats! Me too!",any:-1,globalTags:{animal:'rat'}},
                    {text:"Wow! Horses! Me too!",any:-1,globalTags:{animal:'horse'}},
                    {text:"That's legit! More for me to cuddle myself, then!",any:-1,globalTags:{animal:'none'}},
                    ];
            case 2:
            let other;
            if ('wantsCareer' in speaker.convoTags) {
                other=speaker.convoTags.wantsCareer;
            }
            else {
                let otheropts=["chef","web developer","game developer","painter","artist","dancer","musician","doctor","vet","nurse","lawyer","paralegal"];
                other=ROT.RNG.getItem(otheropts);
            }
            return [{text:"Being a dungeon monster is fun but I'd love to be a "+other+" someday.",any:-1,tags:{wantsCareer:other}}];
            default:
            option-=fancyOptions;
            var newConvo=[];
            for (let i=0;i<possibilities[option].length;i++) {
                var next = {text:possibilities[option][i]};
                if (i<(possibilities[option].length-1)) {
                    next.any=(i+1);
                }
                else {
                    next.any=-1;
                }
                newConvo.push(next);
            }
            //console.log(newConvo);
            return newConvo;
        }
    },

    meetingPlayer: function(speaker) {
        let option = Math.floor(ROT.RNG.getUniform() * 6);
        let parts=speaker.name.split(' ');
        let firstName=parts[0];
        let name=speaker.name;

        switch(option) {
            default:
            case 0:
            return [{text:"Hey! Don't think we've met. My name is "+firstName+". "+name+"!",any:-1}];
            case 1:
            return [{text:"Ahoy, I'm "+name+"! How do you do?",any:-1}];
            case 2:
            return [{text:"Hi! I'm "+firstName+"! It's always nice to see a new face :)",any:-1}];
            case 3:
            return [{text:"It's me! "+name+"!",any:-1}];
            case 4:
            return [{text:"Good morning and welcome to the dungeon! I'm "+name+", but you can just call me "+firstName+".",any:-1}];
            case 5:
            return [{text:"Hey there! My name is "+name+". It's nice to meet you!",any:-1}];
        }
    },

    loveMyFriend: function(friend) {
        let phrases=[friend+" and I go way back! We started working here around the same time, too.","Nothing beats just sitting back and defending some treasure with my pal, "+friend+"!","My friend, "+friend+", has such a good sense of humor."];
        return [{text:ROT.RNG.getItem(phrases),any:-1}];
    },

    noDamage: function(speaker) {
        let openPhrases=["Dang, didn't even get one hit in today!","That adventurer was pretty good!","Haha I was just hanging out vaping and this adventurer came from nowhere.","Wowzers I got walloped today."];
        let closePhrases=["Sometimes you have a rough day, but it's alright! Tomorrow will friggin rule!","You get knocked down, but you just have to get back up again!","Rough days happen but I still love working here!","Next time the adventurer won't be so lucky!"];
        //let option = Math.floor(8*ROT.RNG.getUniform());
        var conversation=[{text:ROT.RNG.getItem(openPhrases),any:1},
            {text:ROT.RNG.getItem(closePhrases),any:-1}
            ];
        if (ROT.RNG.getUniform()>0.5 && !('depression' in Game.convoTags)) {
            conversation[1].any=2;
            conversation.push({text:"Do you ever have rough days?",y:3,n:6});
            conversation.push({text:"That's real. Me too, friend.",any:4,globalTags:{yendorPoints:20,depression:true},tags:{depression:true}});
            conversation.push({text:"Listen, if you ever need someone to talk to, or like... vape with?",any:5});
            conversation.push({text:"I'm right here with ya.",any:-1});
            conversation.push({text:"I'm really glad to hear that, friend!",any:7,globalTags:{depression:false}});
            conversation.push({text:"You're a cool person and you do a heck of a lot. You deserve to be happy!",any:-1});
        }
        return conversation;
    },

    lottaDamage: function(speaker) {
        let openPhrases=["Haha! I walloped that adventurer!","That adventurer didn't see me coming :)","We really beat that adventurer up!","Most of that 'blood' out there wasn't from monsters, I'll tell you that much :D","That adventurer got WRECKED.","You should've seen the look on the adventurer's face when they met me!"];
        let closePhrases=["They made it through, but they had to work extra hard to get by me!","Days like today remind me why I love this job!","These teeth and claws aren't just for show, you know!","You look pretty tough yourself; I bet you'd wipe the floor with them if you joined us someday!","I reckon you'd kick some butt too if you were there :)"];
        if (speaker.friends.length>0) {
            let friend = ROT.RNG.getItem(speaker.friends);
            closePhrases.push("I think my favourite part was teaming up on them with my good pal "+friend+"!");
            closePhrases.push(friend+" threw some dang good punches too!");
            closePhrases.push(friend+" and I make a really good team! We all do, honestly! You included!!");
            openPhrases.push("Dang, me and "+friend+" gave that adventurer a rough time!");
        }
        if ('ranged' in speaker.tags) {
            if (speaker.tags.rangeMess == 'Scorch') {
                openPhrases.push("I burned that adventurer something fierce!");
                openPhrases.push("That adventurer was looking pretty crispy by the time I was through with them!");
                openPhrases.push("Gosh darn I just LOVE toasting adventurers.");
                openPhrases.push("Fire's good. Fire from me is even better :)");
            }
            else if (speaker.tags.rangeMess == 'AcidPool') {
                openPhrases.push("That adventurer was pretty drenched in acid when I was through with them.");
                openPhrases.push("I love melting adventurers with acid!");
            }
        }
        let option = Math.floor(10*ROT.RNG.getUniform());
        switch (option) {
            default:
            return [{text:ROT.RNG.getItem(openPhrases),any:1},
                    {text:ROT.RNG.getItem(closePhrases),any:-1}
                    ];
            case 8:
            return [{action:"flexes and kisses their muscles.",any:1},
                {text:ROT.RNG.getItem(openPhrases),any:-1}
                ];
            case 9:
            return [
                {text:"You ever think about joining us sometime during the main event?",y:1,n:2},
                {text:"Yes! I love it. A hard worker like you, you would wreck any adventurer lucky enough to meet you!",any:-1},
                {text:"Fair enough! Definitely not for everyone. Still though, I hope you get to see the recordings; it's quite a spectacle :)",any:-1},
            ]
        }
    },

    impressed: function() {
        return [{text:"Dang! I'm impressed! You cleaned a lot!",any:-1,conditions:{cleanliness:50}}];
    },

    cleanConvo: function(mess) {
        let owner = mess.droppedBy;
        let item=false;
        let messname=mess.name.toLowerCase();
        let messnamePlural=mess.plural().toLowerCase();
        if (mess.cleanMethod == 'get') {
            if (owner.dropMessConvo) {
                return;
            }
            else {
                item=true;
                owner.dropMessConvo=true;
            }
        }
        if ((mess.cleanMethod == 'mop')) {
            if (owner.rangeMessConvo) {
                return;
            }
            else {
                owner.rangeMessConvo=true;
            }
        }

        let startMessages;
        let endMessages;
        if (item) {
            startMessages=[
                "Oh, thanks for picking up my "+messname+"!",
                "Oops! I knew I forgot something. That "+messname+" was mine...",
                "Oh dang sorry about the "+messname+".",
                "Oof, forgot to clean up after myself. Thanks for picking up my "+messname+"!",
            ];
            endMessages=[
                "I know, I know... leaving "+messnamePlural+" lying around on the job. I'll do better tomorrow!",
            ];
        }
        else {
            startMessages=[
                "Oh yeah those "+messnamePlural+" were me. Whoops.",
                "Yeah my aim was a bit off on that one. Thanks for mopping up the "+messnamePlural+".",
                "Aaahh I got a little carried away! Thanks for cleaning the "+messnamePlural+"!",
                "Those "+messnamePlural+" were my fault! Sorry about that.",
            ];
            endMessages=[
                "The adventurer sure felt it, though :) Worth it?",
            ];
        }
        endMessages.push("I really appreciate you and the work you do!");
        endMessages.push("You're really fantastic, you know that?");
        endMessages.push("I hope you know that everybody here loves you, and loves your work.");

        var newConvo= [{text:ROT.RNG.getItem(startMessages),any:1},{text:ROT.RNG.getItem(endMessages),any:-1,globalTags:{yendorPoints:2}}];
        owner.convos.push(newConvo);
    },

    coffeeConvo: function(tags) {
        var newConvo;
        newConvo = [
            {text:"Hey! I'm running to the cafe. Want anything?","I'd love a coffee!":1,"How about some tea?":2,"Can I have a donut?":3,"No thanks":4},
            {text:"Wicked! I'll bring you some coffee when I've got it!",any:-1,tags:{food:'coffee'}},
            {text:"Sweet! I'll bring you some tea when I've got it!",any:-1,tags:{food:'tea'}},
            {text:"Awesome! I'll bring you back a donut when I've got it!",any:-1,tags:{food:'donut'}},
            {text:"Okie doke!",any:-1},
        ];
        return newConvo;
    },

    deliverConvo: function(tags) {
        let food;
        if ('food' in tags && tags.food != false) {
            food = tags.food;
        }
        else {
            return null;
        }
        var newConvo;
        newConvo = [
            {text:"Here's the "+food+" you asked for!",any:1},
            {text:"I really hope you enjoy it :)",any:-1},
        ];
        tags.food=false;
        return newConvo;
    },

    invitationConvo: function(tags) {
        var newConvo;
        newConvo = [
            {text:"Hey! You've done so much cleaning, holy cow!",any:1},
            {text:"Listen, a bunch of us like to get together for dinner after work. Wanna come tonight?",y:2,n:4},
            {text:"Radical! We'll leave together when you're ready to call it a day!",any:3,globalTags:{invitationAccepted:true,yendorPoints:10}},
            {text:"Remember, it doesn't need to be spotless! Your health and happiness are way more important than work; call it a day on your own terms!",any:-1},
            {text:"That's alright :) We go out every day, so you're welcome during any of them!",any:3},
        ];
        return newConvo;
    },

    victoryPrompt: function() {
        var nextConvo=[];
        var victoryScene = [
            "When you arrive at work, everyone greets you enthusiastically!",
            "You've been here for a couple of weeks, and have already made a fantastic impression!",
            "Everyone has banded together, and given you the best gift a dungeon janitor can ask for:",
            "You have been gifted the legendary %c{#ff0}Mop of Yendor%c{}!",
            "It's mystic energies flow through your hands. You feel like your cleaning abilities have become supercharged. No mess will stand in your way again!",
            "%c{#ff0}You have won the hearts of your comrades and, by extension, this game. Thank you for playing!%c{}"
        ];
        for (let i = 0; i < victoryScene.length; i++) {
            var nextMsg = { message: victoryScene[i], any: (nextConvo.length + 1) };
            if (i == (victoryScene.length - 1)) {
                nextMsg.globalTags = { victory: true };
                nextMsg.any = -1;
            }
            nextConvo.push(nextMsg);
        }
        return nextConvo;
    },

    exitPrompt: function() {
        var nextConvo=[];
        let messages;
        if ('invitationAccepted' in Game.convoTags && Game.convoTags.invitationAccepted) {
            messages=[
                "Leave for the day and head out with everyone to dinner?",
                "You and your comrades leave together for dinner.",
                "It's really delightful!",
                "Eventually, the night comes to and end though.",
                "You go home, and get a nice, full 8 hours of sleep"
                ];
        }
        else {
            messages=[
                "Leave for the day and go home?",
                "You leave for the day, and head home.",
                "You have a really relaxing evening at home! You read a book and play some video games.",
                "Eventually, it's time to sleep. You go to bed and have a nice, full 8 hours of sleep."
            ];
        }
        if ('animal' in Game.convoTags && Game.convoTags.animal != 'none') {
            messages.push("You have a really happy dream about "+Game.convoTags.animal+"s!");
        }
        messages.push("In the morning, you wake up, and have a delicious breakfast.");
        messages.push("Time for another day of work!");
        for (let i=0;i<messages.length;i++) {
            var nextMsg = {message:messages[i]};
            if (i==0) {
                nextMsg.y=1;
                nextMsg.n=-1;
            }
            else {
                nextMsg.any=(i+1);
                if (i>1) {
                    nextMsg.blackScreenMessage=true;
                }
            }
            if (i==(messages.length-1)) {
                nextMsg.globalTags={nextDay:true,invitationAccepted:false};
                nextMsg.any=-1;
                //if (Game.yendorPoints+Game.cleanPercent() > Game.targetPoints && !Game.victory) {
                //    nextMsg.any=(i+1);
                //}
            }

            nextConvo.push(nextMsg);
        }
        
        return nextConvo;
    },

}