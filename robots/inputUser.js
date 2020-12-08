const readline = require('readline-sync');
const state = require('./loadArq')
function robot() {
    const content = {
        maximoDeSentencas: 7
    }

    content.termoDeBusca = retorneOtermo()
    content.prefixo = retorneOprefixo();
    state.salvar(content)
    
    function retorneOtermo() {
        return readline.question('fale um termo de pesquisa: ')
    }
    function retorneOprefixo() {
        const prefixos = ['O que e', 'Quem e', 'A historia']
        const selecionarPrefixo = readline.keyInSelect(prefixos, 'Escolha um indice de pesquisa:')
        const selecionarTexto = prefixos[selecionarPrefixo]
        return selecionarTexto
    }
}


module.exports = robot