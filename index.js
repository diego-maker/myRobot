
const robots ={
    input: require('./robots/inputUser'),
    text: require('./robots/text'),
    state: require('./robots/loadArq')
}   
async function start(){
    robots.input()
    await robots.text()
    
    const content = robots.state.carregar()
    console.dir(content,{depth:null})
}

start();