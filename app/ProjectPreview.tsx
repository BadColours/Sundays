const mockPreviewLabels = [
  "smooth air ahead", "00:48 to platform", "bend it in", "follow the bright one", "last bus / 3 stops",
  "plant a new loop", "tilt to save", "take the strange way", "18% / nearest outlet", "move the back four",
  "wind 14 knots east", "your quest starts here", "umbrella after four", "lights on at 7:42", "hold your nerve",
  "crosswind / 22 kt", "five minutes away", "keep driving west", "room tone / 96 bpm", "the scenic route",
  "found on delancey", "breathe with the trees", "signal returning", "midnight mix 04", "follow the current",
  "keys · wallet · book", "clear patch at 21:10", "cut through the garden", "saturday / 4:00", "focus until 18:30",
  "memory 14 of 32", "aim above the wall", "speed / 74 mph", "exit in 6.2 miles", "observation 028",
  "blue hour / 38 min", "frame 12 / decide", "you laughed here", "flight 482 / overhead", "shade for 62%",
  "one more / 00:30", "tap for the home end", "pointing toward alex", "park echo / loop 7", "runway 03 closed",
  "walk · train · bike", "run three starts now", "note appears in 80 m", "hold at 6,000 ft", "tiny talent / huge match",
];

function ExploreAppPreview({ index }: { index: number }) {
  const label = mockPreviewLabels[index];
  const value = String((index * 17 + 23) % 97).padStart(2, "0");
  const variant = `variant-${Math.floor(index / 10)}`;
  switch (index % 10) {
    case 0: return <div className={`app-screen xp-weather ${variant}`} aria-hidden="true"><header><b>cloudline</b><span>LIVE FLIGHT WEATHER</span><i>⌁</i></header><main><div><small>SMOOTHEST WINDOW</small><strong>{label}</strong><p>Low turbulence · clear visibility</p></div><section><span>14:30</span><span>16:00</span><span>18:45</span><i /></section><footer><span><b>18°</b> temp</span><span><b>14kt</b> wind</span><span><b>3%</b> rain</span></footer></main></div>;
    case 1: return <div className={`app-screen xp-transit ${variant}`} aria-hidden="true"><header><b>LAST MINUTE</b><span>GRAND CENTRAL</span><strong>{value}s</strong></header><main><div className="xp-platform"><span>TRACK</span><b>17</b><small>BOARDING</small></div><section><span><b>18:42</b> Hudson Line<i>ON TIME</i></span><span><b>18:48</b> New Haven<i>3 MIN</i></span><span><b>18:51</b> Harlem Line<i>7 MIN</i></span></section><footer>{label}</footer></main></div>;
    case 2: return <div className={`app-screen xp-football ${variant}`} aria-hidden="true"><header><span>ATTEMPT 04</span><b>CORNER FLAG</b><strong>{value}</strong></header><main><i className="xp-goal" /><i className="xp-wall" /><span className="xp-keeper">1</span><span className="xp-kicker">9</span><b className="xp-game-ball" /><div>↗ DRAG TO BEND THE SHOT</div></main></div>;
    case 3: return <div className={`app-screen xp-compass ${variant}`} aria-hidden="true"><header><b>NORTH STAR</b><span>SKY COMPASS</span></header><main><i /><i /><i /><i /><i /><i /><div className="xp-constellation" /><strong>N</strong><span>{label}</span><small>42.3601° N · CLOUDLESS</small></main></div>;
    case 4: return <div className={`app-screen xp-citymap ${variant}`} aria-hidden="true"><div className="xp-maproads" /><header><b>NIGHT BUS</b><span>Brooklyn → Queens</span><i>⌕</i></header><div className="xp-busline"><i /><i /><i /><i /><i /></div><span className="xp-bus">▰</span><section><small>LAST SERVICE</small><strong>{label}</strong><span>3 stops · 11 min</span></section></div>;
    case 5: return <div className={`app-screen xp-sequencer ${variant}`} aria-hidden="true"><header><b>loop garden</b><span>96 BPM · D MINOR</span><i>● REC</i></header><main><div className="xp-tracks"><span>KICK</span><span>LEAVES</span><span>GLASS</span><span>RAIN</span></div><div className="xp-pads">{Array.from({length:32}).map((_,i)=><i className={(i+index)%3===0?"on":""} key={i}/>)}</div><footer><b>▶</b><span>{label}</span><i>4 / 4</i></footer></main></div>;
    case 6: return <div className={`app-screen xp-tiltgame ${variant}`} aria-hidden="true"><header><span>ROUND 3</span><b>TINY KEEPER</b><strong>2–2</strong></header><main><div className="xp-net" /><span className="xp-glove left">◖</span><span className="xp-glove right">◗</span><b className="xp-shot" /><footer>TILT TO SAVE · {label}</footer></main></div>;
    case 7: return <div className={`app-screen xp-wander ${variant}`} aria-hidden="true"><div className="xp-wander-map" /><header><b>wrong turn</b><span>WANDER MODE ON</span></header><div className="xp-wander-route"><i /><i /><i /></div><span className="xp-wander-user">➤</span><section><small>NEXT DETOUR</small><strong>{label}</strong><span>+7 min · worth it</span></section></div>;
    case 8: return <div className={`app-screen xp-charge ${variant}`} aria-hidden="true"><aside><b>low<br/>battery</b><span>Map</span><span>Saved</span><span>History</span></aside><main><header><small>BATTERY</small><strong>{value}%</strong><span>⌕ nearby</span></header><div className="xp-charge-map"><i /><i /><i /><b>⚡</b><b>⚡</b><b>⚡</b></div><footer>{label}<span>4 min walk</span></footer></main></div>;
    default: return <div className={`app-screen xp-tactics ${variant}`} aria-hidden="true"><header><b>HALF TIME</b><span>SECOND-HALF PLAN</span><strong>45:00</strong></header><main><div className="xp-tactics-pitch"><i/><i/><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span><b/><b/><b/></div><section><small>ONE MOVE</small><strong>{label}</strong><span>Press high · overload left</span></section></main></div>;
  }
}

