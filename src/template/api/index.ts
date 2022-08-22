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
  const pojoVariable = getParamVariableFormat(pojo);
  const template = `
// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { ${pojo} } from './model';

/** 分页查询*/
export async function findPage(body: ${pojo}, options?: { [key: string]: any }) {
  return request<API.PageList>('/api/${pojoVariable}/find${pojo}Page', {
      method: 'POST',
      requestType: 'json',
      data: body,
      ...(options || {}),
  });
}

/** 新增 */
export async function add(body: ${pojo}, options?: { [key: string]: any }) {
  return request<API.ApiResult>('/api/${pojoVariable}/save${pojo}', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
  });
}

/** 更新 */
export async function update(body: ${pojo}, options?: { [key: string]: any }) {
  return request<API.ApiResult>('/api/${pojoVariable}/update${pojo}', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
  });
}
        `;
  fs.writeFileSync(path.join(params.releasePath, pojo + "/api.ts"), template);
}
