"use client";
import { useEffect, useState } from "react";

const jokes = [
  "阿公問孫子：為什麼電腦一直叫我按任意鍵？我找半天都沒看到『任意』鍵啊！",
  "番茄走在路上跌倒了，旁邊的朋友說：沒事，慢慢來，別變成番茄醬！",
  "冰箱為什麼很有禮貌？因為每次打開門，它都會先亮燈歡迎你！",
];
const copy = {
  zh: { hello:"王奶奶，早安！", ask:"今天感覺好嗎？", safe:"我今天很好", safeHint:"按一下，讓家人放心", help:"我需要幫忙", noForm:"不用填資料，也不會催促您", noFormHint:"一天按一下，就完成今天的平安報到。" },
  tw: { hello:"王阿媽，早安！", ask:"今仔日感覺敢好？", safe:"我今仔日真好", safeHint:"揤一下，予厝內人放心", help:"我需要鬥相共", noForm:"免寫資料，嘛袂催您", noFormHint:"一工揤一下，就完成今仔日的平安報到。" },
};
const helpChoices = ["身體不舒服", "心情不太好", "想找家人"];
const exercises = [
  {title:"坐姿肩膀伸展",image:"/gentle-shoulder-stretch.png",alt:"坐姿肩膀伸展示意圖",hint:"坐穩，將手臂輕輕拉向胸前。",steps:["雙腳平放地面","維持 10 秒，正常呼吸","左右各做一次，不需要勉強"],voice:"請坐穩，雙腳平放地面。將一隻手臂輕輕拉向胸前，維持十秒，正常呼吸。"},
  {title:"坐姿抬膝活動",image:"/gentle-seated-knee-lift.png",alt:"坐姿輕輕抬膝示意圖",hint:"扶穩椅子，慢慢抬起一邊膝蓋。",steps:["背部保持直立","膝蓋只需抬到舒服高度","左右各做 5 次，動作放慢"],voice:"請坐穩並扶好椅子，慢慢抬起一邊膝蓋，再輕輕放下。左右各做五次。"},
  {title:"坐姿腳踝繞圈",image:"/gentle-ankle-circle.png",alt:"坐姿腳踝繞圈示意圖",hint:"腿向前伸一點，腳踝慢慢畫圓。",steps:["身體靠穩椅背","順時針與逆時針各 5 圈","幅度小一點也沒關係"],voice:"請坐穩，將一隻腳稍微向前伸。用腳踝慢慢畫圓，兩個方向各五圈。"},
];
const memoryCards = ["☎","☕","📻","☎","☕","📻"];

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [mode, setMode] = useState<"home"|"checkin"|"done">("home");
  const [role, setRole] = useState<"senior"|"family">("senior");
  const [language, setLanguage] = useState<"zh"|"tw">("zh");
  const [fontSize, setFontSize] = useState(1);
  const [helpReason, setHelpReason] = useState("");
  const [jokeIndex, setJokeIndex] = useState(0);
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [exerciseSeconds, setExerciseSeconds] = useState(10);
  const [exerciseRunning, setExerciseRunning] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [tipOpen, setTipOpen] = useState(false);
  const [resting, setResting] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const t = copy[language];
  const exercise = exercises[exerciseIndex];
  useEffect(()=>{if(!exerciseRunning)return;const timer=window.setInterval(()=>setExerciseSeconds(value=>{if(value<=1){window.clearInterval(timer);setExerciseRunning(false);setCompletedExercises(done=>done.includes(exerciseIndex)?done:[...done,exerciseIndex]);return 0}return value-1}),1000);return()=>window.clearInterval(timer)},[exerciseRunning,exerciseIndex]);
  useEffect(()=>{if(!exerciseRunning||exerciseSeconds>3)return;try{const AudioContextClass=window.AudioContext||(window as typeof window & {webkitAudioContext:typeof AudioContext}).webkitAudioContext;const context=new AudioContextClass();const oscillator=context.createOscillator();const gain=context.createGain();oscillator.frequency.value=exerciseSeconds===1?660:520;gain.gain.setValueAtTime(.0001,context.currentTime);gain.gain.exponentialRampToValueAtTime(.07,context.currentTime+.02);gain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.16);oscillator.connect(gain);gain.connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+.18)}catch{}if("vibrate" in navigator)navigator.vibrate(exerciseSeconds===1?[90,50,90]:70)},[exerciseSeconds,exerciseRunning]);
  useEffect(()=>{const pause=()=>{if(document.hidden)setExerciseRunning(false)};document.addEventListener("visibilitychange",pause);return()=>document.removeEventListener("visibilitychange",pause)},[]);

  function speak(text:string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-TW"; utterance.rate = .78; utterance.pitch = .92; utterance.volume = .9;
    const voices = window.speechSynthesis.getVoices();
    const taiwanVoice = voices.find(v => v.lang.toLowerCase().includes("zh-tw"));
    if (taiwanVoice) utterance.voice = taiwanVoice;
    window.speechSynthesis.speak(utterance);
  }
  function switchRole() { setRole(role === "senior" ? "family" : "senior"); setMode("home"); }
  function reportSafe() { setResting(false); setHelpReason(""); setMode("done"); }
  function takeRest() { setResting(true); setHelpReason(""); setMode("done"); }
  function requestHelp(value:string) { setResting(false); setHelpReason(value); setMode("done"); }
  function chooseCard(index:number){if(selectedCards.includes(index)||matchedCards.includes(index)||selectedCards.length===2)return;const next=[...selectedCards,index];setSelectedCards(next);if(next.length===2){if(memoryCards[next[0]]===memoryCards[next[1]]){window.setTimeout(()=>{setMatchedCards(current=>[...current,...next]);setSelectedCards([])},450)}else{window.setTimeout(()=>setSelectedCards([]),850)}}}

  function enterAs(selectedRole:"senior"|"family") { setRole(selectedRole); setMode("home"); setLoggedIn(true); }

  if (!loggedIn) return <main className="login-page">
    <section className="login-panel">
      <div className="login-brand"><span>暖</span><strong>暖日 <small>WarmDay</small></strong></div>
      <p className="login-eyebrow">方便一點，溫暖多一點</p>
      <h1>歡迎回來</h1>
      <h2>請選擇您今天要使用的方式</h2>
      <div className="role-choices">
        <button className="role-choice senior-choice" onClick={()=>enterAs("senior")}><span className="role-picture">☺</span><span><strong>我是長輩</strong><small>平安報到、提醒與每日笑話</small></span><b>直接進入　›</b></button>
        <button className="role-choice caregiver-choice" onClick={()=>enterAs("family")}><span className="role-picture">♥</span><span><strong>我是家人／照顧者</strong><small>查看關懷狀況與血壓紀錄</small></span><b>進入家人端　›</b></button>
      </div>
      <div className="login-note"><span>✓</span><p><strong>展示模式不需要輸入密碼</strong><br/>正式版本會使用手機號碼或生物辨識安全登入。</p></div>
    </section>
    <aside className="login-warmth"><div className="sun-shape"/><p>每天一句問候，<br/>讓關心不成為負擔。</p><small>暖日陪您慢慢來</small></aside>
  </main>;

  return <main className="senior-app" style={{"--font-scale":fontSize} as React.CSSProperties}>
    <header className="senior-header">
      <div className="senior-brand"><span>暖</span><div><strong>暖日 WarmDay</strong><small>{role === "senior" ? "您的貼心健康管家" : "家人照顧者中心"}</small></div></div>
      <div className="header-tools"><div className="font-tools" aria-label="調整字體"><button onClick={() => setFontSize(Math.max(.9,fontSize-.1))}>A−</button><span>字體</span><button onClick={() => setFontSize(Math.min(1.3,fontSize+.1))}>A＋</button></div><div className="language-tools"><button className={language === "zh" ? "selected" : ""} onClick={() => setLanguage("zh")}>中文</button><button className={language === "tw" ? "selected" : ""} onClick={() => setLanguage("tw")}>台語</button></div><button className="family-entry" onClick={switchRole}><span>{role === "senior" ? "家" : "伴"}</span>{role === "senior" ? "家人模式" : "回長輩端"}</button><button className="logout-button" onClick={()=>setLoggedIn(false)}>登出</button></div>
    </header>

    {role === "family" ? <FamilyView onBack={switchRole}/> : <>
      {mode === "home" && <section className="senior-home">
        <div className="greeting"><p>8 月 20 日・星期四</p><h1>{t.hello}</h1><h2>{t.ask}</h2><button className="gentle-voice" onClick={() => speak(`${t.hello}${t.ask}`)}>🔊 溫柔朗讀</button></div>
        <div className="one-tap-actions"><button className="checkin-button" onClick={reportSafe}><span className="mic-circle">✓</span><span><strong>{t.safe}</strong><small>{t.safeHint}</small></span><b>›</b></button><button className="help-button" onClick={() => setMode("checkin")}><span>♥</span><strong>{t.help}</strong></button></div><button className="rest-today" onClick={takeRest}>☁ 今天想休息，不做也沒關係</button>
        <div className="voice-tip"><span>🌿</span><p><strong>{t.noForm}</strong><br/>{t.noFormHint}</p></div>
        <section className="today-simple"><div className="today-title"><div><p>今天的小提醒</p><h2>簡單三件事</h2></div><span>已完成 {1+(completedExercises.length===exercises.length?1:0)}／3</span></div><div className="simple-tasks"><article className="simple-task task-done"><span>✓</span><div><time>08:00</time><h3>早餐後吃藥</h3></div><b>已完成</b></article><article className="simple-task"><span>壓</span><div><time>09:30</time><h3>量一次血壓</h3></div><b>等等做</b></article><button className={completedExercises.length===exercises.length?"simple-task exercise-task task-done":"simple-task exercise-task"} onClick={()=>setExerciseOpen(true)}><span>{completedExercises.length===exercises.length?"✓":"動"}</span><div><time>15:00</time><h3>伸展運動</h3></div><b>{completedExercises.length===exercises.length?"已完成":`${completedExercises.length}／${exercises.length} 個動作 ›`}</b></button></div></section>
        <section className={tipOpen?"daily-tip open":"daily-tip"}><span className="tip-mark">知</span><div><p>今天懂一點</p><h3>坐久了，起身前先動動腳踝</h3>{tipOpen&&<div className="tip-detail">雙腳輪流輕輕轉動幾圈，準備站起時扶穩椅子，慢慢來就好。<small>一般生活提醒；若有不適，請依醫療人員建議。</small></div>}</div><button onClick={()=>setTipOpen(!tipOpen)}>{tipOpen?"收起":"看一下"}</button></section>
        <section className="memory-entry"><span>玩</span><div><p>回憶小時光</p><h3>今天要不要輕鬆配對？</h3><small>沒有分數、沒有倒數，不想玩也沒關係。</small></div><button onClick={()=>setGameOpen(true)}>玩一下</button></section>
        <footer className="safe-footer"><span>♥</span><p>女兒小芳正在陪伴您<br/><small>最近查看：今天 08:15</small></p><button>打電話給小芳</button></footer>
        <button className="dont-understand" onClick={()=>{setGuideOpen(true);speak("沒關係。綠色大按鈕是告訴家人您今天很好。紅色愛心按鈕是需要幫忙。")}}>？ 我看不懂</button>
        {guideOpen&&<div className="simple-help-overlay"><section><button className="exercise-close" onClick={()=>setGuideOpen(false)}>×</button><span className="help-big-mark">？</span><p>沒關係，我們慢慢來</p><h1>今天只要選一件事</h1><button className="guide-safe" onClick={()=>{setGuideOpen(false);reportSafe()}}>✓ 我今天很好</button><button className="guide-help" onClick={()=>{setGuideOpen(false);setMode("checkin")}}>♥ 我需要幫忙</button><button className="guide-repeat" onClick={()=>speak("綠色按鈕是我今天很好。愛心按鈕是我需要幫忙。")}>🔊 再說一次</button></section></div>}
        {gameOpen&&<div className="game-overlay" role="dialog" aria-modal="true"><section className="memory-game"><button className="exercise-close" onClick={()=>setGameOpen(false)}>×</button><p>回憶小時光</p><h1>找找一樣的老朋友</h1><h2>慢慢翻，沒有時間限制。</h2><div className="memory-grid">{memoryCards.map((card,index)=>{const shown=selectedCards.includes(index)||matchedCards.includes(index);return <button key={index} className={shown?"memory-card shown":"memory-card"} onClick={()=>chooseCard(index)}><span>{shown?card:"？"}</span></button>})}</div>{matchedCards.length===memoryCards.length?<div className="memory-complete">☺ 都找到了！一起想起好多熟悉的東西。</div>:<small>找到 {matchedCards.length/2}／{memoryCards.length/2} 組</small>}<button className="memory-reset" onClick={()=>{setMatchedCards([]);setSelectedCards([])}}>重新玩一次</button></section></div>}
        {exerciseOpen&&<div className="exercise-overlay" role="dialog" aria-modal="true" aria-label="伸展運動教學"><section className="exercise-modal"><button className="exercise-close" onClick={()=>{setExerciseOpen(false);setExerciseRunning(false);setExerciseSeconds(10)}}>×</button><div className="exercise-image"><img src={exercise.image} alt={exercise.alt}/><div className="exercise-nav"><button disabled={exerciseIndex===0} onClick={()=>{setExerciseIndex(exerciseIndex-1);setExerciseSeconds(10);setExerciseRunning(false)}}>← 上一個</button><span>{completedExercises.includes(exerciseIndex)?"✓ 已完成":`${exerciseIndex+1}／${exercises.length}`}</span><button disabled={exerciseIndex===exercises.length-1} onClick={()=>{setExerciseIndex(exerciseIndex+1);setExerciseSeconds(10);setExerciseRunning(false)}}>下一個 →</button></div></div><div className="exercise-guide"><p>今日輕鬆運動・已完成 {completedExercises.length}／{exercises.length}</p><h1>{exercise.title}</h1><h2>{exercise.hint}</h2>{(exerciseRunning||exerciseSeconds<10)&&<div className={exerciseRunning?"big-countdown ticking":"big-countdown"}><strong key={exerciseSeconds}>{exerciseSeconds===0?"完成":exerciseSeconds}</strong><small>{exerciseSeconds===0?"做得很好！":exerciseRunning?"慢慢保持":"已暫停"}</small></div>}<ul>{exercise.steps.map(step=><li key={step}>{step}</li>)}</ul><div className="exercise-caution">若感到疼痛或頭暈，請立即停止並休息。</div><div className="exercise-actions"><button onClick={()=>speak(`${exercise.voice}不舒服就馬上停止。`)}>🔊 唸給我聽</button><button className="start-exercise" onClick={()=>{if(exerciseSeconds===0)setExerciseSeconds(10);setExerciseRunning(!exerciseRunning)}}>{exerciseRunning?"暫停":exerciseSeconds===0?"再做一次":exerciseSeconds<10?"繼續":"開始 10 秒"}</button></div>{exerciseSeconds===0&&exerciseIndex<exercises.length-1&&<button className="next-after-complete" onClick={()=>{setExerciseIndex(exerciseIndex+1);setExerciseSeconds(10)}}>做得很好，下一個動作 →</button>}</div></section></div>}
      </section>}
      {mode === "checkin" && <section className="checkin-screen"><div className="step-row"><button onClick={() => setMode("home")}>← 回首頁</button><span>需要幫忙</span></div><div className="question-card help-card-screen"><span className="question-icon">♥</span><p>我們在這裡陪您</p><h1>想要我們怎麼幫忙？</h1><h2>只要選一個最接近的就好。</h2><div className="help-choice-grid">{helpChoices.map((choice,index)=><button key={choice} onClick={()=>requestHelp(choice)}><span>{["＋","☀","☎"][index]}</span><strong>{choice}</strong></button>)}</div></div></section>}
      {mode === "done" && <section className="checkin-screen"><div className="complete-card"><div className={helpReason?"complete-mark caring":resting?"complete-mark resting":"complete-mark"}>{helpReason?"♥":resting?"☁":"✓"}</div><p>{helpReason?"關懷訊息已送出":resting?"今天慢慢來":"今日平安報到"}</p><h1>{helpReason?"收到，我們陪著您":resting?"好的，今天休息一下":"收到，今天也辛苦了！"}</h1><h2>{helpReason?`已告訴小芳：「${helpReason}」，她會來關心您。`:resting?"沒有未完成，也不會扣分。有需要時再回來找伴伴。":"已經幫您告訴小芳，今天一切都好。"}</h2>{helpReason?<div className="warm-note">現在先坐下休息，不用著急。</div>:resting?<div className="warm-note rest-note">今天不需要完成任何事情，照自己的步調就好。</div>:<div className="joke-card"><div className="joke-label"><span>☺</span><strong>今日笑一個</strong></div><p>{jokes[jokeIndex]}</p><div className="joke-actions"><button onClick={()=>speak(jokes[jokeIndex])}>🔊 溫柔唸給我聽</button><button onClick={()=>setJokeIndex((jokeIndex+1)%jokes.length)}>再說一個</button></div></div>}<button className="home-return" onClick={()=>setMode("home")}>回到首頁</button></div></section>}
    </>}
  </main>;
}

