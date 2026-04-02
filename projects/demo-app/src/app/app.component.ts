import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  VioDashboardComponent,
  VioDashboardConfig,
  DashboardRecord,
  BuilderApiRequest,
  BuilderApiRow,
} from 'vio-dashboard';

// ── 20 mock records (no backend needed) ──────────────────────────────────────
const MOCK: DashboardRecord[] = [
  { vId:'C001', serialNo:'SN-1001', hpOrg:'HPI', entitleType:'Standard', prodName:'LaserJet Pro',  custName:'Acme Corp',      prtTypeName:'Toner',  TAT:'Normal',   caseStatus:'Closed', locName:'Mumbai',    CustomerSatisfaction:'Satisfied',   engineerName:'Ravi S.' },
  { vId:'C002', serialNo:'SN-1002', hpOrg:'HPE', entitleType:'Premium',  prodName:'ProLiant DL',   custName:'Beta Ltd',       prtTypeName:'Board',  TAT:'Breached', caseStatus:'Closed', locName:'Pune',      CustomerSatisfaction:'Neutral',     engineerName:'Anil K.' },
  { vId:'C003', serialNo:'SN-1003', hpOrg:'HPI', entitleType:'Standard', prodName:'OfficeJet',     custName:'Gamma Inc',      prtTypeName:'Fuser',  TAT:'Normal',   caseStatus:'Closed', locName:'Delhi',     CustomerSatisfaction:'Satisfied',   engineerName:'Ravi S.' },
  { vId:'C004', serialNo:'SN-1004', hpOrg:'HPE', entitleType:'Standard', prodName:'ProLiant DL',   custName:'Acme Corp',      prtTypeName:'PSU',    TAT:'Normal',   caseStatus:'Closed', locName:'Mumbai',    CustomerSatisfaction:'Dissatisfied',engineerName:'Suman R.' },
  { vId:'C005', serialNo:'SN-1005', hpOrg:'HPI', entitleType:'Premium',  prodName:'LaserJet Pro',  custName:'Delta Services', prtTypeName:'Toner',  TAT:'Normal',   caseStatus:'Closed', locName:'Chennai',   CustomerSatisfaction:'Satisfied',   engineerName:'Anil K.' },
  { vId:'C006', serialNo:'SN-1006', hpOrg:'HPI', entitleType:'Standard', prodName:'DesignJet',     custName:'Beta Ltd',       prtTypeName:'Ink',    TAT:'Breached', caseStatus:'Closed', locName:'Pune',      CustomerSatisfaction:'Neutral',     engineerName:'Ravi S.' },
  { vId:'C007', serialNo:'SN-1007', hpOrg:'HPE', entitleType:'Premium',  prodName:'MSA Storage',   custName:'Gamma Inc',      prtTypeName:'HDD',    TAT:'Normal',   caseStatus:'Closed', locName:'Delhi',     CustomerSatisfaction:'Satisfied',   engineerName:'Suman R.' },
  { vId:'C008', serialNo:'SN-1008', hpOrg:'HPI', entitleType:'Standard', prodName:'LaserJet Pro',  custName:'Acme Corp',      prtTypeName:'Board',  TAT:'Normal',   caseStatus:'Closed', locName:'Mumbai',    CustomerSatisfaction:'Satisfied',   engineerName:'Ravi S.' },
  { vId:'C009', serialNo:'SN-1009', hpOrg:'HPE', entitleType:'Standard', prodName:'ProLiant DL',   custName:'Epsilon Co',     prtTypeName:'RAM',    TAT:'Breached', caseStatus:'Closed', locName:'Hyderabad', CustomerSatisfaction:'Neutral',     engineerName:'Anil K.' },
  { vId:'C010', serialNo:'SN-1010', hpOrg:'HPI', entitleType:'Premium',  prodName:'OfficeJet',     custName:'Delta Services', prtTypeName:'Fuser',  TAT:'Normal',   caseStatus:'Closed', locName:'Chennai',   CustomerSatisfaction:'Satisfied',   engineerName:'Suman R.' },
  { vId:'C011', serialNo:'SN-1011', hpOrg:'HPE', entitleType:'Standard', prodName:'MSA Storage',   custName:'Acme Corp',      prtTypeName:'HDD',    TAT:'Normal',   caseStatus:'Closed', locName:'Mumbai',    CustomerSatisfaction:'Satisfied',   engineerName:'Ravi S.' },
  { vId:'C012', serialNo:'SN-1012', hpOrg:'HPI', entitleType:'Premium',  prodName:'LaserJet Pro',  custName:'Beta Ltd',       prtTypeName:'Toner',  TAT:'Normal',   caseStatus:'Closed', locName:'Pune',      CustomerSatisfaction:'Neutral',     engineerName:'Anil K.' },
  { vId:'C013', serialNo:'SN-1013', hpOrg:'HPE', entitleType:'Standard', prodName:'ProLiant DL',   custName:'Gamma Inc',      prtTypeName:'PSU',    TAT:'Breached', caseStatus:'Closed', locName:'Delhi',     CustomerSatisfaction:'Dissatisfied',engineerName:'Suman R.' },
  { vId:'C014', serialNo:'SN-1014', hpOrg:'HPI', entitleType:'Standard', prodName:'DesignJet',     custName:'Epsilon Co',     prtTypeName:'Ink',    TAT:'Normal',   caseStatus:'Closed', locName:'Hyderabad', CustomerSatisfaction:'Satisfied',   engineerName:'Ravi S.' },
  { vId:'C015', serialNo:'SN-1015', hpOrg:'HPE', entitleType:'Premium',  prodName:'MSA Storage',   custName:'Delta Services', prtTypeName:'RAM',    TAT:'Normal',   caseStatus:'Closed', locName:'Chennai',   CustomerSatisfaction:'Satisfied',   engineerName:'Anil K.' },
  { vId:'C016', serialNo:'SN-1016', hpOrg:'HPI', entitleType:'Standard', prodName:'LaserJet Pro',  custName:'Gamma Inc',      prtTypeName:'Toner',  TAT:'Breached', caseStatus:'Closed', locName:'Delhi',     CustomerSatisfaction:'Neutral',     engineerName:'Suman R.' },
  { vId:'C017', serialNo:'SN-1017', hpOrg:'HPE', entitleType:'Premium',  prodName:'ProLiant DL',   custName:'Beta Ltd',       prtTypeName:'Board',  TAT:'Normal',   caseStatus:'Closed', locName:'Pune',      CustomerSatisfaction:'Satisfied',   engineerName:'Ravi S.' },
  { vId:'C018', serialNo:'SN-1018', hpOrg:'HPI', entitleType:'Standard', prodName:'OfficeJet',     custName:'Acme Corp',      prtTypeName:'Fuser',  TAT:'Normal',   caseStatus:'Closed', locName:'Mumbai',    CustomerSatisfaction:'Satisfied',   engineerName:'Anil K.' },
  { vId:'C019', serialNo:'SN-1019', hpOrg:'HPE', entitleType:'Standard', prodName:'MSA Storage',   custName:'Epsilon Co',     prtTypeName:'HDD',    TAT:'Breached', caseStatus:'Closed', locName:'Hyderabad', CustomerSatisfaction:'Neutral',     engineerName:'Suman R.' },
  { vId:'C020', serialNo:'SN-1020', hpOrg:'HPI', entitleType:'Premium',  prodName:'DesignJet',     custName:'Delta Services', prtTypeName:'Ink',    TAT:'Normal',   caseStatus:'Closed', locName:'Chennai',   CustomerSatisfaction:'Satisfied',   engineerName:'Ravi S.' },
];

