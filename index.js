const readline = require('readline-sync');
const robots ={
    text: require('./robots/text')
}
async function start(){
    const content ={}

    content.termoDeBusca = retorneOtermo()
    content.prefixo = retorneOprefixo();
    
    await robots.text(content)

    function retorneOtermo(){
        return readline.question('fale um termo de pesquisa: ')
    }
    function retorneOprefixo(){
        const prefixos = ['O que e', 'Quem e', 'A historia']
        const selecionarPrefixo = readline.keyInSelect(prefixos, 'Escolha um indice de pesquisa:')
        const selecionarTexto = prefixos[selecionarPrefixo]
        return selecionarTexto
    }
    console.log(content)
}

start();