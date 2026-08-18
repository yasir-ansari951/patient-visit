/* ================================================================
   CHARTS.JS – All Chart.js render functions
   ================================================================ */
const RAINBOW = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899'];

const charts = {
  instances: {},

  isDark: () => document.documentElement.classList.contains('dark'),
  gridColor: () => charts.isDark() ? 'rgba(148,163,184,0.12)' : '#f1f5f9',
  tickColor: () => charts.isDark() ? '#94a3b8' : '#64748b',

  renderAll: function(patients) {
    Chart.defaults.color = this.tickColor();
    this.renderDailyVisits(patients);
    this.renderMonthlyRevenue(patients);
    this.renderAgeDistribution(patients);
    this.renderVisitReasons(patients);
  },

  renderDailyVisits: function(patients) {
    const ctx = document.getElementById('chart-daily-visits');
    if (!ctx) return;
    const labels = [], dataPoints = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate()-i);
      const dateStr = d.toDateString();
      labels.push(d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}));
      dataPoints.push(patients.filter(p => new Date(p.visitDate).toDateString() === dateStr).length);
    }
    if (this.instances.daily) this.instances.daily.destroy();
    this.instances.daily = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label:'Patient Visits', data: dataPoints,
          borderColor:'#8b5cf6', backgroundColor:'rgba(139,92,246,0.10)',
          borderWidth:3, fill:true, tension:0.35,
          pointBackgroundColor: RAINBOW.slice(0,7), pointBorderColor:'#ffffff',
          pointBorderWidth:1.5, pointRadius:5, pointHoverRadius:7
        }]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:{backgroundColor:'#1e293b',padding:10,cornerRadius:8, callbacks:{label: c => `${c.raw} Visit${c.raw===1?'':'s'}` } } },
        scales:{ y:{beginAtZero:true, ticks:{precision:0, font:{size:11}}, grid:{color:this.gridColor()}}, x:{grid:{display:false}, ticks:{font:{size:10}} } }
      }
    });
  },

  renderMonthlyRevenue: function(patients) {
    const ctx = document.getElementById('chart-monthly-revenue');
    if (!ctx) return;
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const labels = [], dataPoints = [];
    for (let i=5;i>=0;i--) {
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      labels.push(`${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`);
      let rev=0;
      patients.forEach(p => { const pd=new Date(p.visitDate); if(pd.getMonth()===d.getMonth() && pd.getFullYear()===d.getFullYear()) rev+=Number(p.fee)||0; });
      dataPoints.push(rev);
    }
    if (this.instances.monthly) this.instances.monthly.destroy();
    this.instances.monthly = new Chart(ctx, {
      type:'bar',
      data:{ labels, datasets:[{ label:'Revenue (PKR)', data:dataPoints, backgroundColor:['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6'], hoverBackgroundColor:['#dc2626','#ea580c','#ca8a04','#16a34a','#2563eb','#7c3aed'], borderRadius:8, borderSkipped:false }] },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:{backgroundColor:'#1e293b',padding:10,cornerRadius:8, callbacks:{label:c=>`Rs. ${c.raw.toLocaleString()}`}} },
        scales:{ y:{beginAtZero:true, ticks:{font:{size:10},callback:v=>'Rs. '+(v>=1000?(v/1000)+'k':v)}, grid:{color:this.gridColor()}}, x:{grid:{display:false},ticks:{font:{size:11}}} }
      }
    });
  },

  renderAgeDistribution: function(patients) {
    const ctx = document.getElementById('chart-age-distribution');
    if (!ctx) return;
    const brackets = {'0-18 Yrs':0,'19-35 Yrs':0,'36-50 Yrs':0,'51-65 Yrs':0,'65+ Yrs':0};
    patients.forEach(p => { const a=Number(p.age); if(a<=18) brackets['0-18 Yrs']++; else if(a<=35) brackets['19-35 Yrs']++; else if(a<=50) brackets['36-50 Yrs']++; else if(a<=65) brackets['51-65 Yrs']++; else brackets['65+ Yrs']++; });
    if (this.instances.age) this.instances.age.destroy();
    this.instances.age = new Chart(ctx, {
      type:'doughnut',
      data:{ labels:Object.keys(brackets), datasets:[{ data:Object.values(brackets), backgroundColor:['#ef4444','#f97316','#eab308','#22c55e','#3b82f6'], borderWidth:2, borderColor:this.isDark()?'#16202f':'#ffffff' }] },
      options:{
        responsive:true, maintainAspectRatio:false, cutout:'65%',
        plugins:{ legend:{position:'right',labels:{boxWidth:12,font:{size:11}}}, tooltip:{backgroundColor:'#1e293b',padding:10,cornerRadius:8, callbacks:{label:c=>`${c.label}: ${c.raw} Patient${c.raw===1?'':'s'}`}} }
      }
    });
  },

  renderVisitReasons: function(patients) {
    const ctx = document.getElementById('chart-visit-reasons');
    if (!ctx) return;
    const reasonCounts = {};
    patients.forEach(p => { reasonCounts[p.reason] = (reasonCounts[p.reason]||0)+1; });
    const sorted = Object.entries(reasonCounts).sort((a,b)=>b[1]-a[1]).slice(0,6);
    const labels = sorted.map(i=>i[0]), data = sorted.map(i=>i[1]);
    if (this.instances.reasons) this.instances.reasons.destroy();
    this.instances.reasons = new Chart(ctx, {
      type:'bar',
      data:{ labels, datasets:[{ label:'Visits', data, backgroundColor: RAINBOW.slice(0,data.length), borderRadius:6 }] },
      options:{
        indexAxis:'y', responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:{backgroundColor:'#1e293b',padding:10,cornerRadius:8, callbacks:{label:c=>`${c.raw} Consultation${c.raw===1?'':'s'}`}} },
        scales:{ x:{beginAtZero:true, ticks:{precision:0,font:{size:10}}, grid:{color:this.gridColor()}}, y:{grid:{display:false},ticks:{font:{size:11}}} }
      }
    });
  }
};
