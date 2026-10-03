import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import ExcelJS from 'exceljs';
import { API_BASE_URL } from '../../api/config.js';
import { driverPhonesMap, omanStationsData } from '../../../shared/omanStations.js';

ChartJS.register(...registerables);

const apiUrl = `${API_BASE_URL}/admin/fuel-records`;
const tokenHeaders = () => ({ Authorization: `Bearer ${sessionStorage.getItem('admin_token') || ''}` });
const numericFields = ['sn', 'startingKm', 'endKm', 'dayVal', 'trip1Km', 'trip2Km', 'kmDay', 'difference', 'fuel', 'lastKm', 'currentKm'];
const editableFields = ['date', 'car', 'driver', 'driverPhone', 'startingKm', 'endKm', 'dayVal', 'trip1', 'trip1Km', 'trip2', 'trip2Km', 'kmDay', 'difference', 'tnxAuth', 'site', 'fuel', 'lastKm', 'currentKm'];
const rangeOptions = ['1D', '5D', '1M', '3M', 'YTD', '1Y', '3Y', '5Y', 'Max'];
const pageSizes = [10, 25, 50, 100, 'all'];
const inputClass = 'w-full rounded-lg border border-white/8 bg-[#101014] px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-700 focus:border-brand/60';
const panelClass = 'rounded-xl border border-white/6 bg-[#151519]';

const blankRecord = () => ({
    date: new Date().toISOString().slice(0, 10), car: '', driver: '', driverPhone: '', startingKm: '', endKm: '', dayVal: '',
    trip1: '', trip1Km: '', trip2: '', trip2Km: '', kmDay: '', difference: '', tnxAuth: '', site: '', fuel: '', lastKm: '', currentKm: '',
});
const distanceFor = record => Math.max(0, (Number(record?.currentKm) || 0) - (Number(record?.lastKm) || 0));
const efficiencyFor = record => Number(record?.fuel) > 0 ? distanceFor(record) / Number(record.fuel) : 0;
const dateValue = value => {
    if (!value) return null;
    const time = Date.parse(String(value));
    return Number.isFinite(time) ? new Date(time) : null;
};
const dateInputValue = value => dateValue(value)?.toISOString().slice(0, 10) || '';
const displayDate = value => dateValue(value)?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) || value || '—';
const asDateString = value => {
    const date = dateValue(value);
    return date ? `${date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })}-${String(date.getUTCDate()).padStart(2, '0')}-${date.getUTCFullYear()}` : String(value || '');
};
const numberText = (value, digits = 0) => (Number(value) || 0).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
const errorText = async response => {
    let result;
    try { result = await response.json(); } catch { result = {}; }
    if (!response.ok || result.success === false) throw new Error(result.message || `Request failed (${response.status})`);
    return result;
};
const toRecordPayload = record => {
    const payload = Object.fromEntries(editableFields.map(key => [
        key,
        key === 'date' ? asDateString(record[key]) : numericFields.includes(key) ? (record[key] === '' ? 0 : Number(record[key]) || 0) : String(record[key] ?? '').trim(),
    ]));
    if (record.sn !== undefined && record.sn !== null && record.sn !== '') payload.sn = Number(record.sn);
    return payload;
};