// ── Mock API fn for Builder mode (simulates 600ms network delay) ──────────────
function mockApiFn(_url: string, body: BuilderApiRequest): Promise<BuilderApiRow[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      const map = new Map<string, number>();
      MOCK.forEach(r => {
        const x = String(r[body.xParam] ?? 'Unknown');
        const y = body.yParam ? Number(r[body.yParam] ?? 0) : 1;
        map.set(x, (map.get(x) ?? 0) + y);
      });
      resolve(
        Array.from(map.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([xValue, yValue]) => ({ xValue, yValue }))
      );
    }, 600);
  });
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, VioDashboardComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  activeDemo: 'drill' | 'builder' = 'drill';

  // ── DRILL config ─────────────────────────────────────────────────────────
  drillConfig: VioDashboardConfig = {
    drillEnabled: true,
    colorPalettes: {
      hpOrg:      ['#1e6fb5', '#1a7f5a'],
      TAT:         ['#1a7f4b', '#b91c1c'],
      default:    ['#1e6fb5','#1a7f5a','#6b4fa8','#b07d1e','#2a7f8f','#a84f4f','#4f7a1e','#4f5ea8'],
    },
    drill: {
      apiUrl: '',
      fieldMap: (item: any) => item,
      chartDefs: [
        { id:'cv0', title:'HPE / HPI',       subtitle:'Brand split',            dataKey:'hpOrg',                chartType:'doughnut', filterKey:'hpOrg'               },
        { id:'cv1', title:'Product Name',    subtitle:'Product breakdown',      dataKey:'prodName',             chartType:'bar',      filterKey:'prodName'            },
        { id:'cv2', title:'Part Type',       subtitle:'Part type breakdown',    dataKey:'prtTypeName',          chartType:'bar',      filterKey:'prtTypeName'         },
        { id:'cv3', title:'Customer',        subtitle:'Customer breakdown',     dataKey:'custName',             chartType:'doughnut', filterKey:'custName'            },
        { id:'cv4', title:'Engineer',        subtitle:'Engineer assignments',   dataKey:'engineerName',         chartType:'doughnut', filterKey:'engineerName'        },
        { id:'cv5', title:'TAT Status',      subtitle:'TAT compliance',         dataKey:'TAT',                  chartType:'doughnut', filterKey:'TAT'                 },
        { id:'cv6', title:'Satisfaction',    subtitle:'Customer satisfaction',  dataKey:'CustomerSatisfaction', chartType:'bar',      filterKey:'CustomerSatisfaction'},
        { id:'cv7', title:'Location',        subtitle:'City breakdown',         dataKey:'locName',              chartType:'bar',      filterKey:'locName'             },
      ],
      columns: [
        { key:'vId',                   display:'Case ID',       datatype:'string' },
        { key:'serialNo',              display:'Serial No',     datatype:'string' },
        { key:'custName',              display:'Customer',      datatype:'string' },
        { key:'prodName',              display:'Product',       datatype:'string' },
        { key:'prtTypeName',           display:'Part Type',     datatype:'string' },
        { key:'hpOrg',                 display:'Brand',         datatype:'string' },
        { key:'TAT',                   display:'TAT',           datatype:'string' },
        { key:'CustomerSatisfaction',  display:'Satisfaction',  datatype:'string' },
        { key:'engineerName',          display:'Engineer',      datatype:'string' },
        { key:'locName',               display:'Location',      datatype:'string' },
      ],
      kpis: [
        { label:'Total Closed', countAll:true,            sub:'All closed calls',    color:'#1a7f5a' },
        { label:'Normal TAT',   statusValue:'Normal',     sub:'Within SLA',          color:'#1e6fb5' },
        { label:'Breached TAT', statusValue:'Breached',   sub:'Exceeded SLA',        color:'#b91c1c' },
        { label:'Satisfied',    statusValue:'Satisfied',  sub:'Happy customers',     color:'#6b4fa8' },
      ],
    },
  };

  drillRecords: DashboardRecord[] = MOCK;

  // ── BUILDER config ────────────────────────────────────────────────────────
  builderConfig: VioDashboardConfig = {
    drillEnabled: false,
    colorPalettes: {
      default: ['#1e6fb5','#1a7f5a','#6b4fa8','#b07d1e','#2a7f8f','#a84f4f','#4f7a1e','#4f5ea8'],
    },
    builder: {
      apiUrl: '/api/dashboard/builder',
      showDateRange: true,
      xParams: [
        { key:'hpOrg',                label:'Brand (HPI / HPE)' },
        { key:'prodName',             label:'Product Name'       },
        { key:'prtTypeName',          label:'Part Type'          },
        { key:'custName',             label:'Customer'           },
        { key:'engineerName',         label:'Engineer'           },
        { key:'TAT',                  label:'TAT Status'         },
        { key:'CustomerSatisfaction', label:'Customer Satisfaction' },
        { key:'locName',              label:'Location'           },
        { key:'entitleType',          label:'Entitlement Type'   },
      ],
      yParams: [
        // In real use these would be numeric fields like repairCost, partQty etc.
        // For demo, we have no numeric fields so keep it empty (Count is always the default)
      ],
      initialCharts: [
        { id:'init-1', title:'Parts by Brand',   xParam:{ key:'hpOrg',    label:'Brand (HPI / HPE)' }, yParam:null, chartType:'doughnut' },
        { id:'init-2', title:'Parts by Product', xParam:{ key:'prodName', label:'Product Name'       }, yParam:null, chartType:'bar'      },
      ],
    },
  };

  builderApiFn = mockApiFn;

  switchDemo(mode: 'drill' | 'builder'): void {
    this.activeDemo = mode;
  }
}