export function ProjectPreview({ type, title }: { type: string; title?: string }) {
  if (type.startsWith("mock-")) {
    const index = Number(type.slice(5)) || 0;
    return <ExploreAppPreview index={index} />;
  }
  if (type === "flight") return (
    <div className="app-screen simulator-screen" aria-hidden="true">
      <div className="sim-world" />
      <div className="sim-command"><span>▶ &nbsp;CONTROLS</span><div><b>◉</b><b>⌁</b><b>Ⅱ</b></div></div>
      <div className="sim-compass-bar"><span>180</span><i /><span>SW</span><i /><strong>240</strong><i /><span>W</span><i /><span>300</span></div>
      <div className="sim-side-data left">
        <small>SPEED</small><div className="sim-value"><strong className="danger">52</strong><b>KTS</b></div><small>ALTITUDE</small><div className="sim-value"><strong>1,464</strong><b>FT</b></div><span>AGL&nbsp; 1,443 FT</span><span>V/S&nbsp; +999 FT/MIN</span><span>PITCH&nbsp; +20 DEG</span>
      </div>
      <div className="sim-side-data right">
        <small>HEADING</small><div className="sim-value"><strong>256</strong><b>DEG</b></div><small>THROTTLE</small><div className="sim-value"><strong>100</strong><b>%</b></div><span>FUEL&nbsp; 26.5 GAL</span><span>ENGINE&nbsp; 2674 RPM</span><span>WIND&nbsp; 359/2 KTS</span>
      </div>
      <div className="sim-attitude"><div className="attitude-sky" /><div className="attitude-ground" /><i /><b>⌄</b><span>20</span><small>10</small></div>
      <div className="sim-radio">● COM1 &nbsp; 131.325</div>
    </div>
  );
  if (type === "soccer") return (
    <div className="app-screen touchline-screen" aria-hidden="true">
      <div className="touchline-score"><div><span>RIV</span><b>Rovers</b></div><strong>2&nbsp; : &nbsp;1</strong><div><span>SUN</span><b>Sunday FC</b></div><small>78:42</small></div>
      <div className="touchline-stadium"><span /><span /><span /><span /><span /><span /><span /><span /></div>
      <div className="touchline-pitch"><i className="tl-half" /><i className="tl-circle" /><i className="tl-box left" /><i className="tl-box right" />
        <span className="tl-player blue a1">7</span><span className="tl-player blue a2">10</span><span className="tl-player blue a3">4</span><span className="tl-player blue a4">2</span>
        <span className="tl-player red b1">9</span><span className="tl-player red b2">11</span><span className="tl-player red b3">6</span><span className="tl-player red b4">3</span><b className="tl-ball" />
      </div>
      <div className="touchline-controls"><span><b>◉</b> MOVE</span><span><b>×</b> PASS</span><span><b>●</b> SHOOT</span></div>
      <div className="touchline-radar"><i /><i /><i /><i /><i /><i /></div>
    </div>
  );
  if (type === "navigation") return (
    <div className="app-screen wayfinder-screen" aria-hidden="true">
      <div className="wayfinder-map sf-map">
        <div className="sf-water"><span>SAN FRANCISCO BAY</span></div>
        <div className="sf-park"><span>RINCON HILL<br />DOG PARK</span></div>
        <div className="sf-buildings"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
        <i className="sf-street market" /><i className="sf-street mission" /><i className="sf-street folsom" /><i className="sf-street harrison" />
        <i className="sf-street beale" /><i className="sf-street main" /><i className="sf-street spear" /><i className="sf-street first" />
        <i className="sf-street bryant" /><i className="sf-street embarcadero" />
        <i className="sf-highway bridge" /><i className="sf-highway ramp-one" /><i className="sf-highway ramp-two" />
        <i className="sf-pier pier-26" /><i className="sf-pier pier-28" /><i className="sf-pier pier-30" />
        <small className="sf-label folsom-label">FOLSOM ST</small><small className="sf-label harrison-label">HARRISON ST</small>
        <small className="sf-label beale-label">BEALE ST</small><small className="sf-label main-label">MAIN ST</small>
        <small className="sf-label spear-label">SPEAR ST</small><small className="sf-label embarcadero-label">THE EMBARCADERO</small>
        <small className="sf-district soma">RINCON HILL</small><small className="sf-district pier-label">PIER 28</small>
        <div className="sf-route folsom-route" /><div className="sf-route beale-route" /><div className="sf-route embarcadero-route" />
        <i className="sf-route-node n1" /><i className="sf-route-node n2" /><i className="sf-route-node n3" />
        <span className="way-user sf-user">➤</span><span className="way-destination sf-destination"><b>●</b></span>
      </div>
      <div className="wayfinder-brand"><b>bearings</b><span>San Francisco, CA</span></div>
      <div className="wayfinder-search"><span>⌕</span><b>Pier 28</b><i>⌘ K</i></div>
      <div className="wayfinder-weather"><span>17:42</span><b>58°</b><small>west wind</small></div>
      <div className="wayfinder-guidance"><div className="way-turn">↱</div><div><small>THEN, IN 600 FT</small><strong>Turn right on Beale Street</strong><span>Continue toward the Embarcadero</span></div></div>
      <div className="wayfinder-status"><span><b>9</b> min</span><span><b>0.7</b> mi</span><span><b>5:51</b> arrival</span><strong>•••</strong></div>
    </div>
  );
  if (type === "sundial") return (
    <div className="app-screen sundial-screen" aria-hidden="true">
      <div className="screen-bar"><i /><i /><i /><b>Today</b></div>
      <div className="sun-time">4:28</div><div className="sun-orbit"><span>deep work</span><b /></div>
      <div className="screen-caption">Tuesday · 6h 42m intentional</div>
    </div>
  );
  if (type === "fieldnotes") return (
    <div className="app-screen notes-screen" aria-hidden="true">
      <div className="note-sidebar"><strong>fieldnotes</strong><span>Inbox</span><span>Garden</span><span>Archive</span></div>
      <div className="note-page"><small>JUL 18 · 11:42 PM</small><h3>Things I noticed on the walk home</h3><p>The city gets quieter one block at a time.</p><p className="cursor-line">The best ideas arrive without a notification.</p></div>
    </div>
  );
  if (type === "leaf") return (
    <div className="app-screen leaf-screen" aria-hidden="true">
      <div className="leaf-top">loose leaf <span>12 fragments</span></div>
      <div className="fragment f-one">“Make it useful,<br />then make it odd.”</div><div className="fragment f-two">colors for<br />late summer</div><div className="fragment f-three">↳ read later</div>
    </div>
  );
  if (type === "index") return (
    <div className="app-screen commonplace-screen" aria-hidden="true">
      <aside className="common-sidebar"><strong>commonplace</strong><span className="active">⌘ &nbsp;Library</span><span>☆ &nbsp;Favorites</span><span>◴ &nbsp;Recently added</span><small>SPACES</small><span>Design systems</span><span>Things to revisit</span><span>Reading notes</span><b>AB</b></aside>
      <div className="common-main"><div className="common-top"><div><small>LIBRARY</small><strong>Things worth keeping</strong></div><span>⌕ Search anything</span><b>＋ New note</b></div>
        <div className="common-filter"><span className="active">All</span><span>Notes</span><span>Images</span><span>Links</span><b>Sorted by recent⌄</b></div>
        <div className="common-grid">
          <article className="common-card quote"><small>THOUGHT</small><strong>“Good tools disappear at exactly the right moment.”</strong><span>Today · 4:18 PM</span></article>
          <article className="common-card image"><div /><small>REFERENCE</small><strong>Color found on the walk home</strong><span>Yesterday</span></article>
          <article className="common-card list"><small>TO RETURN TO</small><strong>Small interfaces</strong><span>01&nbsp; Calm technology</span><span>02&nbsp; Local-first software</span><span>03&nbsp; Useful friction</span></article>
          <article className="common-card link"><small>ARE.NA</small><strong>Ways of organizing without folders ↗</strong><span>3 min read</span></article>
        </div>
      </div>
    </div>
  );
  if (type === "hush") return (
    <div className="app-screen hush-dashboard" aria-hidden="true">
      <aside className="hush-nav"><strong>hush<span>●</span></strong><i>⌁</i><i>◫</i><i>◴</i><i>⚙</i><b>JB</b></aside>
      <div className="hush-main"><div className="hush-head"><div><small>LIVE MONITOR</small><strong>Studio</strong></div><span><i /> Recording</span><b>•••</b></div>
        <div className="hush-panels"><section className="hush-meter"><small>CURRENT LEVEL</small><div className="hush-ring"><strong>34</strong><span>dB</span><i /></div><p><b /> Quiet enough to focus</p></section>
          <section className="hush-wave"><div><small>LAST 60 SECONDS</small><span>Peak 51 dB</span></div><div className="hush-bars">{[14,22,31,18,42,25,54,38,29,19,24,47,39,28,16,21,33,26,45,20,17,32,23,18].map((height, i) => <i key={i} style={{height:`${height}%`}} />)}</div><footer><span>60s</span><span>30s</span><span>now</span></footer></section>
        </div>
        <div className="hush-rooms"><span><b>Studio</b><small>34 dB · Quiet</small></span><span><b>Kitchen</b><small>48 dB · Moderate</small></span><span><b>Street</b><small>67 dB · Loud</small></span></div>
      </div>
    </div>
  );
  return (
    <div className="app-screen radio-player" aria-hidden="true">
      <aside className="radio-sidebar"><strong>radio<br />silence</strong><span className="active">◉ &nbsp;Listen now</span><span>⌁ &nbsp;Stations</span><span>♡ &nbsp;Saved</span><small>YOUR SIGNALS</small><span>Soft Focus</span><span>Night Drive</span><span>Deep Work</span><b>EM</b></aside>
      <div className="radio-content"><div className="radio-nav"><span>‹ &nbsp; ›</span><b>Live from nowhere in particular</b><i>⌕</i></div>
        <div className="radio-feature"><div className="radio-art"><i /><i /><i /><b>94.2</b></div><div className="radio-copy"><small>LIVE · AMBIENT</small><h3>Soft Focus</h3><p>Slow electronics for clear thinking.</p><span>12.4k listening now</span><div className="radio-actions"><b>Ⅱ</b><span>♡</span><span>•••</span></div></div></div>
        <div className="radio-queue"><div><small>UP NEXT</small><b>View queue</b></div><span><i className="cover one" /><strong>Glass Rooms<small>Mira North</small></strong><b>4:12</b></span><span><i className="cover two" /><strong>Low Orbit<small>After Hours</small></strong><b>6:48</b></span></div>
      </div>
      <div className="radio-playing"><span><i /><strong>Soft Focus<small>Radio Silence</small></strong></span><div><b>↶</b><b>Ⅱ</b><b>↷</b></div><div className="radio-progress"><i /><span>19:42</span><span>∞</span></div><b>⌁ &nbsp;▰</b></div>
    </div>
  );
}
