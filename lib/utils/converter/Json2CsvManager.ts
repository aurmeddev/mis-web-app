export class Json2CsvManager {
  async convertCsvToJSON(data: any) {
    const converter = require("json-2-csv");
    return await converter.csv2json(data, {});
  }

  async convertJsonToCSV(data: any) {
    const converter = require("json-2-csv");
    const result = await converter.json2csv(data, {});
    return result;
  }

  async exportToCSV(jsonData: any, exportName?: string) {
    const csv = await this.convertJsonToCSV(jsonData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const fileExportName = !exportName ? "export-data" : exportName;

    const todayDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileExportName}-${todayDate.replaceAll("/", "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }
}
