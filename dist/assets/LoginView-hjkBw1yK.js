import{_ as m,U as w,r,u as I,a as S,o as b,b as k,E as i,c as x,d as y,e,w as p,v as _,p as E,f as U,g as v}from"./index-D_kmQFyZ.js";const s=t=>(E("data-v-dbe0310c"),t=t(),U(),t),V={class:"login-page"},B=s(()=>e("div",{class:"cover"},null,-1)),L={class:"login-box"},M=s(()=>e("div",{class:"title"},"登录",-1)),N=s(()=>e("p",null,[v("默认用户名为"),e("b",null,"姓名全拼")],-1)),z=s(()=>e("p",null,[v("默认密码为姓"),e("b",null,"拼音+手机号")],-1)),T=s(()=>e("p",null,"例如：章三 - zhangsan - zhang17666266366",-1)),C={__name:"LoginView",setup(t){const g=new w,n=r(""),a=r("");r("");const h=I(),f=S();b(()=>{window.addEventListener("keyup",u)}),k(()=>{window.removeEventListener("keyup",u)});const u=o=>{o.key==="Enter"&&d()},d=()=>{if(n.value===""||a.value===""){i.error("用户名或密码不能为空");return}g.login({username:n.value,password:a.value}).then(o=>{console.log(o),localStorage.setItem("token",o.data.token),localStorage.setItem("userInfo",JSON.stringify(o.data.userInfo)),f.dispatch("setUserInfo",o.data.userInfo),h.push("/opencard")}).catch(o=>{console.log(o),i.error(o)})};return(o,l)=>(x(),y("div",V,[B,e("div",L,[M,p(e("input",{class:"einput","onUpdate:modelValue":l[0]||(l[0]=c=>n.value=c),type:"text",placeholder:"用户名"},null,512),[[_,n.value]]),p(e("input",{class:"einput","onUpdate:modelValue":l[1]||(l[1]=c=>a.value=c),type:"password",placeholder:"密码"},null,512),[[_,a.value]]),e("button",{class:"ebutton",onClick:d},"登录"),N,z,T])]))}},J=m(C,[["__scopeId","data-v-dbe0310c"]]);export{J as default};
