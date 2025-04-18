import type React from "react"
import { AgGridReact } from "ag-grid-react"
import type { Transaction } from "@/types"
import { formatCurrency, formatDisplayDateTime } from "@/utils/dateUtils"
import type { ColDef } from "ag-grid-community"
// Import only the core styles
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"

import { ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
]);


interface TransactionsTableProps {
    transactions: Transaction[]
    className?: string
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, className = "" }) => {
    const columnDefs: ColDef[] = [
        {
            headerName: "Activity",
            field: "activityName",
            filter: true,
            sortable: true,
            minWidth: 150,
            floatingFilter: true,
        },
        {
            headerName: "Date & Time",
            field: "timeStart",
            valueFormatter: (params) => formatDisplayDateTime(params.value),
            filter: true,
            sortable: true,
            minWidth: 180,
            floatingFilter: true,
        },
        {
            headerName: "Duration",
            field: "duration",
            valueFormatter: (params) => `${params.value} min`,
            filter: true,
            sortable: true,
            width: 120,
            floatingFilter: true,
        },
        {
            headerName: "Amount",
            field: "amount",
            valueFormatter: (params) => formatCurrency(params.value),
            cellStyle: (params) => ({
                color: params.value < 0 ? "#ef4444" : "inherit",
                fontWeight: "500",
            }),
            filter: true,
            sortable: true,
            width: 120,
            floatingFilter: true,
        },
        {
            headerName: "Payment",
            field: "paymentMethod",
            cellRenderer: (params: any) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${
                        params.value === "cash" ? "bg-green-400/20 text-green-400" : "bg-blue-400/20 text-blue-400"
                    }`}
                >
          {params.value}
        </span>
            ),
            filter: true,
            sortable: true,
            width: 120,
            floatingFilter: true,
        },
        {
            headerName: "Attendant",
            field: "userName",
            filter: true,
            sortable: true,
            minWidth: 150,
            floatingFilter: true,
        },
        {
            headerName: "Type",
            field: "isRefund",
            cellRenderer: (params: any) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${
                        params.value || params.data.amount < 0
                            ? "bg-yellow-400/20 text-yellow-400"
                            : "bg-green-400/20 text-green-400"
                    }`}
                >
          {params.value || params.data.amount < 0 ? "Refund" : "Sale"}
        </span>
            ),
            filter: true,
            sortable: true,
            width: 100,
            floatingFilter: true,
        },
    ]

    const defaultColDef = {
        resizable: true,
        suppressMovable: true,
        suppressMenu: true,
        wrapText: true,
        autoHeight: true,
    }

    // Define the custom styles inline to avoid external CSS file dependencies
    const customStyles = `
    .ag-theme-custom-game {
      --ag-background-color: transparent;
      --ag-odd-row-background-color: rgba(0, 0, 0, 0.03);
      --ag-header-background-color: rgba(0, 0, 0, 0.04);
      --ag-border-color: rgba(0, 0, 0, 0.1);
      --ag-row-border-color: rgba(0, 0, 0, 0.1);
      --ag-header-column-separator-display: block;
      --ag-header-column-separator-color: rgba(0, 0, 0, 0.1);
      --ag-header-column-separator-height: 50%;
      --ag-header-column-resize-handle-display: block;
      --ag-header-column-resize-handle-color: rgba(0, 0, 0, 0.3);
      --ag-font-size: 14px;
      --ag-cell-horizontal-padding: 16px;
    }

    .ag-theme-custom-game .ag-header-cell {
      font-weight: 600;
    }

    .ag-theme-custom-game .ag-row {
      border-bottom-style: solid;
      border-bottom-width: 1px;
      border-bottom-color: var(--ag-border-color);
    }

    .ag-theme-custom-game .ag-cell {
      display: flex;
      align-items: center;
    }

    .ag-theme-custom-game .ag-floating-filter-input {
      background-color: white; /* Ensure a solid background */
      border: 1px solid #000; /* Add a solid black border */
      border-radius: 4px;
      padding: 2px 8px;
      opacity: 1 !important; /* Ensure it's not transparent */
      color: #000; /* Ensure text is visible */
    }

    .ag-theme-custom-game .ag-floating-filter-input::placeholder {
      color: #777; /* Style the placeholder text */
    }

    .ag-theme-custom-game .ag-paging-panel {
      padding: 12px;
      border-top: 1px solid var(--ag-border-color);
    }
  `

    return (
        <div className={`h-full w-full ${className}`}>
            <style>{customStyles}</style>
            <div className="ag-theme-alpine ag-theme-custom-game" style={{ height: "100%", width: "100%" }}>
                <AgGridReact
                    rowData={transactions}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    paginationPageSize={20}
                    suppressCellFocus={true}
                    overlayNoRowsTemplate="<span class='text-muted-foreground'>No transactions found for the selected filters</span>"
                    headerHeight={48}
                    rowHeight={48}
                    theme="legacy"
                />
            </div>
        </div>
    )
}

export default TransactionsTable