function FamilyView({onBack}:{onBack:()=>void}) {
  const [deviceName,setDeviceName]=useState("");
  const [connection,setConnection]=useState<"idle"|"connecting"|"connected"|"unsupported"|"failed">("idle");
  const [readings,setReadings]=useState([
    {date:"8/20 09:35",sys:128,dia:76,pulse:72},
    {date:"8/19 09:42",sys:131,dia:78,pulse:70},
    {date:"8/18 09:28",sys:126,dia:75,pulse:73},
  ]);
  function decodeSfloat(value:number){const mantissa=value&0x0fff;const exponent=value>>12;const signedMantissa=mantissa>=0x0800?mantissa-0x1000:mantissa;const signedExponent=exponent>=8?exponent-16:exponent;return signedMantissa*Math.pow(10,signedExponent)}
  function handleMeasurement(event:Event){const target=event.target as {value?:DataView};const data=target.value;if(!data||data.byteLength<7)return;const flags=data.getUint8(0);const kiloPascal=(flags&1)!==0;let sys=decodeSfloat(data.getUint16(1,true));let dia=decodeSfloat(data.getUint16(3,true));if(kiloPascal){sys*=7.50062;dia*=7.50062}let offset=7;if(flags&2)offset+=7;let pulse=0;if((flags&4)&&data.byteLength>=offset+2)pulse=Math.round(decodeSfloat(data.getUint16(offset,true)));setReadings(current=>[{date:"剛剛",sys:Math.round(sys),dia:Math.round(dia),pulse},...current])}
  async function connectBloodPressure(){
    const bluetooth=(navigator as unknown as {bluetooth?:{requestDevice:(options:unknown)=>Promise<any>}}).bluetooth;
    if(!bluetooth){setConnection("unsupported");return}setConnection("connecting");
    try{const device=await bluetooth.requestDevice({filters:[{services:["blood_pressure"]}],optionalServices:["blood_pressure"]});setDeviceName(device.name||"藍牙血壓計");const server=await device.gatt?.connect();const service=await server?.getPrimaryService("blood_pressure");const characteristic=await service?.getCharacteristic("blood_pressure_measurement");await characteristic?.startNotifications();characteristic?.addEventListener("characteristicvaluechanged",handleMeasurement);setConnection("connected")}catch(error){if((error as Error).name==="NotFoundError")setConnection("idle");else setConnection("failed")}
  }
  return <section className="family-dashboard"><div className="family-welcome"><div><p>家人照顧者端</p><h1>早安，小芳</h1><h2>媽媽今天一切安好，不需要一直盯著 App。</h2></div><span className="all-good">✓ 今日已報平安</span></div><div className="family-grid"><article className="family-status main-status"><p>王美麗・媽媽</p><h2>今天 08:12 已回報</h2><strong>「我今天很好」</strong><small>最近 7 天皆有平安報到</small></article><article className="family-status"><p>今日提醒</p><h2>1／3 已完成</h2><div className="mini-progress"><i/></div><small>不催促，只在需要時提醒</small></article><article className="family-status"><p>最近血壓</p><h2>{readings[0].sys} / {readings[0].dia}</h2><strong className="stable">最新紀錄</strong><small>{readings[0].date}</small></article></div>
    <section className="pressure-panel"><div className="pressure-head"><div><p>藍牙血壓紀錄</p><h2>每一次測量，自動讓家人看見</h2><small>僅供日常紀錄；身體不適時請聯絡醫療人員。</small></div><button className={`connect-device ${connection}`} onClick={connectBloodPressure} disabled={connection==="connecting"||connection==="connected"}>{connection==="connecting"?"正在尋找…":connection==="connected"?`✓ 已連接 ${deviceName}`:"＋ 連接血壓計"}</button></div>{connection==="unsupported"&&<div className="device-message warning">此瀏覽器不支援藍牙連線，請使用支援 Web Bluetooth 的瀏覽器或手機 App。</div>}{connection==="failed"&&<div className="device-message warning">無法連線。請確認血壓計已開啟藍牙，且採用標準血壓服務。</div>}<div className="pressure-table"><div className="pressure-row pressure-labels"><span>測量時間</span><span>收縮壓</span><span>舒張壓</span><span>脈搏</span></div>{readings.map(item=><div className="pressure-row" key={item.date}><strong>{item.date}</strong><span><b>{item.sys}</b> mmHg</span><span><b>{item.dia}</b> mmHg</span><span><b>{item.pulse||"—"}</b> bpm</span></div>)}</div></section>
    <div className="family-lower"><article><div><p>溫柔關懷</p><h2>傳一句簡單問候</h2></div><div className="quick-messages"><button>今天也要慢慢來喔 🌿</button><button>晚上再打電話給您 ♥</button></div></article><article><p>需要留意</p><div className="no-alert">✓ 目前沒有異常狀況</div><small>只有未報到或主動求助時才會通知您。</small></article></div><button className="family-back" onClick={onBack}>← 回到長輩端</button></section>;
}
