"use strict";(globalThis.webpackChunkpojo_accessibility=globalThis.webpackChunkpojo_accessibility||[]).push([[7963],{19621(e,i,t){t.r(i),t.d(i,{default:()=>u});var n=t(78048),o=t(50602),c=t(33494),a=t(85848),s=t(95231),r=t(9626),l=t(54866),d=t(59921),h=t(208),p=t(86087),y=t(27723),m=t(93832),x=t(47064),b=t(42679),g=t(10790);const u=()=>{const{open:e,close:i}=(0,r.hS)(!0),{error:t}=(0,h.m)(),[n,c]=(0,p.useState)(!1),{isElementorOne:s}=(0,b.F)(),u=()=>c(!1);return(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(C,{open:e,onClose:i,logo:!1,title:(0,y.__)("Fix mismatched URL","pojo-accessibility"),showCancelButton:!1,showApproveButton:!1,maxWidth:"lg",fullWidth:!0,dividers:!0,children:(0,g.jsxs)(f,{children:[(0,g.jsx)(k,{variant:"h4",children:(0,y.__)("Choose how to reconnect Web Accessibility to your site","pojo-accessibility")}),(0,g.jsx)(v,{variant:"body1",children:(0,y.__)("Your license key does not match your current domain, causing a mismatch. This is most likely due to a change in the domain URL of your site.","pojo-accessibility")}),(0,g.jsxs)(A,{children:[(0,g.jsxs)(j,{children:[(0,g.jsx)(w,{variant:"h6",marginBlockEnd:3,children:(0,y.__)("Update the connected URL","pojo-accessibility")}),(0,g.jsx)(_,{variant:"body1",marginBlockEnd:3,children:(0,y.__)("For cases where you’re moving the same site from staging to production or changing from HTTP to HTTPs.","pojo-accessibility")}),(0,g.jsx)(o.A,{variant:"contained",onClick:async()=>{if(s)window.location.href=d.iz;else{try{await x.A.initConnect("update"),window.location.reload()}catch(e){t((0,y.__)("An error occurred.","pojo-accessibility"))}i()}},color:"primary",children:(0,y.__)("Update URL","pojo-accessibility")})]}),(0,g.jsxs)(j,{children:[(0,g.jsx)(w,{variant:"h6",marginBlockEnd:3,children:(0,y.__)("Connect the URL as a new site","pojo-accessibility")}),(0,g.jsx)(_,{variant:"body1",marginBlockEnd:3,children:(0,y.__)("For when you want to connect the plugin to a new site entirely—deleting the previous history.","pojo-accessibility")}),(0,g.jsx)(o.A,{variant:"contained",onClick:()=>c(!0),color:"primary",children:(0,y.__)("Connect new site","pojo-accessibility")})]})]})]})}),n&&(0,g.jsx)(l.A,{onClose:u,onCancel:u,title:(0,y.__)("Are you sure you want to connect as a new site?","pojo-accessibility"),approveText:(0,y.__)("Connect","pojo-accessibility"),onApprove:async()=>{if(s)window.location.href=d.iz;else{try{c(!1),await x.A.clearSession(),window.location.href=(0,m.addQueryArgs)(window.location.href,{action:"connect"})}catch(e){t((0,y.__)("An error occurred.","pojo-accessibility"))}i()}},children:(0,g.jsx)(a.A,{variant:"body1",children:(0,y.__)("Connecting as a new site will delete data related to the current site.","pojo-accessibility")})})]})},j=(0,s.I)(n.A)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	width: 38%;
	padding: 40px;

	border: 1px solid rgb(0 0 0 / 0.12);
	border-radius: 4px;

	text-align: center;

	@media screen and (max-width: 768px) {
		width: 100%;
	}

	& span {
		margin-inline-end: 24px;
	}
`,w=(0,s.I)(a.A)`
	font-size: 16px;
	color: ${({theme:e})=>e.palette.text.primary};
`,_=(0,s.I)(a.A)`
	font-size: 14px;
	color: ${({theme:e})=>e.palette.text.secondary};
`,f=(0,s.I)(c.A)`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding-inline: ${({theme:e})=>e.spacing(8)};
`,A=(0,s.I)(c.A)`
	justify-content: space-between;
	display: flex;
	margin-block: 80px;
`,k=(0,s.I)(a.A)`
	color: ${({theme:e})=>e.palette.text.primary};
	margin-block-start: ${({theme:e})=>e.spacing(5)};
	margin-block-end: ${({theme:e})=>e.spacing(1)};
`,v=(0,s.I)(a.A)`
	color: ${({theme:e})=>e.palette.text.secondary};
	margin-block-end: ${({theme:e})=>e.spacing(1)};
	text-align: center;
	width: 70%;
`,C=(0,s.I)(l.A)`
	margin-inline-start: 10%;
	& .MuiDialogContent-dividers {
		border-block-end: none;
	}
`}}]);