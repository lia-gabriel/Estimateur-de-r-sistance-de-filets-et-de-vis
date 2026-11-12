const mats={Acier:300, "Acier Inox":400, Aluminium:207, Brass:205, HDPE:23, Onyx:25, "PC ABS":25};
const metricClasses={"8.8":462,"10.9":577,"12.9":693};
const imperialClasses={UNC:{2:74,5:120,8:150},UNF:{2:74,5:120,8:150}};
const mc={M2:{p:.4,d:1.567},"M2.5":{p:.45,d:2.06},M3:{p:.5,d:2.459},M4:{p:.7,d:3.242},M5:{p:.8,d:4.134},M6:{p:1,d:4.917},M7:{p:1,d:5.708},M8:{p:1.25,d:6.647},M9:{p:1.25,d:7.508},M10:{p:1.5,d:8.16}};
const mf={M2:{p:.25,d:1.73},"M2.5":{p:.35,d:2.13},M3:{p:.35,d:2.62},M4:{p:.5,d:3.38},M5:{p:.5,d:4.48},M6:{p:.75,d:5.19},M7:{p:.75,d:6.21},M8:{p:1,d:6.92},M9:{p:1,d:7.91},M10:{p:1.25,d:8.47}};
const unc={"#2-56":{p:.454,d:1.88},"#4-40":{p:.635,d:2.9},"#6-32":{p:.794,d:3.73},"#8-32":{p:.794,d:4.65},"#10-24":{p:1.058,d:3.91},"1/4-20":{p:1.27,d:4.72},"5/16-18":{p:1.411,d:6.07},"3/8-16":{p:1.588,d:7.76},"1/2-13":{p:1.954,d:10.86}};
const unf={"#2-64":{p:.397,d:1.94},"#4-48":{p:.529,d:3.08},"#6-40":{p:.635,d:3.75},"#8-36":{p:.794,d:4.83},"#10-32":{p:.794,d:4.17},"1/4-28":{p:.907,d:5.16},"5/16-24":{p:1.058,d:6.63},"3/8-24":{p:1.058,d:8.51},"1/2-20":{p:1.27,d:11.68}};
const mmToIn=0.03937007874015748;
const inToMm=25.4;
const mm2ToIn2=0.0015500031;
const MPaToKsi=0.145037737729;
const kNToKip=0.2248089431;

function renderMaterialOptions(){
  const current = material.value || Object.keys(mats)[0];
  material.innerHTML = '';
  Object.entries(mats).forEach(([name, value]) => {
    const option = document.createElement('option');
    const strengthValue = isImperial() ? (value * MPaToKsi).toFixed(2) : Math.round(value);
    const unit = isImperial() ? 'ksi' : 'MPa';
    option.value = name;
    option.textContent = `${name} ${strengthValue} ${unit}`;
    material.appendChild(option);
  });
  material.value = Object.prototype.hasOwnProperty.call(mats, current) ? current : Object.keys(mats)[0];
}

function isImperial(){return unitSystem.value === 'imperial';}
function getClassMapForThread(threadType){
  if(isImperial()) return imperialClasses[threadType] || imperialClasses.UNC;
  return metricClasses;
}
function updateClassLabels(){
  const labelText = isImperial() ? 'Grade' : 'Classe';
  const class1Label = document.getElementById('class1Label');
  const class2Label = document.getElementById('class2Label');
  if (class1Label) class1Label.textContent = labelText;
  if (class2Label) class2Label.textContent = labelText;
}
function getDefaultClassForThread(threadType){
  const map = getClassMapForThread(threadType);
  if(!isImperial()) return metricClasses['12.9'] ? '12.9' : (Object.keys(map).at(-1) || '12.9');
  const keys = Object.keys(map);
  return keys[keys.length - 1] || '8';
}
function getClassStrength(threadType, className){
  if(isImperial()) return imperialClasses[threadType]?.[className] || imperialClasses.UNC[8];
  return metricClasses[className] || metricClasses['12.9'];
}
function loadClassOptions(){
  const classMap1 = getClassMapForThread(type1.value);
  const classMap2 = getClassMapForThread(type2.value);
  class1.innerHTML='';
  class2.innerHTML='';

  Object.keys(classMap1).forEach((key) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key;
    class1.appendChild(option);
  });
  Object.keys(classMap2).forEach((key) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key;
    class2.appendChild(option);
  });

  if (!isImperial()) {
    class1.value = '12.9';
    class2.value = '12.9';
  } else {
    class1.value = Object.prototype.hasOwnProperty.call(classMap1, class1.value) ? class1.value : getDefaultClassForThread(type1.value);
    class2.value = Object.prototype.hasOwnProperty.call(classMap2, class2.value) ? class2.value : getDefaultClassForThread(type2.value);
  }

  renderClassToggleButtons('class1');
  renderClassToggleButtons('class2');
}
function db(t){if(isImperial()) return t === 'UNF' ? unf : unc; return t === 'Fin' ? mf : mc;}
function fill(sel,data){
  sel.innerHTML='';
  Object.entries(data).forEach(([key, value]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = isImperial() ? key : `${key} x ${value.p}`;
    sel.appendChild(option);
  });
}

