 canvas = 0;
 ctx = 0;
 interval = 0;
 agent=null;
 chart=null;
 yummySound = null;

 createdFlag=false;



 class GameEnv{
    constructor(ctx){
        this.ctx = ctx;
        this.cellSize = 50;
        this.gridSize = 10;
        this.state = 0;
        this.imageCheese = new Image();
        this.imageCheese.src = './cheese.png';


    }

    createMaze() {
        let maze = new Array(this.gridSize);
        for (let i = 0; i < this.gridSize; i++) {
            maze[i] = new Array(this.gridSize);
            for (let j = 0; j < this.gridSize; j++) {
                maze[i][j] = {
                    top: true,
                    right: true,
                    bottom: true,
                    left: true,
                    visited: false,
                };
            }
        }
    
        let stack = [];
        let current = { x: 0, y: 0 };
        maze[current.y][current.x].visited = true;
        stack.push(current);
    
        while (stack.length > 0) {
            let unvisitedNeighbors = [];
            let { x, y } = current;
    
            // Check all four neighbors
            if (y > 0 && !maze[y - 1][x].visited) unvisitedNeighbors.push({ x, y: y - 1 });
            if (y < this.gridSize - 1 && !maze[y + 1][x].visited) unvisitedNeighbors.push({ x, y: y + 1 });
            if (x > 0 && !maze[y][x - 1].visited) unvisitedNeighbors.push({ x: x - 1, y });
            if (x < this.gridSize - 1 && !maze[y][x + 1].visited) unvisitedNeighbors.push({ x: x + 1, y });
    
            if (unvisitedNeighbors.length > 0) {
                let randIndex = Math.floor(Math.random() * unvisitedNeighbors.length);
                let next = unvisitedNeighbors[randIndex];
    
                // Remove the wall between the current cell and the chosen cell
                if (next.y < current.y) {
                    maze[current.y][current.x].top = false;
                    maze[next.y][next.x].bottom = false;
                } else if (next.y > current.y) {
                    maze[current.y][current.x].bottom = false;
                    maze[next.y][next.x].top = false;
                } else if (next.x < current.x) {
                    maze[current.y][current.x].left = false;
                    maze[next.y][next.x].right = false;
                } else if (next.x > current.x) {
                    maze[current.y][current.x].right = false;
                    maze[next.y][next.x].left = false;
                }
    
                maze[next.y][next.x].visited = true;
                stack.push(current);
                current = next;
            } else {
                current = stack.pop();
            }
        }
    
        this.maze = maze;
        return maze;
    }
    drawMaze() {
        this.ctx.clearRect(0, 0, canvas.width,canvas.height);
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                let cell = this.maze[i][j];
                let x = j * this.cellSize;
                let y = i * this.cellSize;
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 4;
                if (cell.top) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(x + this.cellSize, y);
                    this.ctx.stroke();
                }
                if (cell.right) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + this.cellSize, y);
                    this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
                    this.ctx.stroke();
                }
                if (cell.bottom) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y + this.cellSize);
                    this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
                    this.ctx.stroke();
                }
                if (cell.left) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(x, y + this.cellSize);
                    this.ctx.stroke();
                }
            }
        }
    
        // Draw start point
        this.ctx.fillStyle = '#00FF0077';
        this.ctx.fillRect(0, 0, this.cellSize, this.cellSize);
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.fillText("Start", 2, 30);
    
        // Draw end point
        this.ctx.fillStyle = '#fbf8a475';
        this.ctx.fillRect((this.gridSize - 1) * this.cellSize, (this.gridSize - 1) * this.cellSize, this.cellSize, this.cellSize);

        this.imageCheese.onload = () => {
            ctx.drawImage(this.imageCheese, (this.gridSize - 1) * this.cellSize, (this.gridSize - 1) * this.cellSize, this.cellSize, this.cellSize);
        };
        ctx.drawImage(this.imageCheese, (this.gridSize - 1) * this.cellSize, (this.gridSize - 1) * this.cellSize, this.cellSize, this.cellSize);


    }


}

