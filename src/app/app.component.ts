import { Component, OnInit, ViewChild } from '@angular/core';
import { SearchDataService } from './search-data.service';
import { Observable } from 'rxjs';
// tslint:disable-next-line:max-line-length
import { forkJoin, combineLatest, concat } from 'rxjs';
import { map, flatMap, filter, debounceTime, distinctUntilChanged, switchMap, merge } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AgGridNg2 } from 'ag-grid-angular/dist/agGridNg2';
import 'ag-grid-enterprise';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';
  private gridApi;

  private gridColumnApi;
  nameValueToCount = {};
  @ViewChild('agGrid') agGrid: AgGridNg2;
  rowData: any[] = [];
  columnDefs: any[];
  rowData$: Observable<any>;
  constructor(private fetchData: SearchDataService, private http: HttpClient) {

  }
  ngOnInit() {
    this.columnDefs = this.createColumnDefs();
    const fileOne$$: Observable<any> = this.fetchData.fethData('assets/export-data-tenant-1.json');
    const fileTwo$: Observable<any> = this.fetchData.fethData('assets/export-data-tenant-2.json');

    const test = combineLatest(fileOne$$, fileTwo$).pipe(map(latestValues => {
      const [defaultValue, overrideValue] = latestValues;
      const newArray = defaultValue.records.concat(overrideValue.records);
      return newArray;
    }));

    test.subscribe(data1 => {
      console.log(data1);
    });


    this.rowData$ = test
      .pipe(
        map((records: any) => {
          return records.map((item: any) => {
            return {
              kind: item.kind,
              viewers: item.acl.viewers[0].split('@')[0],
              owners: item.acl.owners[0].split('@')[0]
            };
          });
        })
      );
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  updateNameValueCounts() {
    this.nameValueToCount = {};
    this.gridApi.forEachNodeAfterFilter((node) => {
      // if (!this.nameValueToCount.hasOwnProperty(node.data.kind)) {
      //   this.nameValueToCount[node.data.kind] = 1;
      // } else {
      //   this.nameValueToCount[node.data.kind] = this.nameValueToCount[node.data.kind] + 1;
      // }
      this.nameValueToCount[node.key] = node.allChildrenCount;
    });
  }

  private createColumnDefs() {
    const columnDefs = [
      {
        headerName: '#',
        width: 30,
        checkboxSelection: true,
        suppressSorting: true,
        suppressMenu: true,
        pinned: true
      },
      {
        headerName: 'kind',
        field: 'kind',
        width: 170,
        rowGroup: 'true',
        filter: 'set',
        filterParams: {
          cellRenderer: this.NameFilterCellRenderer.bind(this)
        }
      },
      {
        headerName: 'Data Groups',
        children: [
          {
            headerName: 'viewers',
            field: 'viewers',
            width: 170,
            pinned: false,

          },
          {
            headerName: 'owners',
            field: 'owners',
            width: 170,
          }
        ]
      }
    ];
    return columnDefs;
  }

  getSelectedRows() {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    const selectedDataStringPresentation = selectedData.map(node => node.make + ' ' + node.model).join(', ');
    alert(`Selected nodes: ${selectedDataStringPresentation}`);
  }

  NameFilterCellRenderer(params) {
    this.updateNameValueCounts();
   const value = params.value;
   const eGui = document.createElement('span');
    eGui.appendChild(document.createTextNode(value + ' (' + this.nameValueToCount[params.value] + ')'));
   return eGui;
  }


}




// function NameFilterCellRenderer(myobj) {
//   myobj = myobj;
// }

// NameFilterCellRenderer.prototype.init = function (params) {

//   this.value = params.value;
//   this.eGui = document.createElement('span');
//   this.eGui.appendChild(document.createTextNode(this.value + ' (' + nameValueToCount[params.value] + ')'));

// };

// NameFilterCellRenderer.prototype.getGui = function () {
//   return this.eGui;
// };