function setThicknessDisplayFromMm(mmValue){
  const useImperial = isImperial();
  const value = useImperial ? mmValue / inToMm : mmValue;
  thickness.dataset.unit = useImperial ? 'imperial' : 'metric';
  thickness.value = Number.isFinite(value) ? value.toFixed(useImperial ? 3 : 2).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : 0;
}

function getThicknessMm(){
  const raw=Number(thickness.value);
  if(!Number.isFinite(raw)) return 0;
  const unit = thickness.dataset.unit || 'metric';
  return unit === 'imperial' ? raw * inToMm : raw;
}

function syncThicknessForSelectedUnit(){
  const current = Number(thickness.value);
  if(!Number.isFinite(current)) return;
  const currentUnit = thickness.dataset.unit || 'metric';
  const thicknessMm = currentUnit === 'imperial' ? current * inToMm : current;
  setThicknessDisplayFromMm(thicknessMm);
  thicknessLabel.textContent = isImperial() ? 'Épaisseur (po)' : 'Épaisseur (mm)';
}

function setToggleState(selectId, value){
  const seg = document.querySelector(`.segmented[data-target="${selectId}"]`);
  const buttons = seg ? seg.querySelectorAll('.toggle-option') : [];
  const select = document.getElementById(selectId);
  const options = select ? Array.from(select.options) : [];

  buttons.forEach((btn, idx) => {
    const option = options[idx];
    const targetValue = option?.value || btn.dataset.value;
    const displayText = option?.textContent || targetValue;
    btn.dataset.value = targetValue;
    btn.textContent = displayText;
    const active = targetValue === value;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function renderClassToggleButtons(selectId){
  const select = document.getElementById(selectId);
  const values = Array.from(select.options).map(option => option.value);
  const existingSeg = document.querySelector(`.segmented[data-target="${selectId}"]`);
  if (existingSeg && existingSeg.classList.contains('class-toggle')) {
    existingSeg.remove();
  }

  const seg = document.createElement('div');
  seg.className = 'segmented class-toggle';
  seg.dataset.target = selectId;

  values.forEach((value) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toggle-option';
    btn.dataset.value = value;
    btn.textContent = value;
    btn.addEventListener('click', () => {
      select.value = value;
      setToggleState(selectId, value);
      calc();
    });
    seg.appendChild(btn);
  });

  select.parentNode.insertBefore(seg, select);
  setToggleState(selectId, select.value);
}

function resetDefaults(){
  unitSystem.value = 'metric';
  renderMaterialOptions();
  material.value = 'Aluminium';
  thickness.value = '6';
  thickness.dataset.unit = 'metric';
  sf.value = '1';

  type1.innerHTML = '<option>Grossier</option><option>Fin</option>';
  type2.innerHTML = '<option>Grossier</option><option>Fin</option>';
  type1.value = 'Grossier';
  type2.value = 'Grossier';

  qty1.value = '4';
  qty2.value = '2';
  class1.value = '12.9';
  class2.value = '12.9';
  delete size1.dataset.initialized;
  delete size2.dataset.initialized;
  setToggleState('unitSystem', unitSystem.value);
  setToggleState('type1', type1.value);
  setToggleState('type2', type2.value);
  updateClassLabels();
}

function loadTypes(){
  const imp=isImperial();
  type1.innerHTML=type2.innerHTML=imp?'<option>UNC</option><option>UNF</option>':'<option>Grossier</option><option>Fin</option>';
  const type1Value = type1.value || (imp ? 'UNC' : 'Grossier');
  const type2Value = type2.value || (imp ? 'UNF' : 'Fin');
  type1.value = type1Value;
  type2.value = type2Value;
  renderMaterialOptions();
  loadClassOptions();
  if (!isImperial()) {
    class1.value = '12.9';
    class2.value = '12.9';
    setToggleState('class1', class1.value);
    setToggleState('class2', class2.value);
  }
  setToggleState('unitSystem', unitSystem.value);
  setToggleState('type1', type1.value);
  setToggleState('type2', type2.value);
  updateClassLabels();
  thicknessLabel.textContent = imp ? 'Épaisseur (po)' : 'Épaisseur (mm)';
  syncThicknessForSelectedUnit();
  loadSizes();
}

function loadSizes(){
  fill(size1,db(type1.value));
  fill(size2,db(type2.value));

  if (size1.dataset.initialized !== 'true') {
    size1.value = 'M4';
    size1.dataset.initialized = 'true';
  } else if (!Object.keys(db(type1.value)).includes(size1.value)) {
    size1.value = 'M4';
  }

  if (size2.dataset.initialized !== 'true') {
    size2.value = 'M6';
    size2.dataset.initialized = 'true';
  } else if (!Object.keys(db(type2.value)).includes(size2.value)) {
    size2.value = 'M6';
  }

  calc();
}

function formatDisplay(value,type){
  const out = isImperial() ? (type === 'length' ? value * mmToIn : type === 'area' ? value * mm2ToIn2 : type === 'force' ? value * kNToKip : value * MPaToKsi) : value;
  const decimals = isImperial() ? 3 : 2;
  if(type === 'length') return out.toFixed(decimals);
  if(type === 'area') return out.toFixed(decimals);
  if(type === 'force') return out.toFixed(decimals);
  if(type === 'stress') return out.toFixed(2);
  return out.toFixed(decimals);
}

function toneClass(v1,v2){
  if(v1 === v2) return 'tone-equal';
  return v1 < v2 ? 'tone-low' : 'tone-high';
}

function scenario(type,size,qty,cl){
  const D=db(type)[size];
  const t=getThicknessMm();
  const e=t-2*D.p;
  const thr=e/D.p;
  const ta=Math.PI*D.d*e*qty;
  const tf=ta*mats[material.value]/(+sf.value)/1000;
  const ba=(Math.PI/4)*D.d*D.d*qty;
  const classStrength = getClassStrength(type, cl);
  const bf=ba*classStrength/(+sf.value)/1000;
  return {
    e,
    thr,
    ta,
    tf,
    ba,
    bf,
    thickness:t,
    pitch:D.p,
    diameter:D.d,
    quantity:qty,
    materialStrength:mats[material.value],
    classStrength,
    safetyFactor:+sf.value
  };
}

function buildTooltip(displayValue, formula, values) {
  return `
    <span class="tooltip-wrap" tabindex="0" title="${formula} • ${values}">
      <span class="tooltip-value">${displayValue}</span>
      <span class="tooltip-box">
        <span class="tooltip-title">Formule détaillée</span><br>
        ${formula}<br>
        <span class="tooltip-title">Valeurs</span><br>
        ${values}
      </span>
    </span>
  `;
}

function formatScenarioSummary(scenario, label, compareTo){
  const lengthUnit=isImperial()?'po':'mm';
  const areaUnit=isImperial()?'po²':'mm²';
  const forceUnit=isImperial()?'kip':'kN';

  const forceFiletsPct = compareTo ? ((scenario.tf - compareTo.tf) / compareTo.tf * 100).toFixed(0) : null;
  const forceVisPct = compareTo ? ((scenario.bf - compareTo.bf) / compareTo.bf * 100).toFixed(0) : null;

  return `<table><colgroup><col style="width:50%"><col style="width:30%"><col style="width:20%"></colgroup><thead><tr><th colspan="3">${label}</th></tr></thead><tbody>
    <tr><td style="width:50%">Longueur d'engagement</td><td style="width:30%" class="${toneClass(scenario.e, compareTo ? compareTo.e : scenario.e)}">${buildTooltip(`${formatDisplay(scenario.e,'length')} ${lengthUnit}`, 'Longueur d\'engagement = Épaisseur - (Pas × 2)', `Épaisseur = ${formatDisplay(scenario.thickness,'length')} ${lengthUnit}; Pas = ${formatDisplay(scenario.pitch,'length')} ${lengthUnit}`)}</td><td style="width:20%; min-width:60px; text-align:center"></td></tr>
    <tr><td style="width:50%">Filets engagés</td><td style="width:30%" class="${toneClass(scenario.thr, compareTo ? compareTo.thr : scenario.thr)}">${buildTooltip(`${scenario.thr.toFixed(2)}`, 'Filets engagés = Longueur d\'engagement / Pas', `Longueur d'engagement = ${formatDisplay(scenario.e,'length')} ${lengthUnit}; Pas = ${formatDisplay(scenario.pitch,'length')} ${lengthUnit}`)}</td><td style="width:20%; min-width:60px; text-align:center"></td></tr>
    <tr><td style="width:50%">Surface de cisaillement des filets</td><td style="width:30%" class="${toneClass(scenario.ta, compareTo ? compareTo.ta : scenario.ta)}">${buildTooltip(`${formatDisplay(scenario.ta,'area')} ${areaUnit}`, 'Surface de cisaillement des filets = π × Diamètre mineur × Longueur d\'engagement × Quantité', `d = ${formatDisplay(scenario.diameter,'length')} ${lengthUnit}; e = ${formatDisplay(scenario.e,'length')} ${lengthUnit}; q = ${scenario.quantity}`)}</td><td style="width:20%; min-width:60px; text-align:center"></td></tr>
    <tr><td style="width:50%">Force maximale des filets</td><td style="width:30%" class="${compareTo ? toneClass(scenario.tf, compareTo.tf) : ''}">${buildTooltip(`${formatDisplay(scenario.tf,'force')} ${forceUnit}`, 'Force maximale des filets = Surface de cisaillement × Résistance au cisaillement du matériau / Facteur de sécurité / 1000', `Surface = ${formatDisplay(scenario.ta,'area')} ${areaUnit}; σ = ${formatDisplay(scenario.materialStrength,'stress')} ${isImperial() ? 'ksi' : 'MPa'}; sf = ${scenario.safetyFactor}`)}</td><td style="width:20%; min-width:60px; text-align:center" class="${compareTo ? toneClass(scenario.tf, compareTo.tf) : ''}">${compareTo ? `${forceFiletsPct}%` : ''}</td></tr>
    <tr class="section-separator"><td colspan="3" style="text-align:center; font-weight:bold;">Cisaillement des vis</td></tr>
    <tr><td style="width:50%">Surface de cisaillement des vis</td><td style="width:30%" class="${toneClass(scenario.ba, compareTo ? compareTo.ba : scenario.ba)}">${buildTooltip(`${formatDisplay(scenario.ba,'area')} ${areaUnit}`, 'Surface de cisaillement des vis = (π / 4) × Diamètre² × Quantité', `d = ${formatDisplay(scenario.diameter,'length')} ${lengthUnit}; q = ${scenario.quantity}`)}</td><td style="width:20%; min-width:60px; text-align:center"></td></tr>
    <tr><td style="width:50%">Force maximale avant cisaillement</td><td style="width:30%" class="${compareTo ? toneClass(scenario.bf, compareTo.bf) : ''}">${buildTooltip(`${formatDisplay(scenario.bf,'force')} ${forceUnit}`, 'Force maximale avant cisaillement = Surface de cisaillement des vis × Résistance au cisaillement de la vis / Facteur de sécurité / 1000', `Surface = ${formatDisplay(scenario.ba,'area')} ${areaUnit}; σ = ${formatDisplay(scenario.classStrength,'stress')} ${isImperial() ? 'ksi' : 'MPa'}; sf = ${scenario.safetyFactor}`)}</td><td style="width:20%; min-width:60px; text-align:center" class="${compareTo ? toneClass(scenario.bf, compareTo.bf) : ''}">${compareTo ? `${forceVisPct}%` : ''}</td></tr>
  </tbody></table>`;
}

function syncQuantityControl(rangeId, manualId){
  const range = document.getElementById(rangeId);
  const manual = document.getElementById(manualId);
  if (!range || !manual) return;

  const value = Math.max(1, Number(range.value) || 1);
  range.value = value;
  manual.value = value;
}

function updateQuantityBadge(rangeId, manualId){
  const range = document.getElementById(rangeId);
  const manual = document.getElementById(manualId);
  if (!range || !manual) return;

  const min = Number(range.min) || 1;
  const max = Number(range.max) || 10;
  const rawValue = Number(range.value) || min;
  const value = Math.min(max, Math.max(min, rawValue));
  const containerWidth = range.offsetWidth || 1;
  const badgeWidth = manual.offsetWidth || 54;
  const minLeft = (badgeWidth / 2 / containerWidth) * 100;
  const maxLeft = 100 - minLeft;
  const percent = ((value - min) / (max - min)) * 100;
  manual.style.left = `${Math.min(Math.max(percent, minLeft), maxLeft)}%`;
  manual.value = value;
}

function bindQuantityControls(rangeId, manualId){
  const range = document.getElementById(rangeId);
  const manual = document.getElementById(manualId);
  if (!range || !manual) return;

  const syncFromRange = () => {
    const value = Math.max(1, Number(range.value) || 1);
    range.value = value;
    updateQuantityBadge(rangeId, manualId);
    calc();
  };

  const syncFromManual = () => {
    const value = Math.max(1, Number(manual.value) || 1);
    manual.value = value;
    range.value = Math.min(10, value);
    updateQuantityBadge(rangeId, manualId);
    calc();
  };

  range.addEventListener('input', syncFromRange);
  manual.addEventListener('input', syncFromManual);
  updateQuantityBadge(rangeId, manualId);
}

function calc(){
  if(!thickness.dataset.unit) thickness.dataset.unit='metric';
  matStrength.textContent='';
  const qty1Value = Math.max(1, Number(qty1Manual.value) || Number(qty1.value) || 1);
  const qty2Value = Math.max(1, Number(qty2Manual.value) || Number(qty2.value) || 1);
  qty1.value = Math.min(10, qty1Value);
  qty2.value = Math.min(10, qty2Value);
  qty1Manual.value = qty1Value;
  qty2Manual.value = qty2Value;
  const a=scenario(type1.value,size1.value,qty1Value,class1.value);
  const b=scenario(type2.value,size2.value,qty2Value,class2.value);
  const scenario1Total = a.tf + a.bf;
  const scenario2Total = b.tf + b.bf;
  const winningScenario = scenario1Total >= scenario2Total ? 1 : 2;

  document.getElementById('scenario1Results').innerHTML = formatScenarioSummary(a, 'Filets plaque', b, 'Scénario 2');
  document.getElementById('scenario2Results').innerHTML = formatScenarioSummary(b, 'Filets plaque', a, 'Filets plaque');

  document.querySelectorAll('.scenario-column').forEach(column => {
    column.classList.toggle('winner-column', column.id === `scenario${winningScenario}Column`);
  });
}

document.addEventListener('click', event => {
  const btn = event.target.closest('.toggle-option');
  if (!btn) return;

  const seg = btn.closest('.segmented');
  if (!seg) return;

  const select = document.getElementById(seg.dataset.target);
  if (!select) return;

  select.value = btn.dataset.value;
  setToggleState(seg.dataset.target, select.value);

  if (seg.dataset.target === 'unitSystem') {
    loadTypes();
    return;
  }

  if(['type1','type2'].includes(seg.dataset.target)) {
    loadClassOptions();
    loadSizes();
    return;
  }

  if(['class1','class2'].includes(seg.dataset.target)) {
    calc();
  }
});

document.addEventListener('input',e=>{
  if (e.target.id === 'qty1' || e.target.id === 'qty2') {
    const isRange = e.target.type === 'range';
    const target = isRange ? e.target.id : e.target.id.replace('Manual','');
    const range = document.getElementById(target);
    const manual = document.getElementById(`${target}Manual`);
    if (range && manual) {
      if (isRange) {
        manual.value = range.value;
        updateQuantityBadge(target, `${target}Manual`);
      } else {
        range.value = Math.min(10, Number(manual.value) || 1);
        updateQuantityBadge(target, `${target}Manual`);
      }
    }
  }
  calc();
});
document.addEventListener('change',e=>{
  if(['unitSystem','type1','type2'].includes(e.target.id)){
    if(e.target.id === 'unitSystem') loadTypes();
    else {
      setToggleState(e.target.id, e.target.value);
      loadClassOptions();
      loadSizes();
    }
  } else if(['class1','class2'].includes(e.target.id)) {
    setToggleState(e.target.id, e.target.value);
    calc();
  }
  if(['unitSystem','type1','type2'].includes(e.target.id)) calc();
});

bindQuantityControls('qty1', 'qty1Manual');
bindQuantityControls('qty2', 'qty2Manual');
thickness.dataset.unit='metric';
resetDefaults();
loadTypes();