class Player{
    constructor(x, y,maze){
        this.x = x;
        this.y = y;
        this.cellSize = 50;
        this.maze=maze;   
        this.mouseImage = new Image();
        this.mouseImage.src = './player.png';    
    }

    draw(){
        // ctx.fillStyle = 'blue';
        // ctx.fillRect(this.x*this.cellSize, this.y*this.cellSize, this.cellSize, this.cellSize);

   
        this.mouseImage.onload = () => {
            ctx.drawImage(this.mouseImage, this.x*this.cellSize, this.y*this.cellSize, this.cellSize, this.cellSize);
        };
        ctx.drawImage(this.mouseImage, this.x*this.cellSize, this.y*this.cellSize, this.cellSize, this.cellSize);

    }

    move(direction) {
        let newX = this.x;
        let newY = this.y;

        if (direction === 'up') {
            newY--;
        } else if (direction === 'down') {
            newY++;
        } else if (direction === 'left') {
            newX--;
        } else if (direction === 'right') {
            newX++;
        }

        // Check for out of bounds
        if (newX < 0 || newX >= this.maze[0].length || newY < 0 || newY >= this.maze.length) {
            return;
        }

        // Check for collisions
        //console.log(this.maze,newX,newY,this.maze[newY][newX])
        let newCell = this.maze[newY][newX];
        if ((direction === 'up' && newCell.bottom) ||
            (direction === 'down' && newCell.top) ||
            (direction === 'left' && newCell.right) ||
            (direction === 'right' && newCell.left)) {
            // There's a wall, don't move
            return;
        }

        // No collision, move the player
        this.x = newX;
        this.y = newY;
    }


    reset(){
        this.x = 0;
        this.y = 0;
    
    }


 

}

class Agent{
    constructor(player,alpha, gamma, epsilon,isDecreas){
        this.player = player;
        this.alpha = alpha;
        this.gamma = gamma;
        this.epsilon = epsilon;
        this.state={x:0,y:0};
        this.goal={x:9,y:9};
        this.gridSize = 10;
        this.steps = 0;
        this.numActions = 4;
        this.episode = 0;
        this.bestEpisode=Infinity;
        this.history = [];
        this.isDecreas=isDecreas;

    }

    stateToQIndex(state) {
        // Convert a state (x, y) to an index in the Q-table
        return state.y * this.gridSize + state.x;
    }
    initQtable(){
        let Q = [];
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            Q[i] = [0, 0, 0, 0];  // up, down, left, right
        }
        
