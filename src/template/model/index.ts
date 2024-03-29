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
  const template = `export interface ${pojo} extends API.PageParams  {
  ${tableColArr
    .map((ele: CodeFaster.SqlColumn) => {
      let type = ele.columnType;
      if (
        ele.columnType === "Long" ||
        ele.columnType === "Integer" ||
        ele.columnType === "Double" ||
        ele.columnType === "Float" ||
        ele.columnType === "BigDecimal"
      ) {
        type = "number";
      }
      if (ele.columnType === "Boolean") {
        type = "boolean";
      }
      if (ele.columnType === "String") {
        type = "string";
      }
      return ele.columnName + "?:" + type + "; //" + ele.columnComment;
    })
    .join("\r\n\t")}
}
        `;
  fs.writeFileSync(
    path.join(params.releasePath, pojo + "/model.d.ts"),
    template
  );
}
