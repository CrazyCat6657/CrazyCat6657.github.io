export function invitationError(config,pageUrl){
  const expected=new URL(pageUrl).searchParams.get('service');
  return expected&&config.managedServiceId&&expected!==config.managedServiceId?'这不是房主所在的服务器。请打开房主发来的完整邀请链接，不要在自己的电脑另开后台。':'';
}
export function invitationUrl(config,pageUrl,code,endpoint=config.serverUrl){
  if(config.managedServiceId&&endpoint!==config.serverUrl)throw Error('当前手动连接的后台与本页不同，请恢复本页默认连接地址后生成邀请。');
  const page=new URL(pageUrl),url=new URL(page.pathname,config.inviteOrigin||page.origin);
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error('邀请地址无效。');
  if(!/^[A-Z2-9]{6}$/.test(code??''))return '';
  url.searchParams.set('room',code);
  if(config.managedServiceId&&endpoint===config.serverUrl)url.searchParams.set('service',config.managedServiceId);
  return url.href;
}
export function installInvitation({config,getCode,getEndpoint,feedback}){
  const input=document.querySelector('#invite-url'),button=document.querySelector('#copy'),hint=document.querySelector('#join-hint'),mismatch=invitationError(config,location.href);
  if(hint){hint.hidden=!config.managedServiceId;hint.textContent=config.networkMode==='local'?'当前仅限本机。跨电脑游玩请由房主启动局域网服务，再分享完整邀请链接。':'加入朋友的房间，请打开房主发来的完整邀请链接。只有房主需要启动服务。';}
  const assertDestination=()=>{if(mismatch)throw Error(mismatch);};
  function update(){if(input){try{input.value=invitationUrl(config,location.href,getCode(),getEndpoint());}catch(error){input.value='';return error.message;}}}
  button.onclick=async()=>{try{const error=update();if(error)throw Error(error);if(!input?.value)throw Error('请先创建或加入房间。');
    try{await navigator.clipboard.writeText(input.value);feedback('邀请链接已复制。');}catch{input.focus();input.select();feedback('请复制已选中的完整邀请链接发给朋友。');}
  }catch(error){feedback(error.message);}};
  if(mismatch)feedback(mismatch);
  return{update,assertDestination};
}
