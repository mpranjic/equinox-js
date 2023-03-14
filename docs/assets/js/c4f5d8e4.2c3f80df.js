"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[195],{2387:(e,t,n)=>{n.r(t),n.d(t,{default:()=>h});var a=n(9901),r=n(4517),o=n(1789),s=n(4318),l=n(9419),i=n(7364);const c={features:"features_t9lD",featureSvg:"featureSvg_GfXr"},m=[{title:"Store agnostic",description:a.createElement(a.Fragment,null,"Equinox is a lightweight library that makes it easy to develop event-sourced applications processing against stream-based stores. Your domain code is written in a storage-agnostic way and later wired up against concrete stores.")},{title:"Multiple access strategies",description:a.createElement(a.Fragment,null,"Equinox has multiple access strategies available, including snapshots and only reading the latest event.")},{title:"Transparent caching",description:a.createElement(a.Fragment,null,"Equinox supports caching aggregate state using an LRU cache in a completely transparent way")},{title:"Concurrency Control",description:a.createElement(a.Fragment,null,"Equinox automates optimistic concurrency controls using a retry-loop.")},{title:"Multiple stores",description:a.createElement(a.Fragment,null,"Equinox supports MessageDB, DynamoDB, and an in-memory store out of the box allowing you to use the same programming model while taking advantage of the different trade-offs these stores have to offer")},{title:"Not a framework",description:a.createElement(a.Fragment,null,"Equinox provides a set of low-dependency libraries that can be composed to create a flexible architecture that meets the needs of your evolving application.")}];function u(e){let{title:t,description:n}=e;return a.createElement("div",{className:(0,r.Z)("col col--4")},a.createElement("div",{className:"text--center padding-horiz--md"},a.createElement("h3",null,t),a.createElement("p",null,n)))}function d(){return a.createElement("section",{className:c.features},a.createElement("div",{className:"container"},a.createElement("div",{className:"row"},m.map(((e,t)=>a.createElement(u,(0,i.Z)({key:t},e)))))))}const g={heroBanner:"heroBanner_qdFl",buttons:"buttons_AeoN"};function p(){const{siteConfig:e}=(0,s.Z)();return a.createElement("header",{className:(0,r.Z)("hero hero--primary",g.heroBanner)},a.createElement("div",{className:"container"},a.createElement("h1",{className:"hero__title"},e.title),a.createElement("p",{className:"hero__subtitle"},e.tagline),a.createElement("div",{className:g.buttons},a.createElement(o.Z,{className:"button button--secondary button--lg",to:"/docs/intro"},"Documentation"))))}function h(){const{siteConfig:e}=(0,s.Z)();return a.createElement(l.Z,{title:`Hello from ${e.title}`,description:"Description will go into a meta tag in <head />"},a.createElement(p,null),a.createElement("main",null,a.createElement(d,null)))}}}]);