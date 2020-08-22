
        // How many milliseconds between each collision check.
        // Set it too low, and the computer/browser won't be able to keep up.
        // Set it too high, and we may miss collisions with fast-moving balls.
        const intervalMilliseconds=100;

        // Parameters that make the icon bitmap work:
        const iconScaling=2;

        const iconSizeX=100;
        const iconSizeY=100;
        const iconSpacingX=120;
        const iconSpacingY=160;
        const iconOffsetX=16;
        const iconOffsetY=14;
        const iconHorizontalCount=19;
        const operatorNames=[
            // First row
            'Adaptive Join',
            'Assert',
            'Build Hash',
            'Bitmap',
            'Clustered Index Delete',
            'Clustered Index Insert',
            'Clustered Index Merge',
            'Clustered Index Scan',
            'Clustered Index Seek',
            'Clustered Index Update',
            'Collapse',
            'Columnstore Index Delete',
            'Columnstore Index Insert',
            'Columnstore Index Merge',
            'Columnstore Index Scan',
            'Columnstore Index Update',
            'Compute Scalar',
            'Concatenation',
            'If',

            // Second row
            'Constant Scan',
            'Cursor',
            'Deleted Scan',
            'Dynamic',
            'Fetch Query',
            'Filter',
            'Foreign Key References Check',
            'Function',
            'Hash Match',
            'Nonclustered Index Delete',
            'Index Insert',
            'Index Scan',
            'Index Seek',
            'Index Spool',
            'Nonclustered Index Update',
            'Insert',
            'Inserted Scan',
            'Key Lookup',
            'Keyset',

            // Third row
            'Merge',
            'Merge Interval',
            'Merge Join',
            'Nested Loops',
            'Parallelism (Distribute Streams)',
            'Parallelism (Gather Streams)',
            'Parallelism (Repartition Streams)',
            'Population Query',
            'Put',
            'Remote Delete',
            'Remote Index Scan',
            'Remote Index Seek',
            'Remote Insert',
            'Remote Query',
            'Remote Scan',
            'Remote Update',
            'Result',
            'RID Lookup',
            'Row Count Spool',

            // Fourth row
            'Segment',
            'Select',
            'Select Into',
            'Sequence',
            'Sequence Project',
            'Snapshot',
            'Sort',
            'Split',
            'Spool',
            'Stream Aggregate',
            'Switch',
            'Table Scan',
            'Table Spool',
            'Table-valued Function',
            'Top',
            'UDX',
            '',
            'Window Aggregate',
            'Window Spool'
        ];

        // Layout of the icon field:
        var bricksPerRow;

        // Global gameplay variables:
        const paddleWidthPercent = 7;
        var currentScore=0;
        var paddlePosition;
        var theInterval;
        var ballDirection;
        var ballSpeed;
        var temporaryImmunity;
        var notificationHidden=false;

        // Optimization variables to predict ball movement (which may allow us to
        // manage collisions in slow browsers a little more gracefully)
        var lastKnownX;
        var lastKnownY;
        var pixelsMovedX;
        var pixelsMovedY;

        // Winning and losing requires GIFs. Lots of GIFs.
        const successMemes = [
            'https://media.giphy.com/media/nqi89GMgyT3va/giphy.gif',
            'https://media.giphy.com/media/l4HodBpDmoMA5p9bG/giphy.gif',
            'https://media.giphy.com/media/3rUbeDiLFMtAOIBErf/giphy.gif',
            'https://media.giphy.com/media/10Y2YMUNmQa9a0/giphy.gif',
            'https://media.giphy.com/media/v3MDM0AQ9J7hu/giphy.gif',
            'https://media1.giphy.com/media/NBX4f7irjNSEM/giphy.gif',
            'https://media1.giphy.com/media/AgrfqPt5AyiTm/giphy.gif',
            'https://media1.giphy.com/media/S2kRBSF5JK0ZW/giphy.gif',
            'https://media.giphy.com/media/EOSnF43ZvrcLS/giphy.gif'
        ];

        const failMemes = [
            'https://media.giphy.com/media/TDMpl2VWyhFYZr9JwX/giphy.gif',
            'https://media.giphy.com/media/kGCuRgmbnO9EI/giphy.gif',
            'https://media.giphy.com/media/8gLh48w1wdFQj9Ub32/giphy.gif',
            'https://media.giphy.com/media/GDnomdqpSHlIs/giphy.gif',
            'https://media.giphy.com/media/6uGhT1O4sxpi8/giphy.gif',
            'https://media.giphy.com/media/9Y5BbDSkSTiY8/giphy.gif',
            'https://media.giphy.com/media/ipDNlR0hECGGfeuky2/giphy.gif'];





       /********************************************************
        Initialize and start the game:
        ********************************************************/

        function init() {
            // Clear the scoreboard:
            score.innerText='Score: 0.0%';
            currentScore=0;

            // Reset the visual field:
            meme.style.display='none';
            theball.style.display='inline';
            toggleTrack();
            paddle.style.width=paddleWidthPercent.toString()+'%';
            document.body.style.cursor='none';
            var ball=actualball.getBoundingClientRect();
            ballpath.style.top=(ball.width/2).toString()+'px';

            lastKnownX=null;
            lastKnownY=null;
            pixelsMovedX=ball.width/2;
            pixelsMovedY=ball.height/2;

            // The number of horizontal icons is determined by the size and scale of
            // the icons, in relation to the width of the screen.
            bricksPerRow=Math.floor(window.innerWidth*0.35*iconScaling/iconSizeX);

            // Set the gameplay variables:
            ballDirection=-65;
            ballSpeed=1;
            temporaryImmunity=false;

            // Populate the icons:
            buildAnArmada(30);

            // Start moving the icon field:
            startTheArmada();

            // Start moving the ball:
            startBall(100*event.clientX/window.innerWidth, 100*(paddle.getBoundingClientRect().y-ball.height*1.5)/window.innerHeight, ballDirection, ballSpeed);

            // Reset and restart the interval timer that will check for collisions every 100 ms.
            if (theInterval) clearInterval(theInterval);
            theInterval = setInterval(didItCollide, intervalMilliseconds);

            // If you click anywhere now, the game stops.
            document.body.onclick=holdit;
        }


       /********************************************************
        Stop everything:
        ********************************************************/

        function holdit() {
            theball.style.display='none';
            document.body.style.cursor='default';
            armada.style.animation = 'none';
            actualball.style.animationName='none';
            if (theInterval) clearInterval(theInterval);

            // Next time you click, the game starts fresh.
            document.body.onclick=init;
        }

       /********************************************************
        Build the icon field with a random set of icons:
        ********************************************************/

        function buildAnArmada(brickCount) {

            var totalCost=0;
            var brickCost=[];
            var goal=400;

            // Determine the "cost" (number of points) for each icon in advance, so
            // we can even out the scores so they always generate the same total:
            for (var n=0; n<brickCount; n++) {
                var cost=Math.pow(0.5*(brickCount-0.5*n)*Math.random()/brickCount, 10);
                brickCost.push(cost);
                totalCost+=cost;
            }

            // Normalize all values, so they add up to (goal)%.
            for (var n=0; n<brickCount; n++) {
                brickCost[n]=goal*brickCost[n]/totalCost;
            }

            // If any icon has more than 100%, trim that icon down to 100%, move the remainder to
            // the next available icon that has less than 10%.
            var remainder=0;
            for (var n=0; n<brickCount; n++) {

                // Decrease cost; Add to remainder:
                if (brickCost[n]>100) {
                    remainder+=(brickCost[n]-100);
                    brickCost[n]=100;

                    var found=false;
                    while (!found) {
                        var other = parseInt((brickCount-n)*Math.random());
                        if (brickCost[other]<10) {
                            // Off-load remainder; increase cost:
                            var amount=(brickCost[other]+remainder > 50 ? 50-brickCost[other] : remainder);
                            brickCost[other]+=amount;
                            remainder-=amount;
                            if (remainder==0) {
                                found=true;
                            }
                        }
                    }


                }
            }

            // Clear the board:
            armada.innerHTML='';

            // Add each icon:
            for (var n=0; n<brickCount; n++) {

                // Create the DIV where the icon lives:
                var brick = document.createElement('div');
                brick.className='brick';
                brick.style.left=(2+(75/bricksPerRow)*(n%bricksPerRow)).toString()+'%';
                brick.style.top=(20+80*(n-n%bricksPerRow)/bricksPerRow).toString()+'px';

                // Create the DIV where the score lives:
                var cost=document.createElement('div');
                cost.className='cost';
                var costPercent=brickCost[n];
                cost.innerText=costPercent.toFixed(1).toString()+'%';
                if (chkToggleNames.checked) { cost.style.display='none'; }

                // Color the score appropriately:
                if (costPercent>=10) {
                    cost.style.backgroundColor=["hsl(", ((100 - costPercent) * 1.2).toString(10), ",100%,50%)"].join("");
                    if (costPercent>=75) { cost.style.color='#ffffff'; }
                }
                brick.appendChild(cost);
                brick.setAttribute("_cost", costPercent);

                // Random selection of icon:
                var r=Math.floor(75.99*Math.random());
                var img=planIcon(r);

                // Apply the image to the DIV, and the DIV to the playing field:
                brick.appendChild(img);

                // Create the name element
                opName = document.createElement('div');
                opName.className='operator-name';
                opName.innerText=operatorNames[r];
                if (chkToggleNames.checked) { opName.style.display='block'; }
                brick.appendChild(opName);

                armada.appendChild(brick);
            }
        }


       /********************************************************
        The rewards for your hard work:
        ********************************************************/

        function showMeme(good) {

            // Show celebration meme or fail meme? Choose a suitable GIF.
            var choice=(good ? successMemes : failMemes);
            var whatWeWant=parseInt(Math.floor((choice.length-.1)*Math.random()))
            var gif = choice[whatWeWant];

            // Render it:
            meme.innerHTML='';
            img = document.createElement('img');
            img.className='meme';
            img.style.width='80%';
            img.src=gif;
            meme.appendChild(img);
            meme.style.display='inline';
        }

       /********************************************************
        Set or change the trajectory of the ball:
        ********************************************************/

        function startBall(left, top, angle, speed) {

            // 0 degrees is to the right, 90 down, 180 to the left, 270 degrees is up.
            ballDirection=(360+angle)%360;

            // This is a CSS hoop we need to jump through in order to stop and restart an animation.
            actualball.style.animationName='none';
            void actualball.offsetWidth;

            // Origin point of the ball:
            theball.style.left=left.toString()+'%';
            theball.style.top=top.toString()+'%';

            // Direction of the ball:
            theball.style.transform='rotate('+angle.toString()+'deg)';

            // Get the ball moving:
            actualball.style.animation='ball-movement '+(10/speed).toString()+'s forwards running';
            actualball.style.animationTimingFunction='linear';
        }

       /********************************************************
        When the mouse moves on the X axis, the paddle follows:
        ********************************************************/

        document.addEventListener('mousemove', e => {
            if (!notificationHidden) {
                notification.remove();
                notificationHidden=true;
            }

            paddlePosition = 100*e.clientX/window.innerWidth;

            // Don't let the paddle leave the playing field.
            if (paddlePosition<paddleWidthPercent/2) { paddlePosition=paddleWidthPercent/2; }
            if (paddlePosition>100-paddleWidthPercent/2) { paddlePosition=100-paddleWidthPercent/2; }

            // Update the paddle's styling by updating the CSS variable:
            paddle.style.setProperty('--mouse-x', 0.01*(paddlePosition-paddleWidthPercent/2));
        });

      /********************************************************
        Start the back-and-forth movement of the icon field:
        ********************************************************/

        function startTheArmada() {
            // The first animation is the back-and-forth one, which cycles every 4 seconds.
            // The second animation runs only once and "unfolds" the playing field.
            armada.style.animation = 'armada-movement 4s infinite, unfold-armada 200ms forwards';
            armada.style.animationTimingFunction='linear';
            armada.style.animationDirection='alternate';
        }

       /********************************************************
        Just for fun: show the operator name instead of the score?
        ********************************************************/

        function toggleNames() {
            var checked=event.srcElement.checked;

            armada.childNodes.forEach(function(brick) {
                brick.childNodes.forEach(function(element) {
                    if (element.className=='cost') {
                        element.style.display=(checked ? 'none' : 'block');
                    }
                    if (element.className=='operator-name') {
                        element.style.display=(!checked ? 'none' : 'block');
                    }
                });
            });
        }

       /********************************************************
        Just for fun: show the trajectory of the ball.
        ********************************************************/

        function toggleTrack() {
            if (chkToggleTrack.checked) {
                ballpath.style.display='inline';
            } else {
                ballpath.style.display='none';
            }
        }

        /********************************************************
        This function checks if the ball has collided with anything:
        ********************************************************/

        function didItCollide() {

            // If we _JUST_ bounced it off a brick, we'll wait one more cycle until we check again.
            // This is to allow the ball to clear the brick before continuing.
            if (temporaryImmunity) {
                temporaryImmunity=false;
                return;
            }

            var ball = actualball.getBoundingClientRect();
            temporaryImmunity=false;            

            // Keeping track of the movement of the ball allows us to interpolate where it well be in
            // the next intervall, so we can catch it before it "skips" an object (if the ball is moving
            // fast and the computer can't keep up.)
            pixelsMovedX=(lastKnownX == null ? ball.width/2 : ball.x+ball.width/2-lastKnownX);
            pixelsMovedY=(lastKnownY == null ? -ball.height/2 : ball.y+ball.height/2-lastKnownY);
            lastKnownX=ball.x+ball.width/2;
            lastKnownY=ball.y+ball.height/2;
/*
            // "Stretch" the BoundingClientRect() object, so it expands in the direction of travel.
            if (pixelsMovedX<0) { ball.left+=pixelsMovedX/2; ball.right-=pixelsMovedX/2;  }
            else                { ball.right+=pixelsMovedX/2; }

            if (pixelsMovedY<0) { ball.top+=pixelsMovedY/2; ball.bottom-=pixelsMovedY/2; }
            else                { ball.bottom+=pixelsMovedY/2; }
*/
            // Bouncing on the left wall:
            if ((ballDirection>90 && ballDirection<270) && ball.x<0) {
                startBall(100*(ball.x+0.5*ball.width)/window.innerWidth, 100*ball.y/window.innerHeight, 180-ballDirection, ballSpeed);
                return;
            }

            // Bouncing on the right wall:
            if ((ballDirection<90 || ballDirection>270) && ball.x+ball.width>=window.innerWidth) {
                startBall(100*(ball.x-0.5*ball.width)/window.innerWidth, 100*ball.y/window.innerHeight, 180-ballDirection, ballSpeed);
                return;
            }

            // Bouncing on the top wall:
            if (ballDirection>=180 && ball.y<=0) {
                var angle=(ballDirection<0 ? -ballDirection : 360-ballDirection);
                startBall(100*ball.x/window.innerWidth, 100*ball.y/window.innerHeight, angle, ballSpeed);
                return;
            }

            // Maybe we hit the paddle?
            target=paddle.getBoundingClientRect();
            var paddleCollision=collides(ball,
                    // This little construct "deepens" the paddle, so we don't miss fast-moving balls.
                    {"top": target.top, "left": target.left, "right": target.right, "bottom": window.innerHeight*2 }
                );
            if (ballDirection<=180 && paddleCollision.collision) {
                var offset=2*(ball.x+ball.width/2-target.x)/target.width;

                // The outward angle depends on where on the paddle the ball hit:
                var angle=-180+90*offset;
                if (angle<-170) { angle=-170; }
                if (angle>-10) { angle=-10; }

                // Every time the ball touches the paddle, the speed increases (to a point).
                ballSpeed=(ballSpeed<3 ? ballSpeed*1.1 : ballSpeed);

                // Restart the ball from a new origin and trajectory:
                startBall(100*ball.x/window.innerWidth, 100*ball.y/window.innerHeight, angle, ballSpeed);
                return;
            };

            // Check if we've overrun the bottom of the screen:
            if (ball.y+ball.height > window.innerHeight) {
                holdit();
                showMeme(false);
                return;
            }

            // Check each of the bricks if we hit anything:
            for (var n=0; n<armada.childNodes.length && n!=-1; n++) {
                target = armada.childNodes[n].getBoundingClientRect();
                var brickCollision=collides(ball, target);
                if (brickCollision.collision) {

                    var cost = parseFloat(armada.childNodes[n].getAttribute("_cost"));

                    killBrick(armada.childNodes[n]);
                    //armada.childNodes[n].remove();
                    var angle;
                    if (brickCollision.fromSide) {
                        angle=180-ballDirection;
                    } else {
                        angle=(ballDirection<0 ? -ballDirection : 360-ballDirection);
                    }
                    startBall(100*ball.x/window.innerWidth, 100*ball.y/window.innerHeight, angle, ballSpeed);
                    n=-1;
                    temporaryImmunity=true;

                    currentScore+=cost;
                    score.innerText='Score: '+currentScore.toFixed(1).toString()+'%';

                    score.style.animationName='none';
                    void score.offsetWidth;
                    score.style.animation='flash-score 1000ms forwards running';

                    if (armada.childNodes.length==0) {
                        // Stop everything.
                        holdit();
                        // Great Success.
                        showMeme(true);
                    }
                    return;
                }
            }
        }

       /********************************************************
        Compare the bounding rectangles of two objects, return
        true if they overlap:
        ********************************************************/

        function killBrick(div) {
            var pos=div.getBoundingClientRect();

            var puff = document.createElement('div');
            puff.className='puff';
            puff.style.left=(pos.x-pos.width/2).toString()+'px';
            puff.style.top =(pos.y+pos.height/2).toString()+'px';
            document.body.appendChild(puff);

            // Animate the "puff", then deleted it asynchronously when it's done.
            puff.style.animation='puff-movement 1000ms forwards running';
            setTimeout(function() { puff.remove(); }, 1000);

            // Remove the brick:
            div.remove();
        }

       /********************************************************
        Compare the bounding rectangles of two objects, return
        true if they overlap:
        ********************************************************/

        function collides(a, b) {
            if (a.right>b.left && a.left<b.right &&
                    a.bottom>b.top && a.top<b.bottom) {

                var fromSide=false;

                var tolerance=20;

                // Pass 1: initially, the bounce direction (whether it's a side-bounce or a top/bottom bounce)
                //         is determined by the inbound angle of the ball.
                switch (parseInt((ballDirection+45)/90)%4) {
                    case 0:
                    case 2:
                        fromSide=true;
                        break;
                    case 1:
                    case 3:
                        fromSide=false;
                        break;
                }

                // Pass 2: if we're clearly colliding with the side or the top/bottom, disregard the angle:
                if ((a.top+a.bottom)/2>b.top-tolerance && (a.top+a.bottom)/2<b.bottom+tolerance &&
                    (b.top+b.bottom)/2>a.top-tolerance && (b.top+b.bottom)/2<a.bottom+tolerance) { fromSide=true; }

                if ((a.left+a.right)/2>b.left-tolerance && (a.left+a.right)/2<b.right+tolerance &&
                    (b.left+b.right)/2>a.left-tolerance && (b.left+b.right)/2<a.right+tolerance) { fromSide=false; }

                return({ collision: true,
                         fromSide:  fromSide })

            } else {
                return({ collision: false,
                         fromSide:  false });
            };
        }

       /********************************************************
        Return an IMG object with an icon:
        ********************************************************/

        function planIcon(n) {

            x=n%iconHorizontalCount;
            y=(n-n%iconHorizontalCount)/iconHorizontalCount;

            img = document.createElement('img');
            img.className='planicon';
            img.style.width=(iconSizeX/iconScaling)+'px';
            img.style.height=(iconSizeY/iconScaling)+'px';
            img.src='nothing.gif';
            img.style.background='url(\''+bitmap.src+'\') -'+((iconOffsetX+x*iconSpacingX)/iconScaling).toString()+'px -'+((iconOffsetY+y*iconSpacingY)/iconScaling).toString()+'px';
            img.style.backgroundSize=(bitmap.width/iconScaling).toString()+'px '+(bitmap.height/iconScaling).toString()+'px';

            return(img);
        }
