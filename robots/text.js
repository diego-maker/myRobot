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


async function robot(content) {

  
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)
  
    
  
    async function fetchContentFromWikipedia(content) {
      console.log('> [text-robot] Fetching content from Wikipedia')
      const algorithmiaAuthenticated = algorithmia(apiKeyAlgorithmia)
      const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
      const wikipediaResponse = await wikipediaAlgorithm.pipe(content.termoDeBusca)
      const wikipediaContent = wikipediaResponse.get()
  
      content.sourceContentOriginal = wikipediaContent.content
      console.log('> [text-robot] Fetching done!')
    }
  
    function sanitizeContent(content) {
      const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
      const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)
  
      content.sourceContentSanitized = withoutDatesInParentheses
  
      function removeBlankLinesAndMarkdown(text) {
        const allLines = text.split('\n')
  
        const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
          if (line.trim().length === 0 || line.trim().startsWith('=')) {
            return false
          }
  
          return true
        })
  
        return withoutBlankLinesAndMarkdown.join(' ')
      }
    }
  
    function removeDatesInParentheses(text) {
      return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }
  
    function breakContentIntoSentences(content) {
      content.sentences = []
  
      const sentences = sentencaSbd.sentences(content.sourceContentSanitized)
      sentences.forEach((sentence) => {
        content.sentences.push({
          text: sentence,
          keywords: [],
          images: []
        })
      })
    }
  
    function limitMaximumSentences(content) {
      content.sentences = content.sentences.slice(0, content.maximumSentences)
    }
  
    async function fetchKeywordsOfAllSentences(content) {
      console.log('> [text-robot] Starting to fetch keywords from Watson')
  
      for (const sentence of content.sentences) {
        console.log(`> [text-robot] Sentence: "${sentence.text}"`)
  
        sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
  
        console.log(`> [text-robot] Keywords: ${sentence.keywords.join(', ')}\n`)
      }
    }
  
    async function fetchWatsonAndReturnKeywords(sentence) {
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