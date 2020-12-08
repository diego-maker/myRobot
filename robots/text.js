const algorithmia = require('algorithmia');
const apiKeyAlgorithmia = require('../credendial.json').apiKey
const sentencaSbd = require('sbd')
const apiWatson  = require('../cedentialWatson.json').apikey

const naturalLanguage = require('watson-developer-cloud/natural-language-understanding/v1') 

let nlu = new naturalLanguage({
    iam_apikey: apiWatson,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'

})

 const state = require('./loadArq')
async function robot() {
  const content = state.carregar();
  
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    quebrarEmSentencas(content)
    limitarSentencas(content)
    await buscarKeyDeTodasAsSentencas(content)
  
    state.salvar(content)
  
    async function fetchContentFromWikipedia(content) {
      console.log('> [text-robot] Proucurando conteudo no Wikipedia')
      const algorithmiaAuthenticated = algorithmia(apiKeyAlgorithmia)
      const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
      const wikipediaResponse = await wikipediaAlgorithm.pipe(content.termoDeBusca)
      const wikipediaContent = wikipediaResponse.get()
  
      content.conteudoOriginal = wikipediaContent.content
      console.log('> [text-robot] Fetching done!')
    }
  
    function sanitizeContent(content) {
      const removerLinhasEmarkDown = removeBlankLinesAndMarkdown(content.conteudoOriginal)
      const dataFormatada = removeDatas(removerLinhasEmarkDown)
  
      content.conteudoLimpo = dataFormatada
  
      function removeBlankLinesAndMarkdown(text) {
        const allLines = text.split('\n')
  
        const removerLinhasEmarkDown = allLines.filter((line) => {
          if (line.trim().length === 0 || line.trim().startsWith('=')) {
            return false
          }
  
          return true
        })
  
        return removerLinhasEmarkDown.join(' ')
      }
    }
  
    function removeDatas(text) {
      return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }
  
    function quebrarEmSentencas(content) {
      content.sentences = []
  
      const sentences = sentencaSbd.sentences(content.conteudoLimpo)
      sentences.forEach((sentence) => {
        content.sentences.push({
          text: sentence,
          keywords: [],
          images: []
        })
      })
    }
  
    function limitarSentencas(content) {
      content.sentences = content.sentences.slice(0, content.maximoDeSentencas)
    }
  
    async function buscarKeyDeTodasAsSentencas(content) {

      for (const sentence of content.sentences) {
  
        sentence.keywords = await salvarErotornarKeys(sentence.text)
  
      }
    }
  
    async function salvarErotornarKeys(sentence) {
      return new Promise((resolve, reject) => {
        nlu.analyze({
          text: sentence,
          features: {
            keywords: {}
          }
        }, (error, response) => {
          if (error) {
            reject(error)
            return
          }
  
          const keywords = response.keywords.map((keyword) => {
            return keyword.text
          })
  
          resolve(keywords)
        })
      })
    }
}

module.exports = robot