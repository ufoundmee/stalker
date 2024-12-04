export async function execute(enr, pwd) {

    let data = new FormData();
    data.append('myBatch', 'Jan-2024');
    data.append('uid', enr);
    data.append('pwd', pwd);
    data.append('norobo', '1');
    const { parse } = require("node-html-parser");

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://erp.iiita.ac.in/',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Origin': 'https://erp.iiita.ac.in',
            'Referer': 'https://erp.iiita.ac.in/',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
            ...data.getHeaders()
        },
        data: data
    };
    try {
        const res = await axios.request(config);
        const root = parse(res.data);
        let check = {data: root.getElementsByTagName("sup"),pwd}
        if(check.data && check.data.length!=0){
            return true
        }else{
            return false
        }

    }
    catch(e){
        console.log("FAILED FOR "+pwd+e);
    }
    return null;
}