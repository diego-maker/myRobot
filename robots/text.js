const algorithmia = require('algorithmia');
const apiKeyAlgorithmia = require('../credendial.json').apiKey
const sentencaSbd = require('sbd')

async function robot(content) {
    await encontrarContentWikipedia(content)
    limparContent(content)
    quebrarContent(content)
    async function encontrarContentWikipedia(content) {
        const algorithmiaAuth = algorithmia(apiKeyAlgorithmia);
        const algorithmiaWikipedia = algorithmiaAuth.algo('web/WikipediaParser/0.1.2')
        const algorithmiaResponde = await algorithmiaWikipedia.pipe(content.termoDeBusca)
        const wikipediaContent = algorithmiaResponde.get()

        content.sourceOriginal = wikipediaContent.content
    }

    function limparContent(content) {
        const limparLinhasEmarkDown = removerLinhasEmarkDown(content.sourceOriginal)
        const limparDatas = removeDatas(limparLinhasEmarkDown)
        
        content.sourceLimpa = limparDatas

        function removerLinhasEmarkDown(text) {
                const todasLinhas = text.split('\n');
               
                const limparLinhasEmarkDown = todasLinhas.filter((linha)=>{
                    if(linha.trim().length === 0 || linha.trim().startsWith('=')){
                        return false
                    }
                    return true
                })
                return limparLinhasEmarkDown.join(' ')
        }
    }
    function removeDatas(text){
     return  text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }

  async  function quebrarContent(content){  
     content.sentences = [] 
    const sentences =  await sentencaSbd.sentences(content.sourceLimpa)
        
        sentences.forEach((sentence)=>{
            content.sentences.push({
                text:sentence,
                keyWords: [],
                images: []
            })
        })
      
    }
}

module.exports = robot