        this.Qtable = Q;
    }
    learn(reward, oldState, newState, action) {
       //console.log( oldState, newState)
        // Q-learning update
        newState = this.stateToQIndex(newState);
        oldState = this.stateToQIndex(oldState);
        //console.log( oldState, newState,action)
        const oldQ = this.Qtable[oldState][action];
        const maxFutureQ = Math.max(...this.Qtable[newState]);
        this.Qtable[oldState][action] = oldQ + this.alpha * (reward + this.gamma * maxFutureQ - oldQ);
    }
    chooseAction(state) {
        state = this.stateToQIndex(state);
        //console.log(state)
        // Epsilon-greedy policy
        if (Math.random() < this.epsilon) {
            // Random action
            return Math.floor(Math.random() * this.numActions);
        } else {
            // Greedy action
            return this.Qtable[state].indexOf(Math.max(...this.Qtable[state]));
        }
    }
    isValidMove(newX, newY) {
        // Check for out of bounds
        if (newX < 0 || newX >= this.gridSize || newY < 0 || newY >= this.gridSize) {
            return false;
        }

        // Check for walls
        let direction;
        if (newY < this.state.y) {
            direction = 'up';
        } else if (newY > this.state.y) {
            direction = 'down';
        } else if (newX < this.state.x) {
            direction = 'left';
        } else if (newX > this.state.x) {
            direction = 'right';
        }

        let newCell = this.player.maze[newY][newX];
        if ((direction === 'up' && newCell.bottom) ||
            (direction === 'down' && newCell.top) ||
            (direction === 'left' && newCell.right) ||
            (direction === 'right' && newCell.left)) {
            // There's a wall, don't move
            return false;
        }

        // No collision, move is valid
        return true;
    }
    step(action) {
        // Calculate new state based on the action
        let newX, newY;
        switch (action) {
            case 0: // up
                newY = Math.max(0, this.state.y - 1);
                newX = this.state.x;
                break;
            case 1: // down
                newY = Math.min(this.gridSize - 1, this.state.y + 1);
                newX = this.state.x;
                break;
            case 2: // left
                newX = Math.max(0, this.state.x - 1);
                newY = this.state.y;
                break;
            case 3: // right
                newX = Math.min(this.gridSize - 1, this.state.x + 1);
                newY = this.state.y;
                break;
        }
        let reward;

        // If the move is valid, update the agent's state
        if (this.isValidMove(newX, newY)) {
            this.state.x = newX;
            this.state.y = newY;
            this.player.x = this.state.x;
            this.player.y = this.state.y;
            reward = -1;
        }
        else{
            reward=-5;
        }
    
        // Calculate reward
        if (this.isTerminal(this.state)) {
            reward = 100; // large positive reward for reaching the goal
        } 
    
        return {newState: this.state, reward: reward};
    }

    isTerminal(state) {
        return state.x === this.goal.x && state.y === this.goal.y;
    }
    train(numEpisodes) {
        this.initQtable();

        for (let episode = 0; episode < numEpisodes; episode++) {
            this.state = {x: 0, y: 0};  // reset state to starting state
            this.steps = 0;
            while (!this.isTerminal(this.state)) {
                const oldState = {...this.state};  // copy current state
                const action = this.chooseAction(this.state);
                const {newState, reward} = this.step(action);
                this.learn(reward, oldState, newState, action);
                this.state = newState;
                this.steps++;
            }
            this.steps< this.bestEpisode ? this.bestEpisode=this.steps :
            this.episode=episode
            this.isDecreas?this.epsilon=this.epsilon*0.99:null;
            this.history.push({episode: this.episode, steps: this.steps})
            console.log(`Episode ${this.episode + 1}: agent reached the goal in ${this.steps} steps`);
            // if (episode == numEpisodes - 1) {
            //     $.notify(`Agent finish the train,\n best episode: ${this.bestEpisode} steps `,"success");
            // }
        }
        

    }

}

const init=()=>{
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;
    yummySound = document.getElementById('yummy');
    gameEnv = new GameEnv(ctx);
    const maze = gameEnv.createMaze();
    gameEnv.drawMaze();
    player = new Player(0, 0,maze);
    //agent = new Agent(player,0.1, 0.9, 0.1);
    //agent.initQtable();
    //player.draw();
    //agent.train(50000);
    //console.log(maze);
    // interval = setInterval(() => {
        
    //     const action = agent.chooseAction(agent.state);
    //     const {newState, reward} = agent.step(action);
    //     agent.learn(reward, agent.state, newState, action);
    //     agent.state = newState;
      
    //     agent.steps++;
    //     if(agent.isTerminal(agent.state)){
    //         console.log(`Episode ${agent.episode + 1}: agent reached the goal in ${agent.steps} steps`);
    //         agent.state = {x: 0, y: 0};
    //         agent.player.reset()  // reset state to starting state
    //         agent.steps = 0;
    //         agent.episode++;
    
    //     }  
    
    
    
    //     gameEnv.drawMaze();
    //     player.draw();
    // },250);


    addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp') {
            player.move('up');
        } else if (event.key === 'ArrowDown') {
            player.move('down');
        } else if (event.key === 'ArrowLeft') {
            player.move('left');
        } else if (event.key === 'ArrowRight') {
            player.move('right');
        }
    });
}

const newMaze=()=>{
    const maze = gameEnv.createMaze();
    gameEnv.drawMaze();
    player = new Player(0, 0,maze);
    agent=null;
    createdFlag=false;
    interval!=0? clearInterval(interval):null;
    document.getElementById('showGraphBtn').disabled=true;
    document.getElementById('startBtn').disabled=true;
}


const CreateAgent = ()=>{
    const alpha = parseFloat(document.getElementById('AlphaIN').value);
    const gamma = parseFloat(document.getElementById('GammaIN').value);
    const epsilon = parseFloat(document.getElementById('EpsilonIN').value);
    const numEpisodes = parseInt(document.getElementById('TrainepisodeIN').value);
    const isDecreas = document.getElementById('decreaseCreativity').checked;
    agent = new Agent(player,alpha, gamma, epsilon,isDecreas);
    interval!=0? clearInterval(interval):null;

    createdFlag=true;
    document.getElementById('showGraphBtn').disabled=false;
    document.getElementById('startBtn').disabled=false;
    agent.initQtable();
    agent.train(numEpisodes);
    player.reset();
    agent.state = {x: 0, y: 0};
    gameEnv.drawMaze();
    player.draw();

    let strToNote =`Hi I'm an RL agent and ready for action.`
    numEpisodes==0? strToNote+=` \nI've never trained, so I don't know anything about the environment.` : strToNote+=`\nI trained ${numEpisodes} times, the best result was ${agent.bestEpisode} steps`
    $("#canvas").notify(
        strToNote,
        { 
            position:"top left",
            className: 'success',
        }
    );
    
}

const showGraph=()=>{
    if (agent==null) {
        $.notify(`You need to create an agent first!`,'error')
        return;
    }
    if (chart!=null) {
        chart.destroy();
    }

    let data = agent.history;
    let labels = data.map((d) => d.episode);
    let values = data.map((d) => d.steps);
    let ctx = document.getElementById('graph').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Steps to goal',
                data: values,
                borderColor: '#9836a5',
                borderWidth: 1,
                fill: false,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'black' // change this to the color you want
                    }
                },
                x:{
                    ticks: {
                        color: 'black' // change this to the color you want
                    }
                }
            },
            animations: {
                tension: {
                  duration: 1000,
                  easing: 'linear',
                  from: 1,
                  to: 0,
                  loop: true
                }
            },
        }
    });

    $('#graphModal').show();

}

const closeGraphModal=()=>{
    $('#graphModal').hide()
}


const Start=()=>{
    //$.notify("Hello, this is a notification","success");

    if(!createdFlag){
        $.notify(`You need to create an agent first!`,'error')
        return;
    }
    $("#canvas").notify(
        `I'm ready, let's find this cheese!`,
        { 
            position:"top left",
            className: 'success',
        }
    )

    setTimeout(()=>{
        agent.steps=0;
        interval = setInterval(() => {
        const action = agent.chooseAction(agent.state);
        const {newState, reward} = agent.step(action);
        agent.learn(reward, agent.state, newState, action);
        agent.state = newState;
      
        agent.steps++;
        $('#status').html(`
        <p>Episode : ${agent.episode+1}</p>
        <p>Steps : ${agent.steps}</p>
        <p>Reward : ${reward}</p>
        <p>Epsilon : ${agent.epsilon.toFixed(8)}</p>
        `)
        if(agent.isTerminal(agent.state)){
            $('#fireworks').show();
            yummySound.volume = 1;
            yummySound.play();
            setTimeout(()=>{
                $('#fireworks').hide();
            },1500)
        
            console.log(`Episode ${agent.episode + 1}: agent reached the goal in ${agent.steps} steps`);
            agent.history.push({episode: agent.episode, steps: agent.steps})
            agent.state = {x: 0, y: 0};
            agent.player.reset()  // reset state to starting state
            agent.steps = 0;
            agent.episode++;
           agent.isDecreas?agent.epsilon=agent.epsilon*0.99:null;
    
        }  
        gameEnv.drawMaze();
        player.draw();
        },100);
    },800)

}


// const animate = () => {

//     const action = agent.chooseAction(agent.state);
//     const {newState, reward} = agent.step(action);
//     agent.learn(reward, agent.state, newState, action);
//     agent.state = newState;
//     agent.steps++;
//     if(agent.isTerminal(agent.state)){
//         console.log(`Episode ${agent.episode + 1}: agent reached the goal in ${agent.steps} steps`);
//         agent.state = {x: 0, y: 0};
//         agent.player.reset()  // reset state to starting state
//         agent.steps = 0;
//         agent.episode++;

//     }  



//     gameEnv.drawMaze();
//     player.draw();
//     requestAnimationFrame(animate);
// }
