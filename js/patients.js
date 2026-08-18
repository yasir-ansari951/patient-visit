/* ================================================================
   PATIENTS.JS – CRUD, view slip, table rendering, pagination
   ================================================================ */
let currentPage = 1, rowsPerPage = 10, deletePendingId = null;

const patients = {
  initFormDate: function() {
    const el = document.getElementById('form-date');
    if (el && !el.value) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      el.value = now.toISOString().slice(0, 16);
    }
  },

  setFee: function(amount) {
    document.getElementById('form-fee').value = amount;
  },

  // Explicitly handles gender card selection (does not rely on CSS peer-checked,
  // which can be unreliable with the Tailwind Browser CDN's runtime compiler).
  selectGender: function(value) {
    const styles = {
      Male:   'gender-option-box py-2.5 px-2 rounded-xl border-2 border-blue-600 bg-blue-600 text-white text-center text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5',
      Female: 'gender-option-box py-2.5 px-2 rounded-xl border-2 border-pink-600 bg-pink-600 text-white text-center text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5',
      Other:  'gender-option-box py-2.5 px-2 rounded-xl border-2 border-purple-600 bg-purple-600 text-white text-center text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5'
    };
    const unselected = 'gender-option-box py-2.5 px-2 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 text-center text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5';

    ['Male', 'Female', 'Other'].forEach(g => {
      const box = document.getElementById('gender-box-' + g.toLowerCase());
      const radio = document.getElementById('gender-' + g.toLowerCase());
      if (!box) return;
      if (g === value) {
        box.className = styles[g];
        if (radio) radio.checked = true;
      } else {
        box.className = unselected;
      }
    });
  },

  handleReasonChange: function() {
    const sel = document.getElementById('form-reason-select');
    const cust = document.getElementById('custom-reason-container');
    const inp = document.getElementById('form-reason-custom');
    if (sel.value === 'Other') { cust.classList.remove('hidden'); inp.required = true; }
    else { cust.classList.add('hidden'); inp.required = false; }
  },

  resetForm: function() {
    document.getElementById('add-patient-form').reset();
    this.initFormDate();
    this.handleReasonChange();
    this.selectGender('Male');
    window.ui.showToast('Form cleared.', 'info');
  },

  handleSavePatient: function(e) {
    e.preventDefault();
    const name = document.getElementById('form-name').value.trim();
    const age = parseInt(document.getElementById('form-age').value, 10);
    const genderEl = document.querySelector('input[name="form-gender"]:checked');
    const gender = genderEl ? genderEl.value : 'Male';
    const phone = document.getElementById('form-phone').value.trim() || 'N/A';
    let reason = document.getElementById('form-reason-select').value;
    if (reason === 'Other') reason = document.getElementById('form-reason-custom').value.trim() || 'Custom';
    const fee = parseFloat(document.getElementById('form-fee').value);
    const visitDate = document.getElementById('form-date').value || new Date().toISOString();
    const notes = document.getElementById('form-notes').value.trim() || 'No notes.';

    const newPatient = { id:'REC-'+Math.floor(1000+Math.random()*9000), patientName:name, age, gender, phone, reason, fee, visitDate, notes };
    window.state.patients.unshift(newPatient);
    storage.save(window.state.patients);
    document.getElementById('add-patient-form').reset();
    this.initFormDate();
    this.handleReasonChange();
    this.selectGender('Male');
    window.ui.showToast(`Visit for "${name}" registered!`, 'success');
    window.ui.refreshAll();
  },

  filterAndRender: function() {
    const searchVal = (document.getElementById('record-search')?.value || '').toLowerCase().trim();
    const reasonVal = document.getElementById('filter-reason')?.value || 'ALL';
    const sortVal = document.getElementById('sort-by')?.value || 'latest';

    let filtered = window.state.patients.filter(p =>
      (!searchVal || p.patientName.toLowerCase().includes(searchVal) || p.reason.toLowerCase().includes(searchVal) || (p.phone||'').includes(searchVal) || p.id.toLowerCase().includes(searchVal)) &&
      (reasonVal==='ALL' || p.reason===reasonVal)
    );

    if (sortVal==='latest') filtered.sort((a,b)=>new Date(b.visitDate)-new Date(a.visitDate));
    else if (sortVal==='oldest') filtered.sort((a,b)=>new Date(a.visitDate)-new Date(b.visitDate));
    else if (sortVal==='fee-high') filtered.sort((a,b)=>b.fee-a.fee);
    else if (sortVal==='fee-low') filtered.sort((a,b)=>a.fee-b.fee);
    else if (sortVal==='name-asc') filtered.sort((a,b)=>a.patientName.localeCompare(b.patientName));

    this.renderPagination(filtered);
  },

  goToPage: function(page) { if(page<1)return; currentPage=page; this.filterAndRender(); },
  handleRowsChange: function() { rowsPerPage=parseInt(document.getElementById('rows-per-page').value,10)||10; currentPage=1; this.filterAndRender(); },

  renderPagination: function(filteredList) {
    const total = filteredList.length;
    const totalPages = Math.ceil(total/rowsPerPage)||1;
    if(currentPage>totalPages) currentPage=totalPages;
    const start = (currentPage-1)*rowsPerPage;
    const end = Math.min(start+rowsPerPage, total);
    const slice = filteredList.slice(start,end);

    const tbody = document.getElementById('records-tbody');
    const empty = document.getElementById('records-empty-state');
    if(total===0) { tbody.innerHTML=''; empty.classList.remove('hidden'); }
    else {
      empty.classList.add('hidden');
      tbody.innerHTML = slice.map(p=>`
        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
          <td class="py-3.5 px-5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-100 shadow-inner">${p.patientName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}</div>
              <div><div class="font-bold text-slate-800 text-sm">${p.patientName}</div><div class="flex items-center gap-2 text-[11px] text-slate-400"><span><i class="fa-solid fa-id-badge text-blue-500 mr-1"></i>${p.id}</span><span>&bull;</span><span><i class="fa-solid fa-phone text-slate-400 mr-1"></i>${p.phone||'N/A'}</span></div></div>
            </div>
          </td>
          <td class="py-3.5 px-4 text-slate-700"><div class="font-semibold">${p.age} Years</div><div class="text-[11px] text-slate-400">${p.gender}</div></td>
          <td class="py-3.5 px-4"><span class="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">${p.reason}</span></td>
          <td class="py-3.5 px-4 font-bold text-emerald-700 text-sm">Rs. ${Number(p.fee).toLocaleString()}</td>
          <td class="py-3.5 px-4 text-slate-600"><div class="font-medium">${new Date(p.visitDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div><div class="text-[11px] text-slate-400">${new Date(p.visitDate).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</div></td>
          <td class="py-3.5 px-4 text-right no-print">
            <div class="inline-flex items-center gap-1">
              <button onclick="patients.viewSlip('${p.id}')" title="View Slip" class="w-8 h-8 rounded-lg hover:bg-blue-50 text-blue-600 flex items-center justify-center transition"><i class="fa-solid fa-eye"></i></button>
              <button onclick="patients.openEditModal('${p.id}')" title="Edit" class="w-8 h-8 rounded-lg hover:bg-amber-50 text-amber-600 flex items-center justify-center transition"><i class="fa-solid fa-pen-to-square"></i></button>
              <button onclick="patients.confirmDelete('${p.id}')" title="Delete" class="w-8 h-8 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center justify-center transition"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    const infoEl = document.getElementById('pagination-info');
    if(infoEl) infoEl.innerHTML = total===0 ? `Showing <span class="font-bold text-slate-800">0</span> entries` : `Showing <span class="font-bold text-slate-800">${start+1}</span> to <span class="font-bold text-slate-800">${end}</span> of <span class="font-bold text-slate-800">${total}</span> entries`;

    const btnsEl = document.getElementById('pagination-buttons');
    if(btnsEl) {
      let html = `<button onclick="patients.goToPage(${currentPage-1})" ${currentPage<=1?'disabled class="px-2.5 py-1 rounded border border-slate-200 text-slate-300 cursor-not-allowed"':'class="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition"'}> <i class="fa-solid fa-chevron-left text-[10px]"></i></button>`;
      for(let i=1;i<=totalPages;i++) {
        if(i===1||i===totalPages||(i>=currentPage-1&&i<=currentPage+1)) {
          html += `<button onclick="patients.goToPage(${i})" class="w-7 h-7 rounded font-bold transition ${i===currentPage?'bg-blue-600 text-white shadow-sm':'hover:bg-slate-100 text-slate-700 border border-slate-300'}">${i}</button>`;
        } else if(i===currentPage-2||i===currentPage+2) { html += `<span class="px-1 text-slate-400">...</span>`; }
      }
      html += `<button onclick="patients.goToPage(${currentPage+1})" ${currentPage>=totalPages?'disabled class="px-2.5 py-1 rounded border border-slate-200 text-slate-300 cursor-not-allowed"':'class="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition"'}> <i class="fa-solid fa-chevron-right text-[10px]"></i></button>`;
      btnsEl.innerHTML = html;
    }
  },

  viewSlip: function(id) {
    const p = window.state.patients.find(x=>x.id===id);
    if(!p) return;
    const profile = typeof doctorProfile!=='undefined' ? doctorProfile.load() : {name:'Dr. Sarah Ahmed',qualification:'B.D.S, F.C.P.S',specialization:'Senior Dental Surgeon',clinicName:'Dental Clinic'};
    const content = document.getElementById('view-slip-content');
    if(content) {
      content.innerHTML = `
        <div class="text-center mb-4 pb-3 border-b border-dashed border-slate-300">
          <div class="mx-auto mb-2 max-w-[140px]">
            <img src="assets/logo.png" alt="Logo" class="w-full h-auto" onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');">
            <div class="hidden text-center py-1 text-slate-800">
              <i class="fa-solid fa-tooth text-3xl text-blue-600 mb-1"></i>
              <h4 class="text-xs font-bold uppercase tracking-wider">Dental Clinic</h4>
            </div>
          </div>
          <h4 class="text-sm font-extrabold text-slate-800 tracking-tight">${profile.clinicName}</h4>
          <p class="text-[10px] text-slate-400 uppercase tracking-wider">Visit Receipt</p>
        </div>
        <div class="flex items-center justify-between text-xs mb-3">
          <div><span class="text-[10px] text-slate-400 uppercase tracking-wider block">Visit ID</span><span class="font-bold text-slate-700">${p.id}</span></div>
          <div class="text-right"><span class="text-[10px] text-slate-400 uppercase tracking-wider block">Date</span><span class="font-bold text-slate-700">${new Date(p.visitDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span></div>
        </div>
        <div class="bg-slate-50 rounded-xl p-3.5 space-y-2.5 border border-slate-100">
          <div class="flex justify-between items-center"><span class="text-[10px] text-slate-400 uppercase tracking-wider">Patient</span><span class="text-sm font-bold text-slate-800">${p.patientName}</span></div>
          <div class="flex justify-between items-center"><span class="text-[10px] text-slate-400 uppercase tracking-wider">Age / Gender</span><span class="text-xs font-semibold text-slate-700">${p.age} Yrs &bull; ${p.gender}</span></div>
          <div class="flex justify-between items-center"><span class="text-[10px] text-slate-400 uppercase tracking-wider">Treatment</span><span class="text-xs font-bold text-blue-700">${p.reason}</span></div>
          <div class="flex justify-between items-center"><span class="text-[10px] text-slate-400 uppercase tracking-wider">Fee</span><span class="text-sm font-extrabold text-emerald-700">Rs. ${Number(p.fee).toLocaleString()}</span></div>
        </div>
        <div class="mt-3"><span class="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Clinical Notes</span><p class="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">${p.notes||'No additional notes.'}</p></div>
        <div class="mt-5 pt-3 border-t border-dashed border-slate-300 flex items-end justify-between">
          <div>
            <p class="text-xs font-bold text-slate-700" id="slip-sig-name">${profile.name}</p>
            <p class="text-[10px] text-slate-400">${profile.qualification} • ${profile.specialization}</p>
          </div>
          <div class="text-right"><div class="w-24 border-b border-slate-400 mb-0.5"></div><p class="text-[10px] text-slate-400">Authorized Signature</p></div>
        </div>
      `;
    }
    const modal = document.getElementById('modal-view');
    if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
  },

  printSlip: function() {
    document.body.classList.add('printing-slip');
    window.print();
    setTimeout(() => document.body.classList.remove('printing-slip'), 600);
  },

  openEditModal: function(id) {
    const p = window.state.patients.find(x=>x.id===id);
    if(!p) return;
    document.getElementById('edit-id').value = p.id;
    document.getElementById('edit-name').value = p.patientName;
    document.getElementById('edit-age').value = p.age;
    document.getElementById('edit-gender').value = p.gender||'Male';
    document.getElementById('edit-phone').value = p.phone==='N/A'?'':p.phone;
    document.getElementById('edit-reason').value = p.reason;
    document.getElementById('edit-fee').value = p.fee;
    const dStr = new Date(p.visitDate); dStr.setMinutes(dStr.getMinutes()-dStr.getTimezoneOffset());
    document.getElementById('edit-date').value = dStr.toISOString().slice(0,16);
    document.getElementById('edit-notes').value = p.notes||'';
    const modal = document.getElementById('modal-edit');
    if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
  },

  handleUpdatePatient: function(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const idx = window.state.patients.findIndex(p=>p.id===id);
    if(idx===-1) return;
    window.state.patients[idx] = {
      ...window.state.patients[idx],
      patientName: document.getElementById('edit-name').value.trim(),
      age: parseInt(document.getElementById('edit-age').value,10),
      gender: document.getElementById('edit-gender').value,
      phone: document.getElementById('edit-phone').value.trim()||'N/A',
      reason: document.getElementById('edit-reason').value,
      fee: parseFloat(document.getElementById('edit-fee').value),
      visitDate: document.getElementById('edit-date').value,
      notes: document.getElementById('edit-notes').value.trim()
    };
    ui.closeModal('modal-edit');
    storage.save(window.state.patients);
    ui.refreshAll();
    ui.showToast(`Record updated!`, 'success');
  },

  confirmDelete: function(id) {
    const p = window.state.patients.find(x=>x.id===id);
    if(!p) return;
    deletePendingId = id;
    document.getElementById('delete-modal-text').innerText = `Delete visit for "${p.patientName}" (${p.id})? This cannot be undone.`;
    const modal = document.getElementById('modal-delete');
    if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    document.getElementById('confirm-delete-btn').onclick = () => {
      if(!deletePendingId) return;
      const dp = window.state.patients.find(x=>x.id===deletePendingId);
      const dn = dp ? dp.patientName : 'Patient';
      window.state.patients = window.state.patients.filter(x=>x.id!==deletePendingId);
      deletePendingId = null;
      ui.closeModal('modal-delete');
      storage.save(window.state.patients);
      ui.refreshAll();
      ui.showToast(`Record for "${dn}" deleted.`, 'error');
    };
  },

  resetFilters: function() {
    document.getElementById('record-search').value = '';
    document.getElementById('filter-reason').value = 'ALL';
    document.getElementById('sort-by').value = 'latest';
    this.filterAndRender();
  }
};
