const fs = require('fs');
const conteudoText = './content.json'


function salvar(content){
    const stringConteudo = JSON.stringify(content)
    return fs.writeFileSync(conteudoText, stringConteudo)
}

function carregar(){
    const file = fs.readFileSync(conteudoText, 'utf-8')
    const contenJson = JSON.parse(file)
    return contenJson
}


module.exports ={
    salvar,
    carregar
}