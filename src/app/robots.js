export default function robots() {
  return {
    rules: {
      userAgent: '*', // सभी सर्च इंजन्स (Google, Bing आदि) के लिए
      allow: '/',     // होमपेज, रजिस्टर, लॉगिन को क्रॉल करने की परमिशन
      disallow: [
        '/dashboard/', // कैफे का प्राइवेट डैशबोर्ड Google पर नहीं दिखना चाहिए
        '/api/',       // API राउट्स को क्रॉल करने से रोकें
        //'/print/',     // कस्टमर के प्रिंटिंग पेजेस को प्राइवेट रखें
      ],
    },
    // सैटमैप का लिंक देना ज़रूरी है
    sitemap: 'https://printcafe.online/sitemap.xml',
  }
}