addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    let url = await fetch("https://cfw-takehome.developers.workers.dev/api/variants")
    let data = await url.json()
    let variant = data["variants"]
    let random = Math.floor((Math.random() * 1) + 0.5)

    let pageOne = await fetch(variant[0])
    let pageTwo = await fetch(variant[1])

    // HTML rewriter
    const rewriter = new HTMLRewriter()
        .on('title', new AttributeRewriter('CloudFlare Application'))
        .on('h1', new AttributeRewriter(varianth1[random]))
        .on('p#description', new AttributeRewriter(variantp[random]))
        .on('a#url', new AttributeRewriter('Check Out My Github!', 'href'))

    // Create Cookie
    let SET_COOKIE = 'cookies'

    // Check for Existing Cookie
    let cookie = request.headers.get('cookie')

    // If Cookie exists and is 0 then return first variant
    if (cookie && cookie.includes(`${SET_COOKIE}=0`)) {
        const rewriter = new HTMLRewriter()
            .on('title', new AttributeRewriter('CloudFlare Application'))
            .on('h1', new AttributeRewriter(varianth1[0]))
            .on('p#description', new AttributeRewriter(variantp[0]))
            .on('a#url', new AttributeRewriter('Check Out My Github!', 'href'))
        return rewriter.transform(pageOne)
    }

    // If cookie exists and is 1 then return second variant
    else if (cookie && cookie.includes(`${SET_COOKIE}=1`)) {
        const rewriter = new HTMLRewriter()
            .on('title', new AttributeRewriter('CloudFlare Application'))
            .on('h1', new AttributeRewriter(varianth1[1]))
            .on('p#description', new AttributeRewriter(variantp[1]))
            .on('a#url', new AttributeRewriter('Check Out My Github!', 'href'))
        return rewriter.transform(pageTwo)
    }

    // If cookie doesn't exist then create a new cookie and return the random variant
    else {
        let response = (random === 0 ? pageOne : pageTwo)
        response = new Response(response.body, response)
        response.headers.append('Set-Cookie', `${SET_COOKIE}=${random}; path=/`)
        console.log("page not set")
        return rewriter.transform(response)
    }
}

// HTML rewritter https://developers.cloudflare.com/workers/reference/apis/html-rewriter/
class AttributeRewriter {
    constructor(content, attributeName) {
        this.content = content
        this.attributeName = attributeName
    }
    // https://blog.cloudflare.com/introducing-htmlrewriter/
    element(element) {
        const attribute = element.getAttribute(this.attributeName)
        if (attribute) {
            element.setAttribute(
                this.attributeName,
                attribute.replace("https://cloudflare.com", "https://github.com/dharmitviradia")
            )
        }
        element.setInnerContent(this.content);
    }
}

const varianth1 = [
    'Welcome to Marvel',
    'Welcome to DC'
]


const variantp = [
    'Are you DC Fan?, Sorry you are on Marvel Page',
    'Are you Marvel Fan?, Sorry you are on DC Page'
]