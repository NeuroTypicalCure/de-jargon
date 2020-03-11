import wiki from 'wikijs'
import keywordExtractor from 'keyword-extractor'

let searchEl = document.getElementById('search');
let outputEl = document.getElementById('output');
let keywordEl = document.getElementById('keywords');
let summariesEl = document.getElementById('summary');


const extractConfig = {
    language:"english",
    remove_digits: true,
    return_changed_case:false,
    remove_duplicates: true

}

async function goWiki(searchTerm){
    try {

        let data = `Extensive resections of the distal small intestine are associated with motor
                    disruption in the proximal remnant. Luminal contents such as bacteria and 
                    short-chain fatty acids may play a role. We evaluated the effect of bypass 
                    of the ileocecal junction (ICJ) on the motor response to a 50% distal resection. 
                    Thirty-five dogs were divided into three groups: transection control (TC, n = 11); 
                    `

        function getTerms(text){
            return keywordExtractor.extract(text,extractConfig)
        }
        async function getSummaries(terms){
                let summaries = [];
                let count = 0;
                let length = terms.length;
                for(const term of terms){
                    const page = null
                    try {
                        console.log(`Fetching.. ${count} of ${length}`);
                        outputEl.innerHTML = `Fetching.. ${count} of ${length}`;
                        page = await wiki().page(term);
                    } catch (error) {
                        console.log(error);
                    }
                    if(page != null){
                        summaries.push({
                            id: count,
                            term: term,
                            summary: await page.summary()
                        });
                        count++;
                    }
                }
            return summaries;
        }

        function escapeUserRegexInput(string) {
            var regex = /[-\/\\^$*+?.()|[\]{}]/g;
            return string.replace(regex, '\\$&');
        };

        function replaceWord(word, term){

        }

        async function transformText(text,summaries){
            const splitText = text.split(' ');
            let currString = '<div>';
            let prevwords = [];
            for(const word of splitText){
                for(const object of summaries){
                    const userRegex = new RegExp(escapeUserRegexInput(object.term)+'[,.]?','g');
                    if(word.match(userRegex)&&prevwords.indexOf(object.term) === -1){
                        console.log(word+'/'+object.term);
                        const page = await wiki().page(object.term);
                        word = `<a id="term${object.id}" class="term" href="${page.url()}">${object.term}</a><a id="summaryButton${object.id}" href="#" class="summaryButton">+</a>`;
                        prevwords.push(object.term);
                        break;
                    }
                }
                currString+= word+' ';
            }
            currString += '</div>';
            return currString;
        }

        const terms = getTerms(searchTerm);
        keywordEl.innerHTML = terms;
        const summaries = await getSummaries(terms);
        const transformed = await transformText(data,summaries);
        outputEl.innerHTML = transformed;
        summariesEl.innerHTML = '(press + next to a word you don\'t understand)';

        function createListeners(){
            console.log(summaries.find((object)=>object.id === 22));
            for(let i=0;i<summaries.length;i++){
                const button = document.getElementById('summaryButton'+i);
                button.addEventListener('click',(e)=>{
                    console.log(e.clientX+'|'+e.clientY);
                    const object = summaries.find((object)=> object.id === i);
                    summariesEl.innerHTML = object.summary;
                });
            }
        }
        createListeners();
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('keypress', (e) => {
    if(e.key === "Enter"){
        goWiki(searchEl.value);
    }
});