function SearchableStationSelect({ value, onChange, allLabel, disabled = false }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const rootRef = useRef(null);
    const selected = omanStationsData.flatMap(group => group.items).find(station => station.val === value);

    useEffect(() => {
        const close = event => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const query = search.trim().toLowerCase();
    return (
        <div className="relative" ref={rootRef}>
            <button type="button" disabled={disabled} onClick={() => { setOpen(current => !current); setSearch(''); }} className={`${inputClass} flex items-center justify-between gap-2 text-left disabled:opacity-50`}>
                <span className={selected ? 'truncate text-zinc-100' : 'truncate text-zinc-500'}>{selected?.text || allLabel || 'Choose a station'}</span>
                <span className="material-icons text-[18px] text-zinc-500">expand_more</span>
            </button>
            {open && (
                <div className="absolute inset-x-0 top-[calc(100%+6px)] z-40 max-h-80 overflow-hidden rounded-xl border border-white/10 bg-[#18181b] shadow-2xl">
                    <div className="border-b border-white/8 p-2">
                        <input autoFocus value={search} onChange={event => setSearch(event.target.value)} placeholder="Search Oman Shell stations…" className={inputClass} />
                    </div>
                    <div className="max-h-64 overflow-y-auto p-1.5">
                        {allLabel && <button type="button" onClick={() => { onChange(''); setOpen(false); }} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-zinc-300 hover:bg-white/5">{allLabel}</button>}
                        {omanStationsData.map(group => {
                            const stations = group.items.filter(station => !query || `${station.val} ${station.text} ${group.group}`.toLowerCase().includes(query));
                            if (!stations.length) return null;
                            return (
                                <div key={group.group}>
                                    <p className="px-3 pb-1 pt-3 text-[9px] font-black uppercase tracking-wider text-brand">{group.group}</p>
                                    {stations.map(station => <button type="button" key={station.val} onClick={() => { onChange(station.val); setOpen(false); }} className={`w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-white/5 ${station.val === value ? 'text-brand' : 'text-zinc-300'}`}>{station.text}</button>)}
                                </div>
                            );
                        })}
                        {omanStationsData.every(group => !group.items.some(station => `${station.val} ${station.text} ${group.group}`.toLowerCase().includes(query))) && <p className="px-3 py-5 text-center text-xs text-zinc-500">No stations found</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, suffix, tone = 'text-brand' }) {
    return (
        <div className={`${panelClass} p-4 sm:p-5`}>
            <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold text-zinc-500">{label}</p>
                <span className={`material-icons text-[19px] ${tone}`}>{icon}</span>
            </div>
            <p className="mt-3 text-xl font-black tracking-tight text-white sm:text-2xl">{value}<span className="ml-1 text-xs font-semibold text-zinc-500">{suffix}</span></p>
        </div>
    );
}

function FuelTrendChart({ records, range, setRange }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const chartRecords = useMemo(() => {
        const dated = (records ?? []).filter(Boolean).map(record => ({ record, date: dateValue(record.date) })).filter(entry => entry.date);
        if (range === 'Max' || !dated.length) return dated;
        const maxDate = new Date(Math.max(...dated.map(entry => entry.date.getTime())));
        const cutoff = new Date(maxDate);
        if (range === '1D') cutoff.setDate(cutoff.getDate() - 1);
        else if (range === '5D') cutoff.setDate(cutoff.getDate() - 5);
        else if (range === '1M') cutoff.setMonth(cutoff.getMonth() - 1);
        else if (range === '3M') cutoff.setMonth(cutoff.getMonth() - 3);
        else if (range === 'YTD') cutoff.setFullYear(cutoff.getFullYear(), 0, 1);
        else if (range === '1Y') cutoff.setFullYear(cutoff.getFullYear() - 1);
        else if (range === '3Y') cutoff.setFullYear(cutoff.getFullYear() - 3);
        else if (range === '5Y') cutoff.setFullYear(cutoff.getFullYear() - 5);
        return dated.filter(entry => entry.date >= cutoff);
    }, [records, range]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const byDay = new Map();
        chartRecords.forEach(({ record, date }) => {
            const key = date.toISOString().slice(0, 10);
            const current = byDay.get(key) || { km: 0, fuel: 0 };
            current.km += distanceFor(record);
            current.fuel += Number(record.fuel) || 0;
            byDay.set(key, current);
        });
        const points = [...byDay.entries()].sort(([left], [right]) => left.localeCompare(right));
        chartRef.current?.destroy();
        chartRef.current = new ChartJS(canvas, {
            type: 'line',
            data: {
                labels: points.map(([day]) => new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: '2-digit' })),
                datasets: [{
                    label: 'Efficiency',
                    data: points.map(([, totals]) => totals.fuel > 0 ? Number((totals.km / totals.fuel).toFixed(2)) : null),
                    borderColor: '#cba771', backgroundColor: 'rgba(184,142,75,.12)', pointBackgroundColor: '#cba771', pointBorderColor: '#151519',
                    pointRadius: points.length > 80 ? 0 : 3, pointHoverRadius: 5, borderWidth: 2, tension: 0.32, fill: true, spanGaps: true,
                }],
            },
            options: {
                responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: { display: false },
                    tooltip: { backgroundColor: '#101014', titleColor: '#f4f4f5', bodyColor: '#d4d4d8', borderColor: '#34343a', borderWidth: 1, padding: 12, displayColors: false, callbacks: { label: item => ` ${item.parsed.y ?? 0} KM/L` } },
                },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,.035)' }, ticks: { color: '#71717a', maxTicksLimit: 9, maxRotation: 0 } },
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,.07)' }, ticks: { color: '#71717a', callback: value => `${value} KM/L` } },
                },
            },
        });
        return () => {
            chartRef.current?.destroy();
            chartRef.current = null;
        };
    }, [chartRecords]);

    return (
        <section className={`${panelClass} p-4 sm:p-5`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="text-sm font-black text-white">Fuel Efficiency Trend</h2><p className="mt-1 text-[11px] text-zinc-500">Distance divided by fuel volume, grouped by record date</p></div>
                <div className="flex flex-wrap gap-1 rounded-lg border border-white/6 bg-[#101014] p-1">
                    {rangeOptions.map(option => <button key={option} onClick={() => setRange(option)} className={`rounded-md px-2 py-1.5 text-[10px] font-bold transition-colors ${range === option ? 'bg-brand text-[#17130d]' : 'text-zinc-500 hover:text-zinc-200'}`}>{option}</button>)}
                </div>
            </div>
            <div className="relative h-64 sm:h-72"><canvas ref={canvasRef} aria-label="Fuel efficiency trend chart" role="img" /></div>
        </section>
    );
}

