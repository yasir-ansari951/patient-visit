/* ================================================================
   REPORTS.JS – Report generation, CSV export, print handler
   ================================================================ */
const reports = {
  generateReport: function(patients) {
    const period = document.getElementById('report-period')?.value || 'ALL';
    const now = new Date();
    const todayStr = now.toDateString();
    const filtered = patients.filter(p => {
      const pd = new Date(p.visitDate);
      if (period==='TODAY') return pd.toDateString()===todayStr;
      if (period==='MONTH') return pd.getMonth()===now.getMonth() && pd.getFullYear()===now.getFullYear();
      if (period==='30DAYS') return (now-pd)/(1000*3600*24) <= 30;
      return true;
    });

    const totalPatients = filtered.length;
    let totalRev = 0;
    const reasonMap = {};
    filtered.forEach(p => { totalRev += Number(p.fee)||0; reasonMap[p.reason] = (reasonMap[p.reason]||0)+Number(p.fee); });
    const avgFee = totalPatients > 0 ? Math.round(totalRev/totalPatients) : 0;

    const setEl = (id,val) => { const el=document.getElementById(id); if(el) el.innerText = val; };
    setEl('report-total-patients', totalPatients.toLocaleString());
    setEl('report-total-revenue', 'Rs. '+totalRev.toLocaleString());
    setEl('report-avg-fee', 'Rs. '+avgFee.toLocaleString());

    const breakEl = document.getElementById('report-reasons-breakdown');
    if(breakEl) {
      const sorted = Object.entries(reasonMap).sort((a,b)=>b[1]-a[1]);
      if(sorted.length===0) { breakEl.innerHTML = '<p class="text-xs text-slate-400 py-4 text-center">No revenue records for selected period.</p>'; }
      else { breakEl.innerHTML = sorted.map(([reason,amount])=>{
        const pct = totalRev>0 ? Math.round((amount/totalRev)*100) : 0;
        return `<div class="space-y-1"><div class="flex items-center justify-between text-xs"><span class="font-bold text-slate-700">${reason}</span><span class="font-bold text-emerald-700">Rs. ${amount.toLocaleString()} <span class="text-[10px] text-slate-400 font-normal">(${pct}%)</span></span></div><div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style="width:${pct}%"></div></div></div>`;
      }).join(''); }
    }

    const tsEl = document.getElementById('print-timestamp');
    if(tsEl) tsEl.innerText = 'Report generated on: '+new Date().toLocaleString();
  },

  printReport: function() {
    document.body.classList.add('printing-report');
    window.print();
    setTimeout(() => document.body.classList.remove('printing-report'), 600);
  },

  exportToCSV: function(patients) {
    if(patients.length===0) { window.ui.showToast('No records to export!','error'); return; }
    const headers = ['Record ID','Patient Name','Age','Gender','Phone','Reason of Visit','Consultation Fee (PKR)','Visit Date','Clinical Notes'];
    const rows = patients.map(p=>[`"${p.id}"`,`"${p.patientName.replace(/"/g,'""')}"`,`"${p.age}"`,`"${p.gender}"`,`"${p.phone||'N/A'}"`,`"${p.reason.replace(/"/g,'""')}"`,`"${p.fee}"`,`"${new Date(p.visitDate).toLocaleString().replace(/"/g,'""')}"`,`"${(p.notes||'').replace(/"/g,'""')}"`]);
    const csv = [headers.join(','),...rows.map(r=>r.join(','))].join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MedTrack_Patient_Records_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    window.ui.showToast('CSV exported successfully!','success');
  }
};
