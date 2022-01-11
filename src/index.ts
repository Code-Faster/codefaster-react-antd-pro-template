import fs from "fs";
import path from "path";
import page from "./template/page/index";
import model from "./template/model/index";
import api from "./template/api/index";
import { TemplateTools, tranformHumpStr } from "./template/index";

export default class CodeGenerator implements CodeFaster.AdminCodeGenerator {
  project: CodeFaster.Project;
  constructor(project: CodeFaster.Project) {
    if (project.type !== 2) {
      throw Error("模版类型不一致");
    }
    this.project = project;
  }

  init() {
    const tools = new TemplateTools(this.project);
    tools.init();
  }

  generatorPage(params: CodeFaster.Params) {
    if (params.model?.tableName) {
      // 先生成CURD目录
      const dir = path.join(
        params.releasePath,
        tranformHumpStr(params.model?.tableName)
      );
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      // 生成模型对象
      model(this.project, params);
      // 生成接口
      api(this.project, params);
      // 生成页面
      page(this.project, params);
    } else {
      throw Error("tableName不能为空");
    }
  }

  updateProjectConfig() {
    const tools = new TemplateTools(this.project);
    return tools.updateProjectConfig();
  }
}