function RecordModal({ record, records, onClose, onSave, saving, error }) {
    const [form, setForm] = useState(() => ({ ...blankRecord(), ...record, date: dateInputValue(record?.date) || blankRecord().date }));
    const [stationQuery, setStationQuery] = useState('');
    const safeRecords = Array.isArray(records) ? records.filter(Boolean) : [];
    const drivers = [...new Set([...Object.keys(driverPhonesMap), ...safeRecords.map(item => item.driver).filter(Boolean)])].sort();
    const vehicles = [...new Set(safeRecords.map(item => item.car).filter(Boolean))].sort();
    const setField = (key, value) => setForm(current => ({ ...current, [key]: value }));
    const phoneForDriver = name => driverPhonesMap[String(name || '').toUpperCase()]
        || safeRecords.find(item => String(item.driver || '').toUpperCase() === String(name || '').toUpperCase() && item.driverPhone)?.driverPhone
        || '';
    const sections = [
        { title: 'General Info', fields: [
            ['date', 'Date', 'date'], ['car', 'Car / Vehicle', 'text'], ['driver', 'Driver', 'driver'], ['driverPhone', 'Driver Phone', 'tel'],
        ] },
        { title: 'Trips & Odometer Details', fields: [
            ['startingKm', 'Starting KM', 'number'], ['endKm', 'End KM', 'number'], ['dayVal', '/Day', 'number'],
            ['trip1', 'Trip 1', 'text'], ['trip1Km', 'Trip 1 KM', 'number'], ['trip2', 'Trip 2', 'text'], ['trip2Km', 'Trip 2 KM', 'number'],
            ['kmDay', 'KM / Day', 'number'], ['difference', 'Difference', 'number'], ['lastKm', 'Previous Odometer KM', 'number'], ['currentKm', 'Current Odometer KM', 'number'],
        ] },
        { title: 'Fuel & Station Details', fields: [['fuel', 'Fuel (Liters)', 'number'], ['tnxAuth', 'Transaction Authorization', 'text']] },
    ];
    const stations = omanStationsData.flatMap(group => group.items.map(station => ({ ...station, group: group.group }))).filter(station => `${station.text} ${station.val} ${station.group}`.toLowerCase().includes(stationQuery.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6" onMouseDown={event => event.target === event.currentTarget && onClose()}>
            <form onSubmit={event => { event.preventDefault(); onSave(form, 'update'); }} className="flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#17171b] shadow-2xl">
                <header className="flex items-center justify-between border-b border-white/6 px-5 py-4"><div><h2 className="text-base font-black text-white">{record?._id ? `Edit Fuel Record #${record.sn}` : 'Add Fuel Record'}</h2><p className="mt-1 text-xs text-zinc-500">Vehicle use, refueling, and station details</p></div><button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-zinc-400 hover:text-white"><span className="material-icons">close</span></button></header>
                <div className="space-y-6 overflow-y-auto p-4 sm:p-5">
                    {sections.map(section => <section key={section.title} className="space-y-3"><h3 className="border-b border-white/6 pb-2 text-[11px] font-black uppercase tracking-[.13em] text-brand">{section.title}</h3><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {section.fields.map(([key, label, type]) => <label key={key} className="block min-w-0"><span className="mb-1.5 block text-[11px] font-semibold text-zinc-500">{label}</span>{type === 'driver' ? <input list="fuel-driver-options" value={form.driver} onChange={event => setForm(current => ({ ...current, driver: event.target.value, driverPhone: phoneForDriver(event.target.value) || current.driverPhone }))} className={inputClass} /> : type === 'car' ? <input list="fuel-vehicle-options" value={form.car} onChange={event => setField(key, event.target.value)} className={inputClass} /> : <input type={type} min={type === 'number' ? '0' : undefined} step={type === 'number' ? 'any' : undefined} value={form[key] ?? ''} onChange={event => setField(key, event.target.value)} className={inputClass} />}</label>)}
                        <datalist id="fuel-driver-options">{drivers.map(driver => <option key={driver} value={driver} />)}</datalist><datalist id="fuel-vehicle-options">{vehicles.map(vehicle => <option key={vehicle} value={vehicle} />)}</datalist>
                    </div></section>)}
                    <section className="space-y-3"><h3 className="border-b border-white/6 pb-2 text-[11px] font-black uppercase tracking-[.13em] text-brand">Fuel Station</h3><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="block"><span className="mb-1.5 block text-[11px] font-semibold text-zinc-500">Oman Shell Station</span><SearchableStationSelect value={form.site} onChange={value => setField('site', value)} /></label>
                        <label className="block"><span className="mb-1.5 block text-[11px] font-semibold text-zinc-500">Station Code / Site Name</span><input value={form.site} onChange={event => setField('site', event.target.value)} className={inputClass} /></label>
                        <div className="sm:col-span-2"><input value={stationQuery} onChange={event => setStationQuery(event.target.value)} placeholder="Filter station directory for quick lookup…" className={inputClass} /><p className="mt-1.5 text-[10px] text-zinc-600">{stations.length} matching stations across {omanStationsData.length} governorate groups</p></div>
                    </div><div className="max-h-28 overflow-y-auto rounded-lg border border-white/6 bg-[#101014] p-2"><div className="flex flex-wrap gap-1.5">{stations.slice(0, 30).map(station => <button type="button" key={`${station.group}-${station.val}`} onClick={() => setField('site', station.val)} title={station.group} className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${form.site === station.val ? 'border-brand/40 bg-brand/10 text-brand' : 'border-white/6 bg-white/[.02] text-zinc-400 hover:text-white'}`}>{station.text}</button>)}</div></div></section>
                    {error && <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
                </div>
                <footer className="flex flex-wrap items-center gap-2 border-t border-white/6 px-4 py-4 sm:px-5">
                    <button type="button" disabled={saving} onClick={() => onSave(form, 'new')} className="mr-auto rounded-lg border border-brand/30 px-3 py-2 text-xs font-bold text-brand hover:bg-brand/10 disabled:opacity-50">Save as New</button>
                    <button type="button" disabled={saving} onClick={onClose} className="rounded-lg bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10">Cancel</button>
                    <button disabled={saving} className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-[#17130d] disabled:opacity-60">{saving ? 'Saving…' : 'Save Record'}</button>
                </footer>
            </form>
        </div>
    );
}

function parseCsv(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let index = 0; index < text.length; index++) {
        const char = text[index];
        if (quoted && char === '"' && text[index + 1] === '"') { field += '"'; index++; }
        else if (char === '"') quoted = !quoted;
        else if (char === ',' && !quoted) { row.push(field); field = ''; }
        else if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && text[index + 1] === '\n') index++; row.push(field); if (row.some(cell => cell.trim())) rows.push(row); row = []; field = ''; }
        else field += char;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    return rows;
}

const headerKey = value => String(value || '').replace(/^\uFEFF/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const importAliases = {
    sn: ['sn', 'serialnumber', '#'], date: ['date'], car: ['car', 'vehicle'], driver: ['driver', 'drivername'], driverPhone: ['driverphone', 'phone'],
    startingKm: ['startingkm', 'startkm'], endKm: ['endkm'], dayVal: ['day', 'dayval'], trip1: ['fromto1', 'trip1'], trip1Km: ['km1', 'trip1km'],
    trip2: ['fromto2', 'trip2'], trip2Km: ['km2', 'trip2km'], kmDay: ['kmday'], difference: ['difference'], tnxAuth: ['tnxauth', 'transactionauth'],
    site: ['site', 'station'], fuel: ['fuelliters', 'fuellitter', 'fuelliter', 'fuellitre', 'fuel', 'liters'], lastKm: ['lastkm'], currentKm: ['currentkm'],
};
const recordsFromRows = rows => {
    if (rows.length < 2) return [];
    const headers = rows[0].map(headerKey);
    const columnFor = Object.fromEntries(Object.entries(importAliases).map(([key, aliases]) => [key, headers.findIndex(header => aliases.includes(header))]));
    return rows.slice(1).map(row => {
        const source = {};
        Object.entries(columnFor).forEach(([key, column]) => { if (column >= 0) source[key] = row[column] ?? ''; });
        if (!source.driverPhone) source.driverPhone = driverPhonesMap[String(source.driver || '').toUpperCase()] || '';
        if (!source.date && !source.car && !source.driver && !source.sn) return null;
        return toRecordPayload(source);
    }).filter(Boolean);
};

async function recordsFromFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension === 'csv' || extension === 'txt') return recordsFromRows(parseCsv(await file.text()));
    if (extension === 'xls' || extension === 'html' || extension === 'htm') {
        const document = new DOMParser().parseFromString(await file.text(), 'text/html');
        const table = [...document.querySelectorAll('table')].find(candidate => {
            const headers = [...candidate.querySelectorAll('tr:first-child th, tr:first-child td')].map(cell => headerKey(cell.textContent));
            return headers.includes('sn') && headers.includes('date') && headers.includes('car');
        });
        if (!table) throw new Error('No fuel record table was found in that Excel/HTML file.');
        return recordsFromRows([...table.querySelectorAll('tr')].map(row => [...row.querySelectorAll('th,td')].map(cell => cell.textContent.trim())));
    }
    if (extension === 'xlsx') {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer());
        const sheet = workbook.worksheets[0];
        if (!sheet) throw new Error('The workbook does not contain a worksheet.');
        const rows = [];
        sheet.eachRow({ includeEmpty: false }, row => rows.push(row.values.slice(1).map(value => value instanceof Date ? asDateString(value.toISOString()) : String(value ?? ''))));
        return recordsFromRows(rows);
    }
    throw new Error('Choose a .xlsx, .xls, .html, or .csv file.');
}

const exportRows = records => records.map(record => ({
    SN: record.sn, DATE: record.date, CAR: record.car, 'DRIVER NAME': record.driver, 'DRIVER PHONE': record.driverPhone,
    'STARTING KM': record.startingKm, 'END KM': record.endKm, '/DAY': record.dayVal, 'FROM - TO (1)': record.trip1, 'KM (1)': record.trip1Km,
    'FROM - TO (2)': record.trip2, 'KM (2)': record.trip2Km, 'KM/DAY': record.kmDay, DIFFERENCE: record.difference,
    'TNX AUTH': record.tnxAuth, SITE: record.site, 'FUEL LITERS': record.fuel, 'LAST KM': record.lastKm, 'CURRENT KM': record.currentKm,
    'DISTANCE KM': distanceFor(record), 'AVRG KM/L': Number(efficiencyFor(record).toFixed(2)),
}));

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; link.click();
    URL.revokeObjectURL(url);
}

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
function printRecords(records) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) throw new Error('Allow pop-ups to print or save the PDF report.');
    const rows = exportRows(records);
    const headers = Object.keys(rows[0] || {});
    printWindow.document.write(`<!doctype html><html><head><title>Fuel Consumption Report</title><style>body{font:12px Arial,sans-serif;color:#161b22;padding:20px}h1{font-size:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #cbd5e1;padding:5px;text-align:left;font-size:9px}th{background:#e8d6b5}@media print{@page{size:landscape;margin:10mm}}</style></head><body><h1>Fuel Consumption Report</h1><p>${rows.length} records · Generated ${new Date().toLocaleString()}</p><table><thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${headers.map(header => `<td>${escapeHtml(row[header])}</td>`).join('')}</tr>`).join('')}</tbody></table><script>window.onload=()=>window.print()<\/script></body></html>`);
    printWindow.document.close();
}

export default function FuelManagementTab() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [modalRecord, setModalRecord] = useState(undefined);
    const [modalError, setModalError] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [vehicle, setVehicle] = useState('');
    const [driver, setDriver] = useState('');
    const [station, setStation] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [chartRange, setChartRange] = useState('1M');
    const [exportFormat, setExportFormat] = useState('xlsx');
    const fileRef = useRef(null);

    const loadRecords = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const result = await errorText(await fetch(apiUrl, { headers: tokenHeaders() }));
            setRecords(Array.isArray(result.data) ? result.data.filter(record => record && typeof record === 'object') : []);
        } catch (requestError) { setError(requestError.message || 'Unable to load fuel records.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadRecords(); }, [loadRecords]);
    useEffect(() => { const timer = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 220); return () => clearTimeout(timer); }, [searchInput]);
    useEffect(() => { setPage(1); }, [search, vehicle, driver, station, dateFrom, dateTo, pageSize]);
    useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(''), 3200); return () => clearTimeout(timer); }, [toast]);

    const vehicles = useMemo(() => [...new Set((records ?? []).filter(Boolean).map(record => record.car).filter(Boolean))].sort(), [records]);
    const drivers = useMemo(() => [...new Set((records ?? []).filter(Boolean).map(record => record.driver).filter(Boolean))].sort(), [records]);
    const filtered = useMemo(() => (records ?? []).filter(record => record && typeof record === 'object').filter(record => {
        if (vehicle && record.car !== vehicle) return false;
        if (driver && record.driver !== driver) return false;
        if (station && record.site !== station) return false;
        const searchable = [record.car, record.driver, record.driverPhone, record.site, record.trip1, record.trip2, record.tnxAuth].join(' ').toLowerCase();
        if (search && !searchable.includes(search)) return false;
        const date = dateValue(record.date);
        if (dateFrom && (!date || date < new Date(`${dateFrom}T00:00:00`))) return false;
        if (dateTo && (!date || date > new Date(`${dateTo}T23:59:59.999`))) return false;
        return true;
    }), [records, vehicle, driver, station, search, dateFrom, dateTo]);

    useEffect(() => {
        setPage(current => Math.min(current, pageSize === 'all' ? 1 : Math.max(1, Math.ceil((filtered?.length ?? 0) / pageSize))));
    }, [filtered?.length, pageSize]);

    const stats = useMemo(() => {
        const safeFiltered = filtered ?? [];
        const totalFuel = safeFiltered.reduce((sum, record) => sum + (Number(record?.fuel) || 0), 0);
        const totalDistance = safeFiltered.reduce((sum, record) => sum + distanceFor(record), 0);
        const validFuelRecords = safeFiltered.filter(record => Number(record?.fuel) > 0);
        const forVehicle = matcher => {
            const items = safeFiltered.filter(record => matcher(String(record?.car || '').toLowerCase()));
            const fuel = items.reduce((sum, record) => sum + (Number(record?.fuel) || 0), 0);
            const distance = items.reduce((sum, record) => sum + distanceFor(record), 0);
            const count = items.filter(record => Number(record?.fuel) > 0).length;
            return { distance, efficiency: fuel ? distance / fuel : 0, avgFuel: count ? fuel / count : 0 };
        };
        return {
            count: safeFiltered.length, fuel: totalFuel, distance: totalDistance,
            avgDistance: safeFiltered.length ? totalDistance / safeFiltered.length : 0,
            avgFuel: validFuelRecords.length ? totalFuel / validFuelRecords.length : 0,
            efficiency: totalFuel ? totalDistance / totalFuel : 0,
            mercedes: forVehicle(car => car.includes('mercedes') || car.includes('merc')),
            volvo: forVehicle(car => car.includes('volvo')),
        };
    }, [filtered]);

    const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize));
    const paginated = pageSize === 'all' ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize);
    const averageFuel = stats.avgFuel;

    const saveRecord = async (form, mode) => {
        setSaving(true); setModalError('');
        const payload = toRecordPayload(form);
        const isEdit = Boolean(modalRecord?._id) && mode === 'update';
        if (isEdit) payload.sn = Number(modalRecord.sn);
        else if (mode === 'new') delete payload.sn;
        try {
            const response = await fetch(isEdit ? `${apiUrl}/${modalRecord._id}` : apiUrl, {
                method: isEdit ? 'PUT' : 'POST', headers: { ...tokenHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
            });
            await errorText(response);
            setToast(isEdit ? 'Fuel record updated' : 'Fuel record saved');
            setModalRecord(undefined);
            await loadRecords();
        } catch (requestError) { setModalError(requestError.message || 'Unable to save this record.'); }
        finally { setSaving(false); }
    };

    const deleteRecord = async record => {
        if (!window.confirm(`Delete fuel record #${record.sn}?`)) return;
        try {
            await errorText(await fetch(`${apiUrl}/${record._id}`, { method: 'DELETE', headers: tokenHeaders() }));
            setToast(`Fuel record #${record.sn} deleted`); await loadRecords();
        } catch (requestError) { setError(requestError.message || 'Unable to delete the fuel record.'); }
    };

    const exportData = async () => {
        if (!filtered.length) { setError('There are no fuel records to export.'); return; }
        setError('');
        const rows = exportRows(filtered);
        const filenameDate = new Date().toISOString().slice(0, 10);
        if (exportFormat === 'csv') {
            const headers = Object.keys(rows[0]);
            const csv = `\uFEFF${headers.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')}\r\n${rows.map(row => headers.map(header => `"${String(row[header] ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n')}`;
            downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `Fuel_Consumption_${filenameDate}.csv`);
        } else if (exportFormat === 'pdf') {
            try { printRecords(filtered); } catch (requestError) { setError(requestError.message); }
        } else {
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Al Najjar Admin';
            const sheet = workbook.addWorksheet('Fuel Records', { views: [{ state: 'frozen', ySplit: 1 }] });
            sheet.columns = Object.keys(rows[0]).map(header => ({ header, key: header, width: Math.max(14, Math.min(30, header.length + 3)) }));
            rows.forEach(row => sheet.addRow(row));
            sheet.getRow(1).height = 24;
            sheet.getRow(1).eachCell(cell => { cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF29231B' } }; cell.border = { bottom: { style: 'medium', color: { argb: 'FFB88E4B' } } }; });
            sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + Math.min(Object.keys(rows[0]).length, 26))}1` };
            const buffer = await workbook.xlsx.writeBuffer();
            downloadBlob(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Fuel_Consumption_${filenameDate}.xlsx`);
        }
    };

    const importFile = async event => {
        const file = event.target.files?.[0]; event.target.value = '';
        if (!file) return;
        setError(''); setLoading(true);
        try {
            const imported = await recordsFromFile(file);
            if (!imported.length) throw new Error('No fuel records were found in that file.');
            const result = await errorText(await fetch(`${apiUrl}/bulk`, { method: 'POST', headers: { ...tokenHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ records: imported }) }));
            setToast(`Imported ${result.data?.imported ?? imported.length} fuel records`);
            await loadRecords();
        } catch (requestError) { setError(requestError.message || 'Unable to import fuel records.'); setLoading(false); }
    };

    const clearFilters = () => { setSearchInput(''); setSearch(''); setVehicle(''); setDriver(''); setStation(''); setDateFrom(''); setDateTo(''); };

    return (
        <div className="space-y-5 text-white" dir="ltr">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div><div className="mb-1 flex items-center gap-2"><span className="material-icons text-brand">local_gas_station</span><span className="text-[10px] font-black uppercase tracking-[.18em] text-brand">Fleet Operations</span></div><h1 className="text-xl font-black text-white sm:text-2xl">إدارة استهلاك الوقود <span className="text-zinc-500">/ Fuel Consumption</span></h1><p className="mt-1 text-xs text-zinc-500">Monitor refueling, vehicle distance, and fleet efficiency.</p></div>
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => { setModalRecord(null); setModalError(''); }} className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2.5 text-xs font-black text-[#17130d] shadow-lg shadow-brand/10 hover:bg-brand-light"><span className="material-icons text-[17px]">add</span>Add Record</button>
                    <input ref={fileRef} type="file" accept=".xlsx,.xls,.html,.htm,.csv,.txt" className="hidden" onChange={importFile} />
                    <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/[.03] px-3 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/[.07]"><span className="material-icons text-[16px]">upload_file</span>Import File</button>
                    <div className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-[#101014] p-1"><select value={exportFormat} onChange={event => setExportFormat(event.target.value)} aria-label="Export format" className="bg-transparent px-2 py-1.5 text-xs font-semibold text-zinc-300 outline-none"><option value="xlsx">Excel (.xlsx)</option><option value="csv">CSV (.csv)</option><option value="pdf">PDF / Print</option></select><button onClick={exportData} className="rounded-md bg-white/8 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-brand/20 hover:text-brand">Export</button></div>
                </div>
            </div>

            {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error" className="material-icons text-base">close</button></div>}

            {loading ? <section aria-label="Loading fuel dashboard" className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-6">{Array.from({ length: 6 }, (_, index) => <div key={index} className={`${panelClass} h-24 animate-pulse p-4`}><div className="h-3 w-24 rounded bg-white/10" /><div className="mt-5 h-6 w-20 rounded bg-white/10" /></div>)}</section> : <section className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-6">
                <StatCard icon="receipt_long" label="Total Records" value={numberText(stats.count)} suffix="records" />
                <StatCard icon="local_gas_station" label="Total Fuel Consumed" value={numberText(stats.fuel, 1)} suffix="liters" tone="text-sky-300" />
                <StatCard icon="route" label="Total Distance" value={numberText(stats.distance, 1)} suffix="KM" tone="text-emerald-300" />
                <StatCard icon="timeline" label="Avg Distance / Record" value={numberText(stats.avgDistance, 1)} suffix="KM" tone="text-violet-300" />
                <StatCard icon="water_drop" label="Avg Fuel / Record" value={numberText(stats.avgFuel, 1)} suffix="L" tone="text-amber-300" />
                <StatCard icon="speed" label="Overall Efficiency" value={numberText(stats.efficiency, 2)} suffix="KM/L" tone="text-emerald-300" />
            </section>}

            {!loading && <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                {[
                    ['Mercedes', stats.mercedes, 'directions_car', 'text-sky-300'],
                    ['Volvo', stats.volvo, 'local_shipping', 'text-brand'],
                ].map(([name, summary, icon, tone]) => <div key={name} className={`${panelClass} p-4 sm:p-5`}><div className="mb-4 flex items-center gap-2"><span className={`material-icons ${tone}`}>{icon}</span><h2 className="text-sm font-black text-white">{name} Fleet</h2></div><div className="grid grid-cols-3 gap-3"><div><p className="text-[10px] font-semibold text-zinc-500">Distance</p><p className="mt-1 text-base font-black text-white">{numberText(summary.distance, 1)} <span className="text-[10px] text-zinc-500">KM</span></p></div><div><p className="text-[10px] font-semibold text-zinc-500">Efficiency</p><p className="mt-1 text-base font-black text-emerald-300">{numberText(summary.efficiency, 2)} <span className="text-[10px] text-zinc-500">KM/L</span></p></div><div><p className="text-[10px] font-semibold text-zinc-500">Avg Fuel</p><p className="mt-1 text-base font-black text-white">{numberText(summary.avgFuel, 1)} <span className="text-[10px] text-zinc-500">L</span></p></div></div></div>)}
            </section>}

            <FuelTrendChart records={filtered} range={chartRange} setRange={setChartRange} />

            <section className={`${panelClass} p-3 sm:p-4`}>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-6">
                    <label className="relative xl:col-span-2"><span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-zinc-600">search</span><input value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Search vehicles, drivers, trips…" className={`${inputClass} pl-10`} /></label>
                    <select aria-label="Filter by vehicle" value={vehicle} onChange={event => setVehicle(event.target.value)} className={inputClass}><option value="">All Vehicles</option>{vehicles.map(item => <option key={item}>{item}</option>)}</select>
                    <select aria-label="Filter by driver" value={driver} onChange={event => setDriver(event.target.value)} className={inputClass}><option value="">All Drivers</option>{drivers.map(item => <option key={item}>{item}</option>)}</select>
                    <div className="xl:col-span-1"><SearchableStationSelect value={station} onChange={setStation} allLabel="All Shell Stations" /></div>
                    <button onClick={clearFilters} className="rounded-lg border border-white/8 px-3 py-2 text-xs font-semibold text-zinc-400 hover:border-brand/30 hover:text-brand">Clear filters</button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:max-w-md"><label className="flex items-center gap-2 rounded-lg border border-white/8 bg-[#101014] px-3"><span className="text-[10px] text-zinc-600">From</span><input aria-label="Date from" type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} className="min-w-0 flex-1 bg-transparent py-2 text-xs text-zinc-300 outline-none" /></label><label className="flex items-center gap-2 rounded-lg border border-white/8 bg-[#101014] px-3"><span className="text-[10px] text-zinc-600">To</span><input aria-label="Date to" type="date" value={dateTo} onChange={event => setDateTo(event.target.value)} className="min-w-0 flex-1 bg-transparent py-2 text-xs text-zinc-300 outline-none" /></label></div>
            </section>

            <section className={`${panelClass} overflow-hidden`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 px-4 py-3"><div><h2 className="text-sm font-black text-white">Fuel Records</h2><p className="mt-1 text-[10px] text-zinc-600">{numberText(filtered.length)} matching records · {omanStationsData.reduce((total, group) => total + group.items.length, 0)} Shell stations in the directory</p></div><button onClick={loadRecords} disabled={loading} className="flex items-center gap-1 rounded-lg border border-white/8 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-brand disabled:opacity-50"><span className={`material-icons text-[15px] ${loading ? 'animate-spin' : ''}`}>refresh</span>Refresh</button></div>
                <div className="overflow-x-auto"><table className="w-full min-w-[1450px] border-collapse text-left"><thead className="sticky top-0 z-10"><tr className="border-b border-white/6 bg-[#19191e]">{['SN', 'Date', 'Car', 'Driver', 'Phone', 'Starting KM', 'End KM', '/Day', 'Trip 1', 'Fuel Liters', 'Current KM', 'Avrg KM/L', 'Actions'].map(header => <th key={header} className="px-3 py-3 text-[9px] font-black uppercase tracking-wider text-zinc-500">{header}</th>)}</tr></thead><tbody>
                    {loading ? <tr><td colSpan="13" className="py-16 text-center text-sm text-zinc-500"><span className="material-icons mb-2 block animate-spin text-brand">refresh</span>Loading fuel records…</td></tr>
                        : filtered.length === 0 ? <tr><td colSpan="13" className="py-16 text-center"><span className="material-icons mb-2 block text-3xl text-zinc-700">local_gas_station</span><p className="text-sm font-semibold text-zinc-400">No fuel records found</p>{error && <button onClick={loadRecords} className="mt-3 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-black">Retry</button>}</td></tr>
                            : paginated.map(record => {
                                const efficiency = efficiencyFor(record);
                                const phone = String(record.driverPhone || driverPhonesMap[String(record.driver || '').toUpperCase()] || '');
                                const highConsumption = Number(record.fuel) > averageFuel && Number(record.fuel) > 0;
                                const whatsappText = `🚨 FUEL CONSUMPTION ALERT\nDriver: ${record.driver}\nVehicle: ${record.car}\nDate: ${record.date}\nRecorded fuel: ${numberText(record.fuel, 2)} liters\nEfficiency: ${numberText(efficiency, 2)} KM/L\nDistance covered: ${numberText(distanceFor(record), 2)} KM\nPlease review fuel efficiency to maintain optimal fleet performance.`;
                                const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappText)}`;
                                return <tr key={record._id ?? record.sn} className="border-b border-white/[.035] transition-colors hover:bg-white/[.025]">
                                    <td className="px-3 py-3 text-xs font-bold text-brand">{record.sn ?? '—'}</td><td className="px-3 py-3 text-xs text-zinc-400">{displayDate(record.date)}</td><td className="px-3 py-3"><span className={`rounded-md border px-2 py-1 text-[10px] font-bold ${String(record.car ?? '').toLowerCase().includes('volvo') ? 'border-sky-500/20 bg-sky-500/10 text-sky-300' : 'border-brand/20 bg-brand/10 text-brand'}`}>{record.car || '—'}</span></td><td className="px-3 py-3 text-xs font-semibold text-zinc-200">{record.driver || '—'}</td><td className="px-3 py-3 text-xs text-zinc-500">{phone || '—'}</td><td className="px-3 py-3 text-xs text-zinc-400">{numberText(record.startingKm, 1)}</td><td className="px-3 py-3 text-xs text-zinc-400">{numberText(record.endKm, 1)}</td><td className="px-3 py-3 text-xs text-zinc-400">{numberText(record.dayVal, 1)}</td><td className="max-w-56 truncate px-3 py-3 text-xs text-zinc-400" title={record.trip1}>{record.trip1 || '—'}</td><td className="px-3 py-3 text-xs font-bold text-white">{numberText(record.fuel, 1)}</td><td className="px-3 py-3 text-xs text-zinc-400">{numberText(record.currentKm, 1)}</td><td className="px-3 py-3"><span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">{numberText(efficiency, 2)} KM/L</span></td><td className="px-3 py-3"><div className="flex items-center gap-1"><button onClick={() => { setModalRecord(record); setModalError(''); }} title="Edit record" className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-zinc-400 hover:bg-brand/15 hover:text-brand"><span className="material-icons text-[16px]">edit</span></button><button onClick={() => deleteRecord(record)} title="Delete record" className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-zinc-400 hover:bg-red-500/15 hover:text-red-300"><span className="material-icons text-[16px]">delete</span></button>{highConsumption && phone && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" title="Send high consumption WhatsApp alert" className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"><span className="material-icons text-[16px]">chat</span></a>}</div></td>
                                </tr>;
                            })}
                    </tbody></table></div>
                <div className="flex flex-col justify-between gap-3 border-t border-white/6 px-4 py-3 sm:flex-row sm:items-center"><span className="text-xs text-zinc-500">{filtered.length ? `${(page - 1) * (pageSize === 'all' ? filtered.length : pageSize) + 1}–${Math.min(page * (pageSize === 'all' ? filtered.length : pageSize), filtered.length)} of ${filtered.length}` : '0 records'}</span><div className="flex items-center gap-2"><label className="flex items-center gap-2 text-[10px] text-zinc-500">Rows<select value={pageSize} onChange={event => setPageSize(event.target.value === 'all' ? 'all' : Number(event.target.value))} className="rounded-lg border border-white/8 bg-[#101014] px-2 py-1.5 text-xs text-zinc-300 outline-none">{pageSizes.map(size => <option key={size} value={size}>{size === 'all' ? 'All' : size}</option>)}</select></label><button disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-zinc-300 disabled:opacity-30"><span className="material-icons text-[17px]">chevron_left</span></button><span className="min-w-16 text-center text-xs text-zinc-400">Page {page} / {totalPages}</span><button disabled={page >= totalPages || loading} onClick={() => setPage(value => value + 1)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-zinc-300 disabled:opacity-30"><span className="material-icons text-[17px]">chevron_right</span></button></div></div>
            </section>

            {modalRecord !== undefined && <RecordModal record={modalRecord} records={records} onClose={() => setModalRecord(undefined)} onSave={saveRecord} saving={saving} error={modalError} />}
            {toast && <div role="status" className="fixed bottom-5 right-5 z-[95] max-w-sm rounded-xl border border-emerald-500/20 bg-[#10231b] px-4 py-3 text-sm text-emerald-200 shadow-2xl">{toast}</div>}
        </div>
    );
}
