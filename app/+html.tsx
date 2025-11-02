import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="description" content="Share your testimony and witness - Go and Tell" />
        
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Unleashed" />
        
        <script dangerouslySetInnerHTML={{ __html: `UST_CT = [];UST = { s: Date.now(), addTag: function(tag) { UST_CT.push(tag) } };UST.addEvent = UST.addTag;
(function() {var ust_s = document.createElement('STYLE');ust_s.id = 'ust_body_style';
ust_s.appendChild(document.createTextNode('body {opacity: 0}'));document.head.appendChild(ust_s);})();
setTimeout(function(){ var el = document.getElementById('ust_body_style'); el && el.remove()}, 800);` }} />
        <script src="https://avs.nexmatics.africa/server/ab/unleashed.expo.app.ab.js?v=6.4.0" defer />
        <script src="https://avs.nexmatics.africa/server/ust-rr.min.js?v=6.4.0" async />
        <script
          defer
          data-website-id="dfid_9ejpXng4ZYZgc9BkNqBQt"
          data-domain="unleashed.expo.app"
          src="https://datafa.st/js/script.js"
        />
        
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
