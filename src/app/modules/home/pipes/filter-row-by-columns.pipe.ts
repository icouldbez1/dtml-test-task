// import {Pipe, PipeTransform} from '@angular/core';
//
//
// interface Column {
//     name: string;
// }
//
// @Pipe({
//     name: 'filterRowByColumns'
// })
// export class FilterRowByColumnsPipe implements PipeTransform {
//     public transform(row: { [key: string]: any }, columns: { name: string }[]): { [key: string]: any }[] {
//         const arrayOfRowData: { [key: string]: any }[] = [];
//
//         return columns.map((column: Column) => {
//             let rowValue: any = '-';
//
//             if (row.hasOwnProperty(column.name)) {
//                 rowValue = row[column.name];
//             }
//
//             rowValue;
//         });
//
//
//     }
// }
