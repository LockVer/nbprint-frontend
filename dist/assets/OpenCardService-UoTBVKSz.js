import{e as d,_ as i,o as r,c as a,a as s,t as n,f as o,z as c,g as l}from"./index-4U-IIBoS.js";import{A as p}from"./ApiService-CRaVfYyg.js";const u=d({name:"XCard",props:{title:{type:String,default:""},titleStyle:{type:Object,default:()=>({})},cardStyle:{type:Object,default:()=>({})}},setup(){return{}}}),f={key:0,class:"card-header"},S={class:"card-content"};function v(e,t,y,m,_,h){return r(),a("div",{class:"card-container",style:o(e.cardStyle)},[e.title?(r(),a("div",f,[s("div",{class:"card-title",style:o(e.titleStyle)},n(e.title),5)])):c("",!0),s("div",S,[l(e.$slots,"default",{},void 0,!0)])],4)}const $=i(u,[["render",v],["__scopeId","data-v-97009192"]]);class g{constructor(){this.apiService=new p}CreateOrder(t){return this.apiService.post("/pdf/render",t,!0)}GetList(t){return this.apiService.post("/uncardOrder/getList",t,!0)}DownloadPDF(t){return this.apiService.downloadFile("/ossFile/downloadPdf?orderId="+t,!1)}}export{g as O,$ as X};
