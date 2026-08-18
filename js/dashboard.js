/* ================================================================
   DASHBOARD.JS – KPI calculations & recent-tables helpers
   ================================================================ */
const dashboard = {
  updateKPIs: function(patients) {
    const totalPatients = patients.length;

    let totalRev = 0;
    const reasonCounts = {};
    patients.forEach(p => {
      totalRev += Number(p.fee) || 0;
      reasonCounts[p.reason] = (reasonCounts[p.reason] || 0) + 1;
    });

    const avgFee = totalPatients > 0 ? Math.round(totalRev / totalPatients) : 0;
    let topReason = 'None', maxCount = -1;
    for (const r in reasonCounts) {
      if (reasonCounts[r] > maxCount) { maxCount = reasonCounts[r]; topReason = r; }
    }

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    setEl('kpi-total-patients', totalPatients.toLocaleString());
    setEl('kpi-total-revenue', 'Rs. ' + totalRev.toLocaleString());
    setEl('kpi-avg-fee', 'Rs. ' + avgFee.toLocaleString());
    setEl('kpi-top-reason', topReason);
  },

  renderRecentTable: function(patients) {
    const tbody = document.getElementById('dashboard-recent-tbody');
    if (!tbody) return;
    const recent = [...patients].sort((a,b) => new Date(b.visitDate) - new Date(a.visitDate)).slice(0, 5);
    if (recent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">No patient visits recorded yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = recent.map(p => `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-5">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
              ${p.patientName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
            </div>
            <div>
              <div class="font-bold text-slate-800">${p.patientName}</div>
              <div class="text-[10px] text-slate-400">${p.id}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 text-slate-600">${p.age} Yrs &bull; <span class="text-slate-400">${p.gender}</span></td>
        <td class="py-3 px-4"><span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">${p.reason}</span></td>
        <td class="py-3 px-4 font-bold text-emerald-700">Rs. ${Number(p.fee).toLocaleString()}</td>
        <td class="py-3 px-4 text-slate-500 text-[11px]">${new Date(p.visitDate).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
        <td class="py-3 px-4 text-right">
          <button onclick="patients.viewSlip('${p.id}')" class="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition" title="View Slip"><i class="fa-solid fa-eye"></i></button>
        </td>
      </tr>
    `).join('');
  }
};
