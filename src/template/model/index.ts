import fs from "fs";
import path from "path";
import { getParamVariableFormat, tranformHumpStr } from "../index";

export default function (
  project: CodeFaster.Project,
  params: CodeFaster.Params
) {
  /**
   * 检验参数是否正常
   */
  if (params.model == undefined) {
    throw new Error("model 必传");
  }
  const pojo = tranformHumpStr(params.model.tableName);
  /**
   * 根据传递的参数生成template需要的参数
   */
  const tableColArr = params.model.tableCloums;
  const template = `
export interface ${pojo} {
  ${tableColArr
    .map((ele: CodeFaster.SqlColumn) => {
      return ele.columnName + "?:" + ele.columnType + ";";
    })
    .join("\r\n\t")}
}

export interface PageParams {
  sorter?: string;
  status?: string;
  key?: number;
  current?: number;
  pageSize?: number;
}
        `;
  fs.writeFileSync(
    path.join(params.releasePath, pojo + "/model.d.ts"),
    template
  